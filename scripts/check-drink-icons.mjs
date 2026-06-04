import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const resolver = readFileSync(join(root, "src/features/drinks/drink-icon-variant.ts"), "utf8");
const webApp = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const diary = readFileSync(join(root, "app/(tabs)/diary.tsx"), "utf8");

const requiredVariants = [
  "white-russian",
  "black-russian",
  "margarita",
  "cosmopolitan",
  "whiskey-sour",
  "aperol-spritz",
  "tequila-sunrise",
  "retro-negroni",
  "blue-moon",
  "old-fashioned",
  "martini",
  "gimlet",
  "manhattan",
  "beer",
  "wine",
  "sake",
  "generic"
];

const requiredAliases = [
  "白俄罗斯",
  "黑俄罗斯",
  "玛格丽特",
  "大都会",
  "威士忌酸",
  "阿佩罗",
  "龙舌兰日出",
  "内格罗尼",
  "蓝月",
  "老式经典",
  "马天尼",
  "金雷特",
  "曼哈顿",
  "啤酒",
  "红酒",
  "清酒"
];

for (const variant of requiredVariants) {
  if (!resolver.includes(`"${variant}"`)) {
    throw new Error(`Missing resolver variant: ${variant}`);
  }

  if (!webApp.includes(`case "${variant}"`) && !webApp.includes(`drink-icon-${variant}`)) {
    throw new Error(`Missing web icon rendering for: ${variant}`);
  }

  if (!diary.includes(`${variant}:`) && !diary.includes(`"${variant}":`)) {
    throw new Error(`Missing diary badge color for: ${variant}`);
  }
}

for (const alias of requiredAliases) {
  if (!resolver.includes(alias)) {
    throw new Error(`Missing drink alias: ${alias}`);
  }
}

console.log(`Drink icon coverage OK: ${requiredVariants.length} variants, ${requiredAliases.length} aliases.`);
