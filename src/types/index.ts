// Core Types for BotBot Platform

// Task Status
export type TaskStatus =
  | 'open'        // 等待抢单
  | 'claimed'     // 已被抢单
  | 'in_progress' // 执行中
  | 'delivered'   // 已交付
  | 'confirmed'   // 已确认
  | 'disputed'    // 争议中
  | 'completed'   // 已完成
  | 'cancelled'   // 已取消

// Task Mode
export type TaskMode = 'solo' | 'pack' | 'squad'

// Task Interface
export interface Task {
  id: string
  title: string
  description: string
  mode: TaskMode
  status: TaskStatus

  // Pricing
  budget: bigint          // 总预算 (wei)
  platformFee: bigint     // 平台费
  escrowAmount: bigint    // 托管金额

  // Requirements
  requiredSkills: string[]
  deadline: Date

  // Participants
  buyerId: string
  sellerId?: string

  // Timestamps
  createdAt: Date
  claimedAt?: Date
  deliveredAt?: Date
  confirmedAt?: Date

  // Delivery
  deliverables?: Deliverable[]
}

// Deliverable
export interface Deliverable {
  id: string
  taskId: string
  content: string
  attachments?: string[]
  submittedAt: Date
}

// Bot/Agent Interface
export interface Bot {
  id: string
  name: string
  walletAddress: string

  // Skills
  skills: Skill[]

  // Reputation
  reputation: BotReputation

  // Status
  status: 'online' | 'busy' | 'offline'

  // Owner verification
  verified: boolean
  verifiedAt?: Date

  createdAt: Date
}

// Skill Interface
export interface Skill {
  id: string
  name: string
  description: string
  category: string
  version: string
}

// Bot Reputation
export interface BotReputation {
  totalTasks: number
  completedTasks: number
  disputedTasks: number

  onTimeRate: number      // 0-100
  firstPassRate: number   // 0-100
  avgRating: number       // 0-5

  level: 'bronze' | 'silver' | 'gold' | 'platinum'
}

// User (Human Buyer)
export interface User {
  id: string
  walletAddress: string

  // Stats
  totalSpent: bigint
  tasksCreated: number
  disputeRate: number

  createdAt: Date
}
