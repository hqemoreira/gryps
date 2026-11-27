/**
 * Attribute working-tree deltas to a task using start vs completion snapshots.
 */
import { isProtectedPath, type ChangeEntry, type ChangeInventory } from "@/lib/qa/change-inventory";
import type { SnapshotFileRecord, TaskSnapshot } from "@/lib/qa/task-snapshot";

export type AttributionStatus =
  | "NEW_TASK_CHANGE"
  | "PRE_EXISTING_CHANGE"
  | "MODIFIED_PRE_EXISTING_FILE"
  | "AMBIGUOUS"
  | "UNCHANGED";

export type AttributedChange = {
  path: string;
  attribution: AttributionStatus;
  protected: boolean;
  start?: SnapshotFileRecord;
  end?: SnapshotFileRecord;
  note: string;
};

export type AttributionReport = {
  taskId: string;
  startSnapshotId: string;
  endSnapshotId: string;
  comparedAt: string;
  changes: AttributedChange[];
  preExistingDirty: string[];
  newTaskChanges: string[];
  modifiedPreExisting: string[];
  ambiguous: string[];
  protectedChanges: string[];
  criticalAmbiguous: string[];
};

function indexFiles(snap: TaskSnapshot): Map<string, SnapshotFileRecord> {
  return new Map(snap.files.map((f) => [f.path, f]));
}

function sameFingerprint(a?: SnapshotFileRecord, b?: SnapshotFileRecord): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.exists !== b.exists) return false;
  if (a.unreadable || b.unreadable) return false;
  if (a.sha256 && b.sha256) return a.sha256 === b.sha256;
  // Both missing hash → ambiguous
  if (!a.sha256 && !b.sha256 && a.exists && b.exists) return false;
  return a.sha256 === b.sha256 && a.size === b.size;
}

/**
 * Compare task-start and task-completion snapshots.
 * Dirty-at-start + same hash at end ⇒ PRE_EXISTING_CHANGE (unchanged during task).
 * Dirty-at-start + different hash ⇒ MODIFIED_PRE_EXISTING_FILE.
 * Clean/absent at start + present/changed at end ⇒ NEW_TASK_CHANGE.
 */
export function attributeChanges(start: TaskSnapshot, end: TaskSnapshot): AttributionReport {
  if (start.taskId !== end.taskId) {
    throw new Error(`Snapshot taskId mismatch: ${start.taskId} vs ${end.taskId}`);
  }

  const startMap = indexFiles(start);
  const endMap = indexFiles(end);
  const paths = new Set([...startMap.keys(), ...endMap.keys()]);
  const changes: AttributedChange[] = [];

  for (const path of [...paths].sort()) {
    const s = startMap.get(path);
    const e = endMap.get(path);
    const protectedHit = isProtectedPath(path) || Boolean(s?.protected || e?.protected);

    if (s?.unreadable || e?.unreadable) {
      changes.push({
        path,
        attribution: "AMBIGUOUS",
        protected: protectedHit,
        start: s,
        end: e,
        note: "File state unreadable — cannot attribute confidently",
      });
      continue;
    }

    /** Dirty-at-start only when porcelain (or explicit) marked it — not merely "existed". */
    const dirtyAtStart = Boolean(s?.dirtyStatus);
    const identical = sameFingerprint(s, e);

    if (identical) {
      if (dirtyAtStart) {
        changes.push({
          path,
          attribution: "PRE_EXISTING_CHANGE",
          protected: protectedHit,
          start: s,
          end: e,
          note: "Present/dirty at task start; fingerprint unchanged at completion",
        });
      } else {
        changes.push({
          path,
          attribution: "UNCHANGED",
          protected: protectedHit,
          start: s,
          end: e,
          note: "Fingerprint unchanged between snapshots",
        });
      }
      continue;
    }

    // Content or existence changed between snapshots
    if (!s || !s.exists) {
      changes.push({
        path,
        attribution: "NEW_TASK_CHANGE",
        protected: protectedHit,
        start: s,
        end: e,
        note:
          e?.exists === false
            ? "Deleted after task start (was absent at start — unusual)"
            : "Created or first observed after task start",
      });
      continue;
    }

    if (s.exists && e && !e.exists) {
      changes.push({
        path,
        attribution: s.dirtyStatus ? "MODIFIED_PRE_EXISTING_FILE" : "NEW_TASK_CHANGE",
        protected: protectedHit,
        start: s,
        end: e,
        note: "Deleted after task start",
      });
      continue;
    }

    if (s.sha256 == null || e?.sha256 == null) {
      changes.push({
        path,
        attribution: "AMBIGUOUS",
        protected: protectedHit,
        start: s,
        end: e,
        note: "Missing fingerprint on start or end — cannot attribute confidently",
      });
      continue;
    }

    if (dirtyAtStart) {
      changes.push({
        path,
        attribution: "MODIFIED_PRE_EXISTING_FILE",
        protected: protectedHit,
        start: s,
        end: e,
        note: "File was already dirty at task start and changed again during the task",
      });
    } else {
      changes.push({
        path,
        attribution: "NEW_TASK_CHANGE",
        protected: protectedHit,
        start: s,
        end: e,
        note: "Modified after a clean task-start observation",
      });
    }
  }

  const preExistingDirty = changes
    .filter((c) => c.attribution === "PRE_EXISTING_CHANGE")
    .map((c) => c.path);
  const newTaskChanges = changes
    .filter((c) => c.attribution === "NEW_TASK_CHANGE")
    .map((c) => c.path);
  const modifiedPreExisting = changes
    .filter((c) => c.attribution === "MODIFIED_PRE_EXISTING_FILE")
    .map((c) => c.path);
  const ambiguous = changes.filter((c) => c.attribution === "AMBIGUOUS").map((c) => c.path);
  const protectedChanges = changes
    .filter(
      (c) =>
        c.protected &&
        (c.attribution === "NEW_TASK_CHANGE" ||
          c.attribution === "MODIFIED_PRE_EXISTING_FILE" ||
          c.attribution === "AMBIGUOUS")
    )
    .map((c) => c.path);
  const criticalAmbiguous = changes
    .filter((c) => c.attribution === "AMBIGUOUS" && c.protected)
    .map((c) => c.path);

  return {
    taskId: start.taskId,
    startSnapshotId: start.snapshotId,
    endSnapshotId: end.snapshotId,
    comparedAt: new Date().toISOString(),
    changes,
    preExistingDirty,
    newTaskChanges,
    modifiedPreExisting,
    ambiguous,
    protectedChanges,
    criticalAmbiguous,
  };
}

/** Build a ChangeInventory from attributed new/mixed changes for impact selection. */
export function inventoryFromAttribution(attr: AttributionReport, cwd: string): ChangeInventory {
  const entries: ChangeEntry[] = [];
  for (const c of attr.changes) {
    if (c.attribution === "UNCHANGED" || c.attribution === "PRE_EXISTING_CHANGE") {
      continue;
    }
    const deleted = c.end && !c.end.exists && c.start?.exists;
    entries.push({
      path: c.path,
      status: deleted ? "deleted" : c.start?.exists ? "modified" : "untracked",
    });
  }
  return {
    capturedAt: attr.comparedAt,
    method: "synthetic",
    cwd,
    entries,
  };
}
