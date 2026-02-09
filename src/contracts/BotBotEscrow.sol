// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BotBotEscrow
 * @dev 任务托管支付合约
 */
contract BotBotEscrow is Ownable, ReentrancyGuard {

    // 任务状态
    enum TaskStatus {
        Open,       // 等待抢单
        Claimed,    // 已抢单
        Delivered,  // 已交付
        Confirmed,  // 已确认（完成）
        Disputed,   // 争议中
        Cancelled   // 已取消
    }

    // 任务结构
    struct Task {
        address buyer;
        address seller;
        uint256 budget;
        uint256 platformFee;
        uint256 sellerBond;
        TaskStatus status;
        uint256 deadline;
        uint256 confirmDeadline;
    }

    // 支付代币（你的token地址）
    IERC20 public paymentToken;

    // 平台费率 (basis points, 100 = 1%)
    uint256 public platformFeeRate = 500; // 5%

    // 自动确认时间 (48小时)
    uint256 public autoConfirmPeriod = 48 hours;

    // 任务存储
    mapping(bytes32 => Task) public tasks;

    // 事件
    event TaskCreated(bytes32 indexed taskId, address buyer, uint256 budget);
    event TaskClaimed(bytes32 indexed taskId, address seller);
    event TaskDelivered(bytes32 indexed taskId);
    event TaskConfirmed(bytes32 indexed taskId);
    event TaskDisputed(bytes32 indexed taskId);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @dev 买家创建任务
     */
    function createTask(
        bytes32 taskId,
        uint256 budget,
        uint256 deadline
    ) external nonReentrant {
        require(tasks[taskId].buyer == address(0), "Task exists");
        require(budget > 0, "Budget must be > 0");

        uint256 fee = (budget * platformFeeRate) / 10000;
        uint256 total = budget + fee;

        // 转入托管
        require(
            paymentToken.transferFrom(msg.sender, address(this), total),
            "Transfer failed"
        );

        tasks[taskId] = Task({
            buyer: msg.sender,
            seller: address(0),
            budget: budget,
            platformFee: fee,
            sellerBond: 0,
            status: TaskStatus.Open,
            deadline: deadline,
            confirmDeadline: 0
        });

        emit TaskCreated(taskId, msg.sender, budget);
    }

    /**
     * @dev Bot抢单（需要押金）
     */
    function claimTask(bytes32 taskId, uint256 bond) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Open, "Not open");
        require(block.timestamp < task.deadline, "Expired");

        if (bond > 0) {
            require(
                paymentToken.transferFrom(msg.sender, address(this), bond),
                "Bond transfer failed"
            );
        }

        task.seller = msg.sender;
        task.sellerBond = bond;
        task.status = TaskStatus.Claimed;

        emit TaskClaimed(taskId, msg.sender);
    }

    /**
     * @dev Bot提交交付
     */
    function deliverTask(bytes32 taskId) external {
        Task storage task = tasks[taskId];
        require(task.seller == msg.sender, "Not seller");
        require(task.status == TaskStatus.Claimed, "Not claimed");

        task.status = TaskStatus.Delivered;
        task.confirmDeadline = block.timestamp + autoConfirmPeriod;

        emit TaskDelivered(taskId);
    }

    /**
     * @dev 买家确认完成
     */
    function confirmTask(bytes32 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.buyer == msg.sender, "Not buyer");
        require(task.status == TaskStatus.Delivered, "Not delivered");

        _settleTask(taskId);
    }

    /**
     * @dev 超时自动确认（任何人可调用）
     */
    function autoConfirm(bytes32 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Delivered, "Not delivered");
        require(block.timestamp >= task.confirmDeadline, "Not expired");

        _settleTask(taskId);
    }

    /**
     * @dev 内部结算函数
     */
    function _settleTask(bytes32 taskId) internal {
        Task storage task = tasks[taskId];

        // 支付给卖家
        uint256 sellerPayout = task.budget + task.sellerBond;
        require(
            paymentToken.transfer(task.seller, sellerPayout),
            "Seller payment failed"
        );

        // 平台费转给owner
        require(
            paymentToken.transfer(owner(), task.platformFee),
            "Fee transfer failed"
        );

        task.status = TaskStatus.Confirmed;
        emit TaskConfirmed(taskId);
    }

    /**
     * @dev 买家发起争议
     */
    function disputeTask(bytes32 taskId) external {
        Task storage task = tasks[taskId];
        require(task.buyer == msg.sender, "Not buyer");
        require(task.status == TaskStatus.Delivered, "Not delivered");
        require(block.timestamp < task.confirmDeadline, "Window closed");

        task.status = TaskStatus.Disputed;
        emit TaskDisputed(taskId);
    }

    /**
     * @dev 平台仲裁（仅owner）
     * @param buyerPercent 买家获得的比例 (0-100)
     */
    function resolveDispute(
        bytes32 taskId,
        uint256 buyerPercent
    ) external onlyOwner nonReentrant {
        Task storage task = tasks[taskId];
        require(task.status == TaskStatus.Disputed, "Not disputed");
        require(buyerPercent <= 100, "Invalid percent");

        uint256 total = task.budget + task.sellerBond;
        uint256 buyerAmount = (total * buyerPercent) / 100;
        uint256 sellerAmount = total - buyerAmount;

        if (buyerAmount > 0) {
            paymentToken.transfer(task.buyer, buyerAmount);
        }
        if (sellerAmount > 0) {
            paymentToken.transfer(task.seller, sellerAmount);
        }
        paymentToken.transfer(owner(), task.platformFee);

        task.status = TaskStatus.Confirmed;
        emit TaskConfirmed(taskId);
    }

    /**
     * @dev 买家取消任务（仅Open状态）
     */
    function cancelTask(bytes32 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(task.buyer == msg.sender, "Not buyer");
        require(task.status == TaskStatus.Open, "Cannot cancel");

        uint256 refund = task.budget + task.platformFee;
        paymentToken.transfer(task.buyer, refund);

        task.status = TaskStatus.Cancelled;
    }

    /**
     * @dev 设置平台费率（仅owner）
     */
    function setPlatformFeeRate(uint256 newRate) external onlyOwner {
        require(newRate <= 1000, "Max 10%");
        platformFeeRate = newRate;
    }
}
