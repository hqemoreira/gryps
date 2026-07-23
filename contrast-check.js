function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function relLum({ r, g, b }) {
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}
function contrast(fg, bg) {
  const l1 = relLum(hexToRgb(fg)), l2 = relLum(hexToRgb(bg));
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const SURFACE = "#FFFFFF", BG = "#F4F6F9", SURFACE2 = "#EEF1F6";
const DARK_SURFACE = "#0B1220", DARK_BG = "#070B12";

function report(label, fg, bg) {
  const c = contrast(fg, bg);
  console.log(`${label.padEnd(46)} ${fg}  ${c.toFixed(2)}:1  ${c >= 4.5 ? "PASS" : c >= 3 ? "large-only" : "FAIL"}`);
}

console.log("--- text-dim candidates (light, on --surface/white) ---");
["#9AAABF", "#7A8CA3", "#6B7A94", "#5F7089", "#54637C"].forEach(c => report("text-dim candidate", c, SURFACE));

console.log("\n--- blue accent candidates (light, on white) ---");
["#4FA8FF", "#1E7FE0", "#0F6FD1", "#0B5FBF", "#0A56AD"].forEach(c => report("blue candidate", c, SURFACE));

console.log("\n--- cyan accent candidates (light, on white) ---");
["#6EE7F9", "#0E8A94", "#0B7680", "#096670"].forEach(c => report("cyan candidate", c, SURFACE));

console.log("\n--- green accent candidates (light, on white) ---");
["#2ED47A", "#1F9E5C", "#178049", "#12703F"].forEach(c => report("green candidate", c, SURFACE));

console.log("\n--- amber accent candidates (light, on white) ---");
["#D97706", "#B45309", "#9A4508", "#8A3D07"].forEach(c => report("amber candidate", c, SURFACE));

console.log("\n--- red accent candidates (light, on white) ---");
["#EF4444", "#DC2626", "#C41E1E", "#B91C1C"].forEach(c => report("red candidate", c, SURFACE));

console.log("\n--- verify chosen candidates on --bg and --surface2 too ---");
const chosen = {
  "text-dim": "#5F7089",
  "blue": "#0B5FBF",
  "cyan": "#0B7680",
  "green": "#178049",
  "amber": "#9A4508",
  "red": "#C41E1E",
};
for (const [name, hex] of Object.entries(chosen)) {
  report(`${name} on --bg`, hex, BG);
  report(`${name} on --surface2`, hex, SURFACE2);
}

console.log("\n--- confirm original DARK-mode values still pass on dark surfaces (regression check) ---");
["#4FA8FF", "#6EE7F9", "#2ED47A", "#D97706", "#EF4444"].forEach(c => {
  report(`${c} on dark surface`, c, DARK_SURFACE);
  report(`${c} on dark bg`, c, DARK_BG);
});

console.log("\n--- original text-dim/text-muted on DARK surfaces (regression check) ---");
report("text-dim(dark) on dark surface", "#334155", DARK_SURFACE);
report("text-muted(dark) on dark surface", "#64748B", DARK_SURFACE);

console.log("\n--- refine text-dim & green for --surface2 ---");
["#5F7089","#586886","#556582","#526280"].forEach(c => { report("text-dim refine", c, SURFACE2); });
["#178049","#146B3E","#12653B","#106038"].forEach(c => { report("green refine", c, SURFACE2); });

console.log("\n=== FINAL LIGHT-MODE PALETTE — full verification ===");
const FINAL = {
  "text-dim": "#586886",
  "blue":     "#0B5FBF",
  "cyan":     "#0B7680",
  "green":    "#146B3E",
  "amber":    "#9A4508",
  "red":      "#C41E1E",
};
for (const [name, hex] of Object.entries(FINAL)) {
  report(`${name} on --surface (white)`, hex, SURFACE);
  report(`${name} on --bg`, hex, BG);
  report(`${name} on --surface2`, hex, SURFACE2);
}
