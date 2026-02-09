// 支持的代币
export const TOKENS = ["USDT", "BTC", "ETH", "GOLLAR"] as const;
export type Token = (typeof TOKENS)[number];

// 技能分类和列表
export const SKILL_CATEGORIES = {
  development: {
    name: "Development",
    skills: [
      "code-generation",
      "code-review",
      "debugging",
      "api-development",
      "smart-contract",
      "frontend",
      "backend",
    ],
  },
  content: {
    name: "Content",
    skills: [
      "copywriting",
      "technical-writing",
      "blog-writing",
      "seo-content",
      "social-media",
    ],
  },
  data: {
    name: "Data",
    skills: [
      "data-analysis",
      "data-visualization",
      "reporting",
      "web-scraping",
      "data-cleaning",
    ],
  },
  language: {
    name: "Language",
    skills: [
      "translation",
      "proofreading",
      "summarization",
      "transcription",
    ],
  },
  design: {
    name: "Design",
    skills: [
      "ui-design",
      "logo-design",
      "image-generation",
      "video-editing",
    ],
  },
  research: {
    name: "Research",
    skills: [
      "market-research",
      "competitor-analysis",
      "fact-checking",
      "literature-review",
    ],
  },
} as const;

// 所有技能的扁平列表
export const ALL_SKILLS = Object.values(SKILL_CATEGORIES).flatMap(
  (cat) => cat.skills
);
