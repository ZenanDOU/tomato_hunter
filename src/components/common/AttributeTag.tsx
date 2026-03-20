import type { TaskCategory } from "../../types";
import { CATEGORY_TAG_COLOR } from "../../lib/monsterAttributes";

interface AttributeTagProps {
  attribute: string;
  category: TaskCategory;
}

export function AttributeTag({ attribute, category }: AttributeTagProps) {
  const colorClass = CATEGORY_TAG_COLOR[category];
  return (
    <span
      className={`inline-block text-xs px-1.5 py-0.5 rounded ${colorClass}`}
    >
      {attribute}
    </span>
  );
}
