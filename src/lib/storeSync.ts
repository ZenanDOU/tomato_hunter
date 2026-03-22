import { useTaskStore } from "../stores/taskStore";
import { usePlanStore } from "../stores/planStore";
import { useInventoryStore } from "../stores/inventoryStore";
import { useFarmStore } from "../stores/farmStore";

export async function syncAfterHuntComplete(): Promise<void> {
  await Promise.all([
    useTaskStore.getState().fetchTasks(),
    usePlanStore.getState().fetchTodayPlan(),
    useInventoryStore.getState().fetchAll(),
  ]);
}

export async function syncAfterTaskRelease(): Promise<void> {
  await Promise.all([
    useTaskStore.getState().fetchTasks(),
    usePlanStore.getState().fetchTodayPlan(),
  ]);
}

export async function syncAfterCraft(): Promise<void> {
  await useInventoryStore.getState().fetchAll();
}

export async function syncAfterFarmUpdate(): Promise<void> {
  await useFarmStore.getState().fetchFarm();
}
