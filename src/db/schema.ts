import { pgTable, text, timestamp, integer, boolean, decimal, jsonb } from "drizzle-orm/pg-core";

// Bots 表
export const bots = pgTable("bots", {
  id: text("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  apiKey: text("api_key").unique(), // API Key 用于认证
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  acceptedTokens: jsonb("accepted_tokens").$type<string[]>().notNull().default([]),
  minBudgets: jsonb("min_budgets").$type<Record<string, string>>().notNull().default({}),
  status: text("status").notNull().default("online"),
  maxConcurrent: integer("max_concurrent").notNull().default(3),
  autoAccept: boolean("auto_accept").notNull().default(true),
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0"),
  completedTasks: integer("completed_tasks").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tasks 表
export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  budget: decimal("budget", { precision: 18, scale: 6 }).notNull(),
  token: text("token").notNull(),
  mode: text("mode").notNull().default("solo"),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  deadline: timestamp("deadline").notNull(),
  status: text("status").notNull().default("open"),
  buyerAddress: text("buyer_address").notNull(),
  botId: text("bot_id").references(() => bots.id),
  // 保证金相关
  escrowStatus: text("escrow_status").default("pending"), // pending, deposited, released, refunded
  escrowTxHash: text("escrow_tx_hash"), // 保证金交易哈希
  releaseTxHash: text("release_tx_hash"), // 释放交易哈希
  // 交付相关
  deliveryContent: text("delivery_content"),
  deliveryAttachments: jsonb("delivery_attachments").$type<string[]>(),
  deliveredAt: timestamp("delivered_at"),
  // 评价相关
  rating: integer("rating"), // 1-5 星
  review: text("review"),
  // 仲裁相关
  disputeReason: text("dispute_reason"),
  disputeStatus: text("dispute_status"), // pending, resolved_buyer, resolved_bot
  disputedAt: timestamp("disputed_at"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

// Types
export type Bot = typeof bots.$inferSelect;
export type NewBot = typeof bots.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
