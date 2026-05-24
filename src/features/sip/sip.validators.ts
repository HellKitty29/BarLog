import { z } from "zod";
import { cardStyles, drinkCategories } from "./sip.constants";

export const createCheckInSchema = z.object({
  photoUrl: z.string().url(),
  cardImageUrl: z.string().url().optional(),
  drinkName: z.string().min(1).max(80),
  drinkCategory: z.enum(drinkCategories),
  barId: z.string().optional(),
  barName: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  moodTags: z.array(z.string()),
  rating: z.number().min(1).max(5).optional(),
  vibeMumbling: z.string().max(280).optional(),
  cardStyle: z.enum(cardStyles),
  visibility: z.enum(["private", "public", "tonight_only"]),
  socialStatus: z.enum(["not_social", "open_to_chat", "looking_for_buddy", "friends_only"]).optional()
});
