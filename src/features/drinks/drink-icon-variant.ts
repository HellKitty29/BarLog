export type DrinkIconVariant =
  | "white-russian"
  | "black-russian"
  | "margarita"
  | "cosmopolitan"
  | "whiskey-sour"
  | "aperol-spritz"
  | "tequila-sunrise"
  | "retro-negroni"
  | "blue-moon"
  | "old-fashioned"
  | "martini"
  | "gimlet"
  | "manhattan"
  | "beer"
  | "wine"
  | "sake"
  | "generic";

const drinkNamePatterns: [DrinkIconVariant, string[]][] = [
  ["white-russian", ["white russian", "白俄罗斯"]],
  ["black-russian", ["black russian", "黑俄罗斯"]],
  ["margarita", ["margarita", "玛格丽特"]],
  ["cosmopolitan", ["cosmopolitan", "cosmo", "大都会"]],
  ["whiskey-sour", ["whiskey sour", "whisky sour", "威士忌酸"]],
  ["aperol-spritz", ["aperol spritz", "aperol", "阿佩罗", "橙光"]],
  ["tequila-sunrise", ["tequila sunrise", "sunrise", "龙舌兰日出"]],
  ["retro-negroni", ["retro negroni", "negroni", "内格罗尼"]],
  ["blue-moon", ["blue moon", "蓝月"]],
  ["old-fashioned", ["old fashioned", "old-fashioned", "老式经典", "老式"]],
  ["martini", ["martini", "马天尼"]],
  ["gimlet", ["gimlet", "金雷特"]],
  ["manhattan", ["manhattan", "曼哈顿"]]
];

export function getDrinkIconVariant(name: string, type: string): DrinkIconVariant {
  const normalizedName = name.trim().toLowerCase();
  const normalizedType = type.trim().toLowerCase();
  const matchedName = drinkNamePatterns.find(([, patterns]) => patterns.some((pattern) => normalizedName.includes(pattern)));

  if (matchedName) {
    return matchedName[0];
  }

  if (normalizedType.includes("beer") || normalizedType.includes("啤酒")) {
    return "beer";
  }

  if (normalizedType.includes("wine") || normalizedType.includes("葡萄酒") || normalizedType.includes("红酒")) {
    return "wine";
  }

  if (normalizedType.includes("sake") || normalizedType.includes("清酒")) {
    return "sake";
  }

  return "generic";
}
