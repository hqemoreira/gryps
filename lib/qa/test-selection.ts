import {
  MANDATORY_BASELINE_VALIDATORS,
  type ValidatorId,
  validatorsForPaths,
} from "@/lib/qa/impact-map";
import type { ChangeInventory } from "@/lib/qa/change-inventory";
import type { DevelopmentTaskDefinition } from "@/lib/qa/task-definition";

export type SelectedCheck = {
  id: ValidatorId;
  required: boolean;
  reason: string;
  status: "selected" | "skipped";
  skipReason?: string;
};

export type TestSelectionResult = {
  selected: SelectedCheck[];
  components: string[];
  unmappedPaths: string[];
};

export function selectValidatorsForTask(
  task: DevelopmentTaskDefinition,
  inventory: ChangeInventory,
  options?: {
    /** When set, these required checks are marked skipped (scenario testing) */
    forceSkip?: ValidatorId[];
    /** Pre-seeded failure results for scenario testing */
    forceFail?: ValidatorId[];
  }
): TestSelectionResult {
  const paths = inventory.entries.map((e) => e.path);
  const impact = validatorsForPaths(paths);

  const selectedMap = new Map<ValidatorId, SelectedCheck>();

  function add(id: ValidatorId, required: boolean, reason: string) {
    const existing = selectedMap.get(id);
    if (existing) {
      existing.required = existing.required || required;
      if (!existing.reason.includes(reason)) existing.reason += `; ${reason}`;
      return;
    }
    selectedMap.set(id, { id, required, reason, status: "selected" });
  }

  for (const id of MANDATORY_BASELINE_VALIDATORS) {
    add(id, true, "mandatory baseline");
  }

  for (const id of task.requiredValidators as ValidatorId[]) {
    if (id) add(id, true, "task.requiredValidators");
  }

  for (const id of impact.validators) {
    add(id, true, `impact:${impact.components.join(",")}`);
  }

  for (const id of options?.forceSkip ?? []) {
    const row = selectedMap.get(id);
    if (row) {
      row.status = "skipped";
      row.skipReason = "forced skip for scenario / unavailable";
      row.required = true;
    } else {
      selectedMap.set(id, {
        id,
        required: true,
        reason: "mandatory but skipped",
        status: "skipped",
        skipReason: "forced skip for scenario / unavailable",
      });
    }
  }

  // forceFail is recorded by pipeline when executing — selection still lists them
  void options?.forceFail;

  return {
    selected: [...selectedMap.values()],
    components: impact.components,
    unmappedPaths: impact.unmappedPaths,
  };
}
