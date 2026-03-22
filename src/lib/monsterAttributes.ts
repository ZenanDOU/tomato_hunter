import type { TaskCategory, TaskDifficulty } from "../types";
import { selectSpecies } from "./bestiary";

/** 分类对应的标签颜色 */
export const CATEGORY_TAG_COLOR: Record<TaskCategory, string> = {
  work: "bg-[#FF8844]/20 text-[#FF8844]",
  creative: "bg-[#8877AA]/20 text-[#8877AA]",
  study: "bg-[#5588CC]/20 text-[#5588CC]",
  life: "bg-[#5BBF47]/20 text-[#5BBF47]",
  other: "bg-[#55AAAA]/20 text-[#55AAAA]",
};

/**
 * 根据 category + difficulty + taskName 查找种族，返回该种族的固定特性。
 * 每个特性序列化为 "icon name·desc" 格式的字符串。
 */
export function generateAttributes(
  category: TaskCategory,
  difficulty: TaskDifficulty,
  taskName: string
): string[] {
  const species = selectSpecies(category, taskName, difficulty);
  return species.traits.map((t) => `${t.icon} ${t.name}·${t.desc}`);
}

/** 解析 monster_variant 字段，兼容旧格式 */
export function parseMonsterVariant(variant: string): {
  variant: string;
  attributes: string[];
} {
  if (!variant || variant === "normal" || variant === "rare") {
    return { variant: variant || "normal", attributes: [] };
  }
  try {
    const parsed = JSON.parse(variant);
    return {
      variant: parsed.variant || "normal",
      attributes: parsed.attributes || [],
    };
  } catch {
    return { variant: variant, attributes: [] };
  }
}

/** 序列化 monster_variant 字段 */
export function serializeMonsterVariant(
  variant: string,
  attributes: string[]
): string {
  return JSON.stringify({ variant, attributes });
}
