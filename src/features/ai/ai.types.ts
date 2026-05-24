export type RecognizeDrinkResponse = {
  drinkName?: string;
  drinkCategory?: string;
  confidence?: number;
};

export type IcebreakerResponse = {
  suggestions: string[];
};
