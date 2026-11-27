/**
 * Protected-boundary checks for QA foundation (P6-S2).
 * Deterministic. No network. No Neon writes. Does not modify files.
 *
 * Run: npm run test:boundaries
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { HERO_DEMO_GRADE, HERO_DEMO_INPUT, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { scoreDeterministic } from "../lib/deterministic-score";

type ImmutableFile = { id: string; path: string; sha256: string };
type ReviewOptional = {
  id: string;
  pathCandidates: string[];
  sha256: string;
};
type Manifest = {
  schema: string;
  immutableFiles: ImmutableFile[];
  homepageRegression: {
    lat: number;
    lng: number;
    sector: string;
    autonomy: string;
    criticality: string;
    providers: string[];
    expectedScore: number;
    expectedGrade: string;
  };
  reviewPackagesOptional: ReviewOptional[];
  scoringEngineWatchlist: string[];
};

function fail(msg: string): never {
  console.error(`FAIL: ${msg}`);
  process.exit(1);
}

function sha256File(absPath: string): string {
  const buf = readFileSync(absPath);
  return createHash("sha256").update(buf).digest("hex");
}

function main(): void {
  const root = process.cwd();
  const manifestPath = join(root, "docs/methodology/fixtures/protected-boundaries-manifest.json");
  if (!existsSync(manifestPath)) fail(`manifest missing: ${manifestPath}`);

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  if (manifest.schema !== "gryps-protected-boundaries-manifest-v0") {
    fail(`unexpected manifest schema: ${manifest.schema}`);
  }

  let failures = 0;
  const report: string[] = [];

  for (const item of manifest.immutableFiles) {
    const abs = join(root, item.path);
    if (!existsSync(abs)) {
      console.error(`FAIL: ${item.id} missing at ${item.path}`);
      failures += 1;
      continue;
    }
    const hash = sha256File(abs);
    if (hash !== item.sha256.toLowerCase()) {
      console.error(
        `FAIL: ${item.id} hash mismatch\n  expected ${item.sha256}\n  actual   ${hash}`
      );
      failures += 1;
    } else {
      report.push(`OK immutable ${item.id} ${hash.slice(0, 12)}…`);
    }
  }

  const hr = manifest.homepageRegression;
  if (HERO_DEMO_SCORE !== hr.expectedScore || HERO_DEMO_GRADE !== hr.expectedGrade) {
    console.error(
      `FAIL: homepage export ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE} ≠ ${hr.expectedScore} · ${hr.expectedGrade}`
    );
    failures += 1;
  } else {
    report.push(`OK homepage export ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
  }

  const inputOk =
    HERO_DEMO_INPUT.lat === hr.lat &&
    HERO_DEMO_INPUT.lng === hr.lng &&
    HERO_DEMO_INPUT.sector === hr.sector &&
    HERO_DEMO_INPUT.autonomy === hr.autonomy &&
    HERO_DEMO_INPUT.criticality === hr.criticality &&
    HERO_DEMO_INPUT.providers.join(",") === hr.providers.join(",");
  if (!inputOk) {
    console.error("FAIL: HERO_DEMO_INPUT no longer matches protected regression scenario");
    failures += 1;
  } else {
    report.push("OK homepage input matches protected scenario");
  }

  const recomputed = scoreDeterministic({
    lat: hr.lat,
    lng: hr.lng,
    sector: hr.sector,
    autonomy: hr.autonomy,
    criticality: hr.criticality,
    providers: hr.providers,
  });
  if (
    recomputed.resilience_signature.score !== hr.expectedScore ||
    recomputed.resilience_signature.grade !== hr.expectedGrade
  ) {
    console.error(
      `FAIL: recomputed Signature ${recomputed.resilience_signature.score} · ${recomputed.resilience_signature.grade}`
    );
    failures += 1;
  } else {
    report.push(
      `OK recomputed Signature ${recomputed.resilience_signature.score} · ${recomputed.resilience_signature.grade}`
    );
  }

  for (const review of manifest.reviewPackagesOptional) {
    let found: string | null = null;
    for (const candidate of review.pathCandidates) {
      const abs = resolve(root, candidate);
      if (existsSync(abs)) {
        found = abs;
        break;
      }
    }
    if (!found) {
      report.push(
        `MANUAL ${review.id}: not present in this worktree — verify SHA-256 ${review.sha256} on main checkout before REVIEW handover`
      );
      continue;
    }
    const hash = sha256File(found);
    if (hash !== review.sha256.toLowerCase()) {
      console.error(
        `FAIL: ${review.id} hash mismatch at ${found}\n  expected ${review.sha256}\n  actual   ${hash}`
      );
      failures += 1;
    } else {
      report.push(`OK optional ${review.id} ${hash.slice(0, 12)}…`);
    }
  }

  report.push("Scoring engine watchlist (informational hashes — drift does not fail this check):");
  for (const rel of manifest.scoringEngineWatchlist) {
    const abs = join(root, rel);
    if (!existsSync(abs)) {
      console.error(`FAIL: scoring watchlist file missing: ${rel}`);
      failures += 1;
      continue;
    }
    const hash = sha256File(abs);
    report.push(`  ${rel}  ${hash}`);
  }

  report.push("Neon: this script performs no database reads or writes.");

  for (const line of report) console.log(line);

  if (failures > 0) {
    console.error(`Protected-boundary check failed (${failures} error(s)).`);
    process.exit(1);
  }
  console.log("Protected-boundary checks passed.");
}

main();
