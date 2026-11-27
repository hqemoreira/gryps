/**
 * Evidence provenance checks. Does not change scoring assertions.
 * Run: npx tsx scripts/verify-evidence-integrity.ts
 */
import { readFileSync } from "fs";
import { join } from "path";
import { hasHistoricalEnrichment } from "../components/ResilienceOutput";
import { buildEvidencePackage, DISPLAY_CHAIN_NOTICE } from "../lib/evidence-model";
import { EVIDENCE_KINDS } from "../lib/evidence-kinds";
import { EXAMPLE_SIGNATURES } from "../lib/example-signatures";
import { HERO_DEMO_GRADE, HERO_DEMO_INPUT, HERO_DEMO_SCORE } from "../lib/hero-demo";
import { displayModelVersion, MODEL_VERSION, UNRECORDED_MODEL_VERSION } from "../lib/model-constants";
import { RESEARCH_LIBRARY, seedLibraryProvenance, visibleEvidenceNotes } from "../lib/research-library";
import { withEvidence } from "../lib/research-resolve";
import { exportAssessmentMarkdown } from "../lib/research-workspace";
import { versionSignature } from "../lib/signature-meta";
import { normalizeSector, parseProviders, scoreDeterministic } from "../lib/deterministic-score";

function fail(message: string): never {
  throw new Error(message);
}

const providers = parseProviders({
  sector: "mining",
  autonomy: "remote-operated",
  criticality: "high",
  providers: ["starlink", "iridium"],
  lat: 60,
});

const norwayBand = buildEvidencePackage({
  lat: 60,
  sector: normalizeSector("energy"),
  providers,
  priorities: [],
  score: 70,
  grade: "B",
});
if (norwayBand.sources.some((source) => source.id === "bittimittari")) {
  fail("Bittimittari attached from latitude 60 without a Finnish municipality seed");
}
if (norwayBand.chain.some((step) => step.sourceIds.includes("model-v03"))) {
  fail("evidence chain still cites model-v03");
}
const scoring = norwayBand.chain.find((step) => step.id === "scoring");
const recommendation = norwayBand.chain.find((step) => step.id === "recommendation");
if (!scoring?.sourceIds.includes("model-v04") || !recommendation?.sourceIds.includes("model-v04")) {
  fail("scoring chain does not cite model-v04");
}

const finnishSeed = buildEvidencePackage({
  lat: 68.2,
  sector: normalizeSector("forestry"),
  providers,
  priorities: [],
  score: 40,
  grade: "D",
  finnishMunicipalitySeed: true,
});
if (!finnishSeed.sources.some((source) => source.id === "bittimittari")) {
  fail("Finnish municipality seed did not attach Bittimittari");
}

if (displayModelVersion(undefined) !== UNRECORDED_MODEL_VERSION) fail("blank version relabelled");
if (displayModelVersion("  ") !== UNRECORDED_MODEL_VERSION) fail("whitespace version relabelled");
if (displayModelVersion("gryps-signature-v1") !== "gryps-signature-v1") {
  fail("historical v1 was rewritten");
}
if (displayModelVersion(MODEL_VERSION) !== MODEL_VERSION) fail("current version not preserved");
if (EVIDENCE_KINDS.STORED.label !== "STORED") fail("stored label missing");
if (EVIDENCE_KINDS.MEASURED.label !== "MEASURED") fail("measured kind missing");

const hero = scoreDeterministic(HERO_DEMO_INPUT);
if (hero.resilience_signature.score !== 83 || hero.resilience_signature.grade !== "B") {
  fail(`homepage regression moved: ${hero.resilience_signature.score} ${hero.resilience_signature.grade}`);
}
if (HERO_DEMO_SCORE !== 83 || HERO_DEMO_GRADE !== "B") fail("hero export is not 83 B");
if (hero.evidence?.sources.some((source) => source.id === "bittimittari")) {
  fail("homepage evidence attached Bittimittari");
}
if (hero.evidence?.chain.some((step) => step.sourceIds.includes("model-v03"))) {
  fail("homepage evidence chain cites model-v03");
}

if (hero.evidence?.chainOrigin === "display") {
  fail("homepage chain marked as a display graft");
}
if (hero.resilience_signature.score !== 83 || hero.resilience_signature.grade !== "B") {
  fail("homepage score moved during provenance checks");
}

const generated = versionSignature(hero, HERO_DEMO_INPUT);
if (generated.modelVersion !== MODEL_VERSION) fail("new assessment is not v0.4");
if (generated.evidence?.chainOrigin === "display") fail("new v0.4 chain marked as display graft");
if (generated.resilience_signature.score !== 83) fail("versioning changed the homepage score");

const byId = Object.fromEntries(EXAMPLE_SIGNATURES.map((example) => [example.id, example]));
const expectedScores: Record<string, number> = {
  "maritime-offshore": 35,
  "mining-autonomous": 78,
  "forestry-mixed": 38,
  "iceland-autonomous-fleet": 72,
};
for (const [id, score] of Object.entries(expectedScores)) {
  if (byId[id].result.resilience_signature.score !== score) fail(`${id} score changed`);
}

const forestry = byId["forestry-mixed"];
const storedChain = buildEvidencePackage({
  lat: forestry.input.lat ?? 68.2,
  sector: normalizeSector(forestry.input.sector),
  providers,
  priorities: [],
  score: forestry.result.resilience_signature.score,
  grade: forestry.result.resilience_signature.grade,
});
storedChain.chain = storedChain.chain.map((step) => ({
  ...step,
  sourceIds: step.sourceIds.map((id) => (id === "model-v04" ? "model-v03" : id)),
}));
const storedResult = { ...forestry.result, evidence: storedChain };
const kept = withEvidence(storedResult, forestry.input);
if (kept !== storedResult) fail("stored chain was replaced");
if (kept.evidence?.chainOrigin === "display") fail("stored chain labelled as display");
if (!kept.evidence?.chain.some((step) => step.sourceIds.includes("model-v03"))) {
  fail("stored model-v03 chain was rewritten");
}
if (kept.modelVersion !== "gryps-signature-v1" || kept.resilience_signature.score !== 38) {
  fail("stored v1 assessment was rewritten");
}

const v1Graft = withEvidence({ ...forestry.result }, forestry.input, true);
if (v1Graft.modelVersion !== "gryps-signature-v1" || v1Graft.resilience_signature.score !== 38) {
  fail("v1 graft changed score or version");
}
if (v1Graft.evidence?.chainOrigin !== "display") fail("v1 graft not marked display");
if (forestry.result.evidence) fail("example body gained an evidence chain");
const v1Again = withEvidence(v1Graft, forestry.input, true);
if (v1Again !== v1Graft) fail("repeat withEvidence rebuilt a chain");
if (v1Again.evidence?.chain.length !== v1Graft.evidence?.chain.length) fail("repeat duplicated a chain");
if (v1Again.evidence?.limitations.filter((line) => line === DISPLAY_CHAIN_NOTICE.en).length !== 1) {
  fail("display notice duplicated");
}

const maritime = byId["maritime-offshore"];
const unrecorded = withEvidence({ ...maritime.result }, maritime.input);
if (unrecorded.modelVersion !== undefined) fail("missing version was filled in");
if (unrecorded.resilience_signature.score !== 35) fail("unrecorded example score changed");
if (unrecorded.evidence?.chainOrigin !== "display") fail("unrecorded graft not marked display");
if (displayModelVersion(unrecorded.modelVersion) !== UNRECORDED_MODEL_VERSION) {
  fail("missing version displayed as a model id");
}
const unrecordedAgain = withEvidence(unrecorded, maritime.input);
if (unrecordedAgain !== unrecorded) fail("repeat changed the unrecorded graft");

const markdown = exportAssessmentMarkdown({
  id: "provenance-check",
  title: "Provenance check",
  savedAt: "2026-11-26T00:00:00.000Z",
  depth: "full",
  inputs: maritime.input,
  result: unrecorded,
});
if (!markdown.includes(DISPLAY_CHAIN_NOTICE.en)) fail("markdown hid the display-chain notice");

const claimsV04 = /scored by model v0\.4|from model v0\.4|model v0\.4 output|in model v0\.4|mallin v0\.4|mallista v0\.4/i;
for (const example of EXAMPLE_SIGNATURES) {
  if (example.result.modelVersion === MODEL_VERSION) continue;
  const entry = RESEARCH_LIBRARY.find(
    (item) => item.source === "example" && item.sourceId === example.id
  );
  if (!entry) fail(`missing research entry for ${example.id}`);
  const texts = [
    ...(entry?.evidenceNotes ?? []).flatMap((note) => [note.en, note.fi]),
    ...(example.result.caveats ?? []),
  ];
  for (const text of texts) {
    if (claimsV04.test(text)) fail(`${example.id} still claims v0.4 generation: ${text}`);
  }
  const blob = texts.join(" ");
  if (example.result.modelVersion) {
    if (!blob.includes(example.result.modelVersion)) fail(`${example.id} hides its stored version`);
  } else if (!/not recorded|ei tallennettu/i.test(blob)) {
    fail(`${example.id} does not say the version was not recorded`);
  }
}
if (!/not shown as a current Signature/i.test(EVIDENCE_KINDS.STORED.en)) {
  fail("stored caption still presents the composite as a current score");
}
if (!/not a direct measurement/i.test(EVIDENCE_KINDS.STORED.en)) fail("stored caption still implies a measurement");
const emptyEnrichment = {
  realDataScore: 80,
  terrainPenaltyScore: null,
  elevationCenterM: null,
  elevationVarianceM: null,
  realWorldGapScore: null,
  municipality: null,
  bittimittariPeriod: null,
  bittimittariSampleCount: null,
  bittimittariMedianDownloadMbps: null,
  bittimittariMedianLatencyMs: null,
};
if (hasHistoricalEnrichment(emptyEnrichment)) {
  fail("composite-only payload still opens the historical panel");
}
if (
  !hasHistoricalEnrichment({
    ...emptyEnrichment,
    realDataScore: null,
    terrainPenaltyScore: 70,
  })
) {
  fail("terrain component no longer opens the historical panel");
}
const resilienceUi = readFileSync(join("components", "ResilienceOutput.tsx"), "utf8");
if (resilienceUi.includes("Real-world gap (55%)") || resilienceUi.includes("Terrain penalty (45%)")) {
  fail("blend-weight labels still present the composite as a current score");
}
if (/\{data\.realDataScore\}/.test(resilienceUi)) {
  fail("composite realDataScore is still rendered");
}

const inari = RESEARCH_LIBRARY.find((entry) => entry.slug === "finnish-arctic-forestry-inari");
if (!inari || inari.source !== "seed") fail("Inari seed entry missing");
const freshNotes = visibleEvidenceNotes(inari?.evidenceNotes, "seed", false, MODEL_VERSION);
if (
  !freshNotes.some(
    (note) =>
      /historical stored assessment/i.test(note.en) &&
      /not recorded/i.test(note.en) &&
      /gryps-signature-v0\.4/i.test(note.en)
  )
) {
  fail("seed note lost dual-path historical / fresh provenance wording");
}
const freshLine = seedLibraryProvenance({
  source: "seed",
  fromDatabase: false,
  modelVersion: MODEL_VERSION,
});
if (!freshLine?.en.includes(MODEL_VERSION) || /stored signature_sites output/i.test(freshLine.en)) {
  fail("fresh seed path is not labelled as a current calculation");
}
const storedLine = seedLibraryProvenance({
  source: "seed",
  fromDatabase: true,
  modelVersion: UNRECORDED_MODEL_VERSION,
});
if (!storedLine?.en.includes(UNRECORDED_MODEL_VERSION) || !/did not recompute/i.test(storedLine.en)) {
  fail("stored seed path is not labelled as stored");
}
const storedNotes = visibleEvidenceNotes(
  inari?.evidenceNotes,
  "seed",
  true,
  UNRECORDED_MODEL_VERSION
);
if (
  storedNotes.some((note) =>
    /from model v0\.4|scored by model v0\.4|mallista v0\.4|mallin v0\.4/i.test(`${note.en}\n${note.fi}`)
  )
) {
  fail("stored unrecorded seed still claims generation by Model v0.4");
}
if (!storedNotes.some((note) => /historical stored assessment/i.test(note.en))) {
  fail("stored seed path hid the historical assessment note");
}
if (
  visibleEvidenceNotes(inari?.evidenceNotes, "seed", true, MODEL_VERSION).length !==
  (inari?.evidenceNotes?.length ?? 0)
) {
  fail("stored v0.4 row dropped notes the recorded version supports");
}
if (seedLibraryProvenance({ source: "example", fromDatabase: false, modelVersion: "gryps-signature-v1" })) {
  fail("authored example received a seed provenance line");
}

const seedEntries = RESEARCH_LIBRARY.filter((entry) => entry.source === "seed");
if (seedEntries.length !== 8) fail(`expected 8 seed entries, got ${seedEntries.length}`);
for (const entry of seedEntries) {
  const modelled = (entry.evidenceNotes ?? []).filter((note) => note.kind === "MODELLED");
  if (modelled.length === 0) fail(`${entry.slug} missing MODELLED provenance note`);
  for (const note of modelled) {
    if (!/historical stored assessment/i.test(note.en) || !/not recorded/i.test(note.en)) {
      fail(`${entry.slug} MODELLED note is not a historical unrecorded provenance statement`);
    }
    if (/from model v0\.4|scored by model v0\.4|— model v0\.4/i.test(note.en)) {
      fail(`${entry.slug} MODELLED note still attributes the historical score to Model v0.4`);
    }
  }
}

const libraryView = readFileSync(join("components", "ResearchLibraryView.tsx"), "utf8");
if (/Each assessment uses deterministic Model v0\.4/.test(libraryView)) {
  fail("library index still claims every assessment uses Model v0.4");
}
if (/Same scoring model as the research assessments above/.test(libraryView)) {
  fail("library CTA still equates all cards with the current scoring model");
}

console.log("Evidence integrity checks passed.");
console.log(`Homepage regression ${HERO_DEMO_SCORE} · ${HERO_DEMO_GRADE}`);
