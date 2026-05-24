import type { CardStyle } from "@/types/domain";

export type GeneratedCardCopy = {
  title: string;
  subtitle?: string;
  body?: string;
  style: CardStyle;
};
