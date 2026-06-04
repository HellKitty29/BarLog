export type DrunkTiResult = {
  code: string;
  name: string;
  tagline: string;
  stats: { label: string; value: number; color: string }[];
};

export type DrunkTiQuestion = {
  axis: string;
  text: string;
  options: {
    title: string;
    subtitle: string;
    value: string;
    scores: string[];
  }[];
};

const drinkAliases: Record<string, string> = {
  IPA: "India Pale Ale / IPA",
  "Bartender's Choice": "Bartender's Choice",
  "Bartender’s Choice": "Bartender's Choice",
  Rose: "Rose",
  "Rosé": "Rose"
};

export const drunkTiQuestions: DrunkTiQuestion[] = [
  {
    axis: "q1",
    text: "You walk into a bar. What do you do first?",
    options: [
      {
        title: "Scan the music, crowd, and the mood of the room.",
        subtitle: "Leans toward Long Island Iced Tea, PBR, and Hard Seltzer.",
        value: "A",
        scores: ["Long Island Iced Tea", "PBR", "Hard Seltzer"]
      },
      {
        title: "Ask the bartender: what is special tonight?",
        subtitle: "Leans toward Bartender's Choice, Chartreuse, and Mezcal.",
        value: "B",
        scores: ["Bartender's Choice", "Chartreuse", "Mezcal"]
      },
      {
        title: "Find the seat with the best lighting and visual vibe.",
        subtitle: "Leans toward Cosmopolitan, Rose, Aviation, and Champagne.",
        value: "C",
        scores: ["Cosmopolitan", "Rose", "Aviation", "Champagne"]
      },
      {
        title: "Read the menu carefully before deciding how risky to be.",
        subtitle: "Leans toward Scotch, India Pale Ale / IPA, and Classic Bitter Cocktail.",
        value: "D",
        scores: ["Scotch", "India Pale Ale / IPA", "Classic Bitter Cocktail"]
      }
    ]
  },
  {
    axis: "q2",
    text: "What personality should tonight's drink have?",
    options: [
      {
        title: "Loud, slightly chaotic, never boring.",
        subtitle: "Leans toward Long Island Iced Tea, Rumple Minze, and Champagne.",
        value: "A",
        scores: ["Long Island Iced Tea", "Rumple Minze", "Champagne"]
      },
      {
        title: "Savory, spicy, like a brunch that saves your life.",
        subtitle: "Leans toward Bloody Mary, Mezcal, and White Zinfandel.",
        value: "B",
        scores: ["Bloody Mary", "Mezcal", "White Zinfandel"]
      },
      {
        title: "Polished, urban, and stylish in your hand.",
        subtitle: "Leans toward Cosmopolitan, Espresso Martini, and Aviation.",
        value: "C",
        scores: ["Cosmopolitan", "Espresso Martini", "Aviation"]
      },
      {
        title: "Obscure, herbal, smoky, and hard to decode.",
        subtitle: "Leans toward Chartreuse, Mezcal, Scotch, and India Pale Ale / IPA.",
        value: "D",
        scores: ["Chartreuse", "Mezcal", "Scotch", "India Pale Ale / IPA"]
      }
    ]
  },
  {
    axis: "q3",
    text: "What is your ideal weekend scene?",
    options: [
      {
        title: "Wake up late and go to a brunch full of tomato, spice, and gossip.",
        subtitle: "Leans toward Bloody Mary, Rose, and White Zinfandel.",
        value: "A",
        scores: ["Bloody Mary", "Rose", "White Zinfandel"]
      },
      {
        title: "Late-night caffeine, galleries, city walks - the later, the clearer.",
        subtitle: "Leans toward Espresso Martini, Aviation, and Mezcal.",
        value: "B",
        scores: ["Espresso Martini", "Aviation", "Mezcal"]
      },
      {
        title: "A friend gathering: cheap, fun, and everyone ends up laughing.",
        subtitle: "Leans toward PBR, Long Island Iced Tea, Rumple Minze, and Hard Seltzer.",
        value: "C",
        scores: ["PBR", "Long Island Iced Tea", "Rumple Minze", "Hard Seltzer"]
      },
      {
        title: "A slow dinner where the talk turns to values and life choices.",
        subtitle: "Leans toward Scotch, Classic Bitter Cocktail, and Champagne.",
        value: "D",
        scores: ["Scotch", "Classic Bitter Cocktail", "Champagne"]
      }
    ]
  },
  {
    axis: "q4",
    text: "Facing a long drink menu, how do you choose?",
    options: [
      {
        title: "Pick something refreshing, low-pressure, and easy.",
        subtitle: "Leans toward Hard Seltzer, Rose, and White Zinfandel.",
        value: "A",
        scores: ["Hard Seltzer", "Rose", "White Zinfandel"]
      },
      {
        title: "Pick the strongest value and the one most likely to create a story.",
        subtitle: "Leans toward Long Island Iced Tea, Rumple Minze, and PBR.",
        value: "B",
        scores: ["Long Island Iced Tea", "Rumple Minze", "PBR"]
      },
      {
        title: "Pick a classic; trust what time has already tested.",
        subtitle: "Leans toward Scotch, Classic Bitter Cocktail, and Champagne.",
        value: "C",
        scores: ["Scotch", "Classic Bitter Cocktail", "Champagne"]
      },
      {
        title: "Pick the ingredient you have never seen before - the stranger, the better.",
        subtitle: "Leans toward Chartreuse, Mezcal, Aviation, and Bartender's Choice.",
        value: "D",
        scores: ["Chartreuse", "Mezcal", "Aviation", "Bartender's Choice"]
      }
    ]
  },
  {
    axis: "q5",
    text: "A friend is having a meltdown. What do you do?",
    options: [
      {
        title: "Feed them first, then comfort them slowly.",
        subtitle: "Leans toward Bloody Mary, White Zinfandel, and Rose.",
        value: "A",
        scores: ["Bloody Mary", "White Zinfandel", "Rose"]
      },
      {
        title: "Tell the truth directly, but protect their dignity.",
        subtitle: "Leans toward India Pale Ale / IPA, Scotch, and Classic Bitter Cocktail.",
        value: "B",
        scores: ["India Pale Ale / IPA", "Scotch", "Classic Bitter Cocktail"]
      },
      {
        title: "Turn up the energy so they can forget the pain for a while.",
        subtitle: "Leans toward Long Island Iced Tea, Rumple Minze, Cosmopolitan, and Champagne.",
        value: "C",
        scores: ["Long Island Iced Tea", "Rumple Minze", "Cosmopolitan", "Champagne"]
      },
      {
        title: "Take them somewhere new and change the world around them.",
        subtitle: "Leans toward Bartender's Choice, Mezcal, Aviation, and Chartreuse.",
        value: "D",
        scores: ["Bartender's Choice", "Mezcal", "Aviation", "Chartreuse"]
      }
    ]
  },
  {
    axis: "q6",
    text: "How do people usually describe you?",
    options: [
      {
        title: "Polished, magnetic, and a little sharp.",
        subtitle: "Leans toward Cosmopolitan, Champagne, and Espresso Martini.",
        value: "A",
        scores: ["Cosmopolitan", "Champagne", "Espresso Martini"]
      },
      {
        title: "Soft, bright, easygoing, but with your own taste.",
        subtitle: "Leans toward Rose, White Zinfandel, and Hard Seltzer.",
        value: "B",
        scores: ["Rose", "White Zinfandel", "Hard Seltzer"]
      },
      {
        title: "Mysterious, slow to warm up, and full of hidden layers.",
        subtitle: "Leans toward Chartreuse, Mezcal, Scotch, and Aviation.",
        value: "C",
        scores: ["Chartreuse", "Mezcal", "Scotch", "Aviation"]
      },
      {
        title: "Funny, unpretentious, and occasionally a small accident.",
        subtitle: "Leans toward PBR, Long Island Iced Tea, and Rumple Minze.",
        value: "D",
        scores: ["PBR", "Long Island Iced Tea", "Rumple Minze"]
      }
    ]
  },
  {
    axis: "q7",
    text: "What is the most charming moment of a night?",
    options: [
      {
        title: "Two people suddenly start telling the truth.",
        subtitle: "Leans toward Scotch, Mezcal, and Aviation.",
        value: "A",
        scores: ["Scotch", "Mezcal", "Aviation"]
      },
      {
        title: "Everyone raises a glass and a small celebration happens.",
        subtitle: "Leans toward Champagne, Long Island Iced Tea, and Rumple Minze.",
        value: "B",
        scores: ["Champagne", "Long Island Iced Tea", "Rumple Minze"]
      },
      {
        title: "Hair, outfit, lighting, and photos all land perfectly.",
        subtitle: "Leans toward Cosmopolitan, Rose, and Espresso Martini.",
        value: "C",
        scores: ["Cosmopolitan", "Rose", "Espresso Martini"]
      },
      {
        title: "Tasting something completely unexpected.",
        subtitle: "Leans toward India Pale Ale / IPA, Chartreuse, Bartender's Choice, and Mezcal.",
        value: "D",
        scores: ["India Pale Ale / IPA", "Chartreuse", "Bartender's Choice", "Mezcal"]
      }
    ]
  },
  {
    axis: "q8",
    text: "Choose the flavor direction that attracts you most.",
    options: [
      {
        title: "Savory, spicy, tomato, citrus.",
        subtitle: "Leans toward Bloody Mary, Mezcal, and Cosmopolitan.",
        value: "A",
        scores: ["Bloody Mary", "Mezcal", "Cosmopolitan"]
      },
      {
        title: "Bitter, smoky, herbal, woody.",
        subtitle: "Leans toward Classic Bitter Cocktail, Chartreuse, Scotch, and India Pale Ale / IPA.",
        value: "B",
        scores: ["Classic Bitter Cocktail", "Chartreuse", "Scotch", "India Pale Ale / IPA"]
      },
      {
        title: "Sweet, bubbly, light, pink-coded.",
        subtitle: "Leans toward White Zinfandel, Rose, Champagne, and Hard Seltzer.",
        value: "C",
        scores: ["White Zinfandel", "Rose", "Champagne", "Hard Seltzer"]
      },
      {
        title: "Coffee, floral notes, mint, or a strange kind of clarity.",
        subtitle: "Leans toward Espresso Martini, Aviation, Rumple Minze, and Bartender's Choice.",
        value: "D",
        scores: ["Espresso Martini", "Aviation", "Rumple Minze", "Bartender's Choice"]
      }
    ]
  }
];

export const drunkTiProfiles: Record<string, DrunkTiResult> = {
  "Long Island Iced Tea": createProfile("LIIT", "Long Island Iced Tea", "The maximalist chaos friend", 95, 58, 98, 35),
  "Bloody Mary": createProfile("BLOOD", "Bloody Mary", "The spicy brunch healer", 68, 86, 72, 54),
  Cosmopolitan: createProfile("COSMO", "Cosmopolitan", "The polished urban signal", 83, 72, 61, 78),
  "Espresso Martini": createProfile("ESP", "Espresso Martini", "The caffeinated night strategist", 64, 54, 76, 92),
  "India Pale Ale / IPA": createProfile("IPA", "India Pale Ale / IPA", "The opinionated flavor nerd", 48, 42, 70, 88),
  "White Zinfandel": createProfile("ZIN", "White Zinfandel", "The sweet no-shame nostalgic", 72, 82, 38, 45),
  Chartreuse: createProfile("CHART", "Chartreuse", "The herbal cryptic mystic", 35, 66, 84, 91),
  "Rumple Minze": createProfile("MINT", "Rumple Minze", "The reckless mint switch", 93, 61, 99, 28),
  Champagne: createProfile("CHAMP", "Champagne", "The sparkling celebrator", 90, 74, 58, 63),
  PBR: createProfile("PBR", "PBR", "The unpretentious dive-bar poet", 82, 64, 55, 40),
  Mezcal: createProfile("MEZ", "Mezcal", "The smoky outsider storyteller", 52, 78, 86, 76),
  Scotch: createProfile("SCOTCH", "Scotch", "The old-soul contemplator", 31, 70, 74, 94),
  Rose: createProfile("ROSE", "Rose", "The soft golden-hour aesthete", 77, 88, 42, 59),
  "Hard Seltzer": createProfile("SELTZ", "Hard Seltzer", "The crisp low-pressure socializer", 78, 52, 35, 51),
  Aviation: createProfile("AVI", "Aviation", "The violet retro dreamer", 55, 90, 62, 79),
  "Classic Bitter Cocktail": createProfile("BITTER", "Classic Bitter Cocktail", "The composed bittersweet classicist", 42, 57, 69, 96),
  "Bartender's Choice": createProfile("WILD", "Bartender's Choice", "The trusting experimenter", 66, 76, 91, 52)
};

const resultPriority = Object.keys(drunkTiProfiles);

export function createDrunkTiResult(answers: Record<string, string>) {
  const totals = new Map<string, number>();

  for (const question of drunkTiQuestions) {
    const selected = question.options.find((option) => option.value === answers[question.axis]);
    if (!selected) {
      continue;
    }

    for (const drink of selected.scores) {
      const normalized = normalizeDrinkName(drink);
      totals.set(normalized, (totals.get(normalized) ?? 0) + 1);
    }
  }

  const winner = resultPriority.reduce((best, drink) => {
    const bestScore = totals.get(best) ?? 0;
    const drinkScore = totals.get(drink) ?? 0;
    return drinkScore > bestScore ? drink : best;
  }, resultPriority[0]);

  return drunkTiProfiles[winner];
}

function normalizeDrinkName(value: string) {
  return drinkAliases[value] ?? value;
}

function createProfile(
  code: string,
  name: string,
  tagline: string,
  social: number,
  emotion: number,
  burn: number,
  reason: number
): DrunkTiResult {
  return {
    code,
    name,
    tagline,
    stats: [
      { label: "Social", value: social, color: "#9fbf8f" },
      { label: "Emotion", value: emotion, color: "#86a66c" },
      { label: "Burn", value: burn, color: "#c68334" },
      { label: "Reason", value: reason, color: "#7aa07a" }
    ]
  };
}
