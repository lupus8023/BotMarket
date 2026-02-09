import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, keccak256, toHex } from "viem";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/abi";
import { ESCROW_CONTRACT, PAYMENT_TOKEN } from "@/lib/wagmi";
import { bsc } from "wagmi/chains";

const chainId = bsc.id;
const escrowAddress = ESCROW_CONTRACT[chainId] as `0x${string}`;
const tokenAddress = PAYMENT_TOKEN[chainId] as `0x${string}`;

export function useEscrow() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Generate taskId from string
  const generateTaskId = (id: string) => keccak256(toHex(id));

  // Approve token spending
  const approveToken = async (amount: string) => {
    const value = parseUnits(amount, 6); // 6 decimals
    writeContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [escrowAddress, value],
    });
  };

  // Create task on chain
  const createTask = async (taskId: string, budget: string, deadlineHours: number) => {
    const taskIdBytes = generateTaskId(taskId);
    const budgetValue = parseUnits(budget, 6);
    const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineHours * 3600);

    writeContract({
      address: escrowAddress,
      abi: ESCROW_ABI,
      functionName: "createTask",
      args: [taskIdBytes, budgetValue, deadline],
    });
  };

  // Claim task
  const claimTask = async (taskId: string, bondAmount: string) => {
    const taskIdBytes = generateTaskId(taskId);
    const bond = parseUnits(bondAmount, 6);

    writeContract({
      address: escrowAddress,
      abi: ESCROW_ABI,
      functionName: "claimTask",
      args: [taskIdBytes, bond],
    });
  };

  // Confirm task completion
  const confirmTask = async (taskId: string) => {
    const taskIdBytes = generateTaskId(taskId);
    writeContract({
      address: escrowAddress,
      abi: ESCROW_ABI,
      functionName: "confirmTask",
      args: [taskIdBytes],
    });
  };

  return {
    approveToken,
    createTask,
    claimTask,
    confirmTask,
    generateTaskId,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  };
}
