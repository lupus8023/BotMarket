export const ESCROW_ABI = [
  {
    inputs: [{ name: "_paymentToken", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "budget", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
    name: "createTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "taskId", type: "bytes32" },
      { name: "bond", type: "uint256" },
    ],
    name: "claimTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "taskId", type: "bytes32" }],
    name: "deliverTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "taskId", type: "bytes32" }],
    name: "confirmTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "taskId", type: "bytes32" }],
    name: "autoConfirm",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "taskId", type: "bytes32" }],
    name: "disputeTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "taskId", type: "bytes32" }],
    name: "cancelTask",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "taskId", type: "bytes32" }],
    name: "tasks",
    outputs: [
      { name: "buyer", type: "address" },
      { name: "seller", type: "address" },
      { name: "budget", type: "uint256" },
      { name: "platformFee", type: "uint256" },
      { name: "sellerBond", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "deadline", type: "uint256" },
      { name: "confirmDeadline", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ERC20_ABI = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
