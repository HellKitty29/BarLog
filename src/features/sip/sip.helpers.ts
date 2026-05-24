import type { SipDraft } from "@/types/domain";
import type { CreateCheckInPayload } from "./sip.types";

export function draftToCreateCheckInPayload(draft: SipDraft): CreateCheckInPayload {
  if (!draft.uploadedPhotoUrl || !draft.drinkName || !draft.drinkCategory) {
    throw new Error("Sip draft is missing required check-in fields.");
  }

  return {
    photoUrl: draft.uploadedPhotoUrl,
    cardImageUrl: draft.uploadedCardUrl,
    drinkName: draft.drinkName,
    drinkCategory: draft.drinkCategory,
    barId: draft.barId,
    barName: draft.barName,
    city: draft.city,
    area: draft.area,
    moodTags: draft.moodTags,
    rating: draft.rating,
    vibeMumbling: draft.vibeMumbling,
    cardStyle: draft.cardStyle,
    visibility: draft.visibility,
    socialStatus: draft.socialStatus
  };
}
