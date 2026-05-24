import type { CardStyle, DrinkCategory, SocialStatus, Visibility } from "@/types/domain";

export type CreateCheckInPayload = {
  photoUrl: string;
  cardImageUrl?: string;
  drinkName: string;
  drinkCategory: DrinkCategory;
  barId?: string;
  barName?: string;
  city?: string;
  area?: string;
  moodTags: string[];
  rating?: number;
  vibeMumbling?: string;
  cardStyle: CardStyle;
  visibility: Visibility;
  socialStatus?: SocialStatus;
};
