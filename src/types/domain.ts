export type DrinkCategory =
  | "cocktail"
  | "whisky"
  | "wine"
  | "beer"
  | "sake"
  | "mocktail"
  | "other";

export type CardStyle =
  | "watercolor"
  | "receipt"
  | "film_ticket"
  | "doodle_glow"
  | "passport_stamp";

export type Visibility = "private" | "public" | "tonight_only";

export type SocialStatus =
  | "not_social"
  | "open_to_chat"
  | "looking_for_buddy"
  | "friends_only";

export type MoodTag = {
  id: string;
  label: string;
  tone?: "warm" | "cool" | "dark" | "bright";
};

export type CheckIn = {
  id: string;
  userId: string;
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
  createdAt: string;
  expiresAt?: string;
};

export type SipDraft = {
  localPhotoUri?: string;
  uploadedPhotoUrl?: string;
  generatedCardUri?: string;
  uploadedCardUrl?: string;
  drinkName?: string;
  drinkCategory?: DrinkCategory;
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

export type User = {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  city?: string;
  persona?: string;
};

export type Bar = {
  id: string;
  name: string;
  city: string;
  area?: string;
  address?: string;
  rating?: number;
  distanceMeters?: number;
  lat?: number;
  lng?: number;
  tags?: string[];
};

export type GalleryPost = {
  id: string;
  userId: string;
  authorName: string;
  imageUrl: string;
  caption?: string;
  city?: string;
  barName?: string;
  likedCount: number;
  createdAt: string;
};

export type Conversation = {
  id: string;
  title: string;
  lastMessage?: string;
  unreadCount: number;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
};
