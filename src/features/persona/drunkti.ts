export type DrunkTiResult = {
  code: string;
  name: string;
  tagline: string;
  stats: { label: string; value: number; color: string }[];
};

export const drunkTiQuestions = [
  {
    axis: "EI",
    text: "When entering a crowded bar with high energy, you usually:",
    options: [
      { title: "Join the table and start the night loudly", subtitle: "Social energy, open conversation, shared jokes.", value: "E" },
      { title: "Find a quiet corner and watch the room", subtitle: "Low light, slow sipping, private observation.", value: "I" }
    ]
  },
  {
    axis: "SN",
    text: "How do you pick your first drink?",
    options: [
      { title: "Read ingredients and base spirit carefully", subtitle: "Taste structure and alcohol level matter.", value: "S" },
      { title: "Choose by name, story, or visual mood", subtitle: "Concept and atmosphere lead the order.", value: "N" }
    ]
  },
  {
    axis: "TF",
    text: "A friend is having a rough night. You respond by:",
    options: [
      { title: "Analyzing what happened over a strong pour", subtitle: "Clear logic first, emotions after.", value: "T" },
      { title: "Opening something warm and sitting with them", subtitle: "Comfort first, words can wait.", value: "F" }
    ]
  },
  {
    axis: "JP",
    text: "Before bar-hopping tonight, you prefer to:",
    options: [
      { title: "Plan the route and reserve the key stops", subtitle: "A good night has structure.", value: "J" },
      { title: "Walk until the next glowing door feels right", subtitle: "The best stop is discovered, not planned.", value: "P" }
    ]
  }
];

export const drunkTiProfiles: Record<string, DrunkTiResult> = {
  INTJ: {
    code: "INTJ",
    name: "Deep Sea Whisky Glacier",
    tagline: "Cold, precise, and impossible to impress.",
    stats: [
      { label: "Social", value: 21, color: "#9fbf8f" },
      { label: "Emotion", value: 35, color: "#86a66c" },
      { label: "Burn", value: 84, color: "#c68334" },
      { label: "Reason", value: 96, color: "#7aa07a" }
    ]
  },
  INFP: {
    code: "INFP",
    name: "Dreamy Blue Margarita",
    tagline: "Soft mood, moonlit ideas, very selective magic.",
    stats: [
      { label: "Social", value: 32, color: "#9fbf8f" },
      { label: "Emotion", value: 95, color: "#86a66c" },
      { label: "Burn", value: 58, color: "#c68334" },
      { label: "Reason", value: 41, color: "#7aa07a" }
    ]
  },
  ENFP: {
    code: "ENFP",
    name: "Tropical Tequila Sunrise",
    tagline: "Warm, bright, and ready to turn strangers into stories.",
    stats: [
      { label: "Social", value: 96, color: "#9fbf8f" },
      { label: "Emotion", value: 96, color: "#86a66c" },
      { label: "Burn", value: 72, color: "#c68334" },
      { label: "Reason", value: 35, color: "#7aa07a" }
    ]
  },
  ESTP: {
    code: "ESTP",
    name: "Raving Jagerbomb Dynamo",
    tagline: "Fast choices, high sparks, no boring exits.",
    stats: [
      { label: "Social", value: 97, color: "#9fbf8f" },
      { label: "Emotion", value: 48, color: "#86a66c" },
      { label: "Burn", value: 99, color: "#c68334" },
      { label: "Reason", value: 38, color: "#7aa07a" }
    ]
  }
};

export function createDrunkTiResult(answers: Record<string, string>) {
  const code = `${answers.EI ?? "I"}${answers.SN ?? "N"}${answers.TF ?? "F"}${answers.JP ?? "P"}`;
  return drunkTiProfiles[code] ?? drunkTiProfiles[code.startsWith("E") ? "ENFP" : "INFP"];
}
