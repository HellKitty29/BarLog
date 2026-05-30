import type { CardStyle, DrinkCategory, SocialStatus, Visibility } from "@/types/domain";

export type SipCardAuthor = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type SipCardDetail = {
  id: string;
  userId: string;
  author: SipCardAuthor;
  photoUrl: string;
  cardImageUrl: string;
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
  createdAt: string;
  expiresAt?: string;
  likedCount: number;
  commentCount: number;
  likedByMe: boolean;
  owner: boolean;
};
