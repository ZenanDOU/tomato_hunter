import { useSettingsStore } from "../../stores/settingsStore";
import { useTaskStore } from "../../stores/taskStore";
import { PixelCard } from "./PixelCard";

/**
 * Quest-based onboarding system.
 * Instead of overlay tooltips, shows inline narrative cards
 * within each section based on the user's actual progress.
 *
 * Quest flow:
 * 0 - No tasks yet → show in Inbox
 * 1 - Has unidentified tasks → show in Inbox
 * 2 - Has monsters but none in plan → show in HuntList / Plan
 * 3 - Has planned tasks → show in Plan
 * 4 - First hunt completed → onboarding done
 */

const QUEST_STORIES: Record<number, { title: string; text: string; hint: string }> = {
  0: {
    title: "猎人，欢迎来到前线",
    text: "村庄周围出现了大量拖延怪物，它们偷走了村民们的番茄。作为新到的猎人，你的第一步是侦查敌情——把你要完成的任务记录下来，我们的探测器会帮你找出潜伏的怪物。",
    hint: "点击「+ 新任务」创建你的第一个任务",
  },
  1: {
    title: "侦测到怪物气息!",
    text: "探测器捕捉到了拖延能量的波动！点击「侦查」按钮来揭露这只怪物的真面目——了解它的种族、属性和弱点，为狩猎做好准备。",
    hint: "点击任务旁的「侦查」按钮",
  },
  2: {
    title: "目标已锁定",
    text: "干得好！你已经发现了第一只拖延怪物。现在去「今日」页面规划你的番茄预算，把这只怪物加入今天的讨伐计划，然后用一个番茄钟的时间去击败它!",
    hint: "切换到「今日」标签，设置预算并添加狩猎目标",
  },
  3: {
    title: "万事俱备",
    text: "狩猎计划已就绪！点击「出击」开始你的第一次番茄钟狩猎。专注工作就是战斗——每完成一个番茄钟，怪物就会受到伤害。坚持下去，直到击败它!",
    hint: "点击「出击」按钮开始狩猎",
  },
};

/** Determines current quest step based on actual task state */
export function useOnboardingQuest(): number | null {
  const { onboardingCompleted, setOnboardingCompleted } = useSettingsStore();
  const { tasks } = useTaskStore();

  if (onboardingCompleted) return null;

  const hasKilled = tasks.some((t) => t.status === "killed");
  if (hasKilled) {
    // Auto-complete onboarding when first monster is killed
    setOnboardingCompleted(true);
    return null;
  }

  const hasTasks = tasks.length > 0;
  const hasUnidentified = tasks.some((t) => t.status === "unidentified");
  const hasMonsters = tasks.some(
    (t) => t.status === "ready" || t.status === "hunting"
  );

  if (hasMonsters) return 3; // has monsters, guide to hunt
  if (hasUnidentified) return 1; // has tasks, guide to identify
  if (hasTasks) return 2; // edge case
  return 0; // no tasks at all
}

/** Inline quest card for onboarding */
export function QuestCard({ step }: { step: number }) {
  const story = QUEST_STORIES[step];
  if (!story) return null;

  return (
    <PixelCard bg="dark" padding="md" className="border-l-4 border-l-sunny">
      <div className="flex flex-col gap-1.5">
        <div className="text-sm font-bold text-sunny">{story.title}</div>
        <p className="text-xs text-white/80 leading-relaxed">{story.text}</p>
        <p className="text-xs text-sunny/70 mt-0.5">
          {story.hint}
        </p>
      </div>
    </PixelCard>
  );
}
