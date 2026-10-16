/**
 * One-shot: Traficom Bittimittari medians for Finnish Research Library municipalities.
 * Run: npx tsx scripts/fetch-bittimittari-snapshot.mts
 */
import { getBittimittariStatsForMunicipalities } from "../lib/real-data";

const munis = ["Inari", "Kittilä", "Sodankylä", "Rovaniemi", "Kolari", "Salla", "Pello"];
const stats = await getBittimittariStatsForMunicipalities(munis);
console.log(JSON.stringify(stats, null, 2));
