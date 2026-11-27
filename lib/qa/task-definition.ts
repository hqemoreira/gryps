/**
 * Structured development task registration (P6-S5).
 * Incomplete mandatory fields ⇒ validation failure (QA must BLOCKED, never PASS).
 */

export const DEV_TASK_SCHEMA = "gryps-dev-task-v0" as const;

export type DevelopmentTaskDefinition = {
  schema: typeof DEV_TASK_SCHEMA;
  taskId: string;
  objective: string;
  description: string;
  /** Declared in-scope path prefixes (posix-style, repo-relative) */
  scope: string[];
  exclusions: string[];
  acceptanceCriteria: string[];
  expectedAffectedComponents: string[];
  /** Explicit validators; empty means auto-select from impact map + mandatory baseline */
  requiredValidators: string[];
  protectedBoundaries: string[];
  baselineId: string;
};

export type TaskValidationResult = {
  valid: boolean;
  missing: string[];
  errors: string[];
};

function blank(s: unknown): boolean {
  return typeof s !== "string" || s.trim() === "";
}

export function validateDevelopmentTask(
  task: Partial<DevelopmentTaskDefinition> | null | undefined
): TaskValidationResult {
  const missing: string[] = [];
  const errors: string[] = [];
  if (!task) {
    return { valid: false, missing: ["task"], errors: ["Task definition is required"] };
  }
  if (task.schema !== DEV_TASK_SCHEMA) missing.push("schema");
  if (blank(task.taskId)) missing.push("taskId");
  if (blank(task.objective)) missing.push("objective");
  if (blank(task.description)) missing.push("description");
  if (!Array.isArray(task.scope) || task.scope.length === 0) missing.push("scope");
  if (!Array.isArray(task.exclusions)) missing.push("exclusions");
  if (!Array.isArray(task.acceptanceCriteria) || task.acceptanceCriteria.length === 0) {
    missing.push("acceptanceCriteria");
  }
  if (!Array.isArray(task.expectedAffectedComponents)) {
    missing.push("expectedAffectedComponents");
  }
  if (!Array.isArray(task.requiredValidators)) missing.push("requiredValidators");
  if (!Array.isArray(task.protectedBoundaries) || task.protectedBoundaries.length === 0) {
    missing.push("protectedBoundaries");
  }
  if (blank(task.baselineId)) missing.push("baselineId");

  if (task.scope?.some((s) => blank(s))) errors.push("scope contains empty entries");
  if (task.acceptanceCriteria?.some((s) => blank(s))) {
    errors.push("acceptanceCriteria contains empty entries");
  }

  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors,
  };
}

export function createDevelopmentTask(
  partial: Omit<DevelopmentTaskDefinition, "schema"> & { schema?: string }
): DevelopmentTaskDefinition {
  return {
    schema: DEV_TASK_SCHEMA,
    taskId: partial.taskId,
    objective: partial.objective,
    description: partial.description,
    scope: partial.scope,
    exclusions: partial.exclusions ?? [],
    acceptanceCriteria: partial.acceptanceCriteria,
    expectedAffectedComponents: partial.expectedAffectedComponents ?? [],
    requiredValidators: partial.requiredValidators ?? [],
    protectedBoundaries: partial.protectedBoundaries,
    baselineId: partial.baselineId,
  };
}
