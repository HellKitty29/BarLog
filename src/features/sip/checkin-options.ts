export const weatherMoodOptions = [
  { value: "sunny", label: "Sunny", icon: "☀" },
  { value: "rainy", label: "Rainy", icon: "☔" },
  { value: "lightning", label: "Lightning", icon: "⚡" },
  { value: "stormy", label: "Stormy", icon: "⛈" },
  { value: "cloudy", label: "Cloudy", icon: "☁" }
] as const;

export const classicCocktailNames = [
  "Negroni",
  "Old Fashioned",
  "Margarita",
  "Cosmopolitan",
  "Whiskey Sour",
  "Aperol Spritz",
  "Tequila Sunrise",
  "Martini",
  "Gimlet",
  "Manhattan",
  "White Russian",
  "Black Russian"
] as const;

export const alternateDrinkCategoryOptions = [
  { label: "Cocktail", value: "cocktail" },
  { label: "Whisky", value: "whisky" },
  { label: "Wine", value: "wine" },
  { label: "Beer", value: "beer" },
  { label: "Other", value: "other" }
] as const;

export function clampCheckInRating(value: number) {
  return Math.max(1, Math.min(5, Math.round(value * 10) / 10));
}

export function getRandomClassicCocktailName() {
  return classicCocktailNames[Math.floor(Math.random() * classicCocktailNames.length)];
}
