import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const app = readFileSync(join(root, "src/web/App.tsx"), "utf8");
const styles = readFileSync(join(root, "src/web/styles.css"), "utf8");
const options = readFileSync(join(root, "src/features/sip/checkin-options.ts"), "utf8");

function assertIncludes(source, marker, label) {
  if (!source.includes(marker)) {
    throw new Error(`Web sip/gallery/diary behavior check failed: missing ${label}`);
  }
}

assertIncludes(app, 'fill="#964b67"', "rating heart fill color #964b67");
assertIncludes(options, '{ label: "Cocktail", value: "cocktail" }', "Cocktail drink chip option");
assertIncludes(app, 'useState<DrinkCategory | null>("cocktail")', "nullable drink category with Cocktail default");
assertIncludes(app, 'current === item.value ? null : item.value', "drink chip toggles off when clicked again");

if (app.includes("<span>or</span>")) {
  throw new Error("Web sip/gallery/diary behavior check failed: Drink OR label should be removed");
}

assertIncludes(app, "createGeneratedCardBlob", "generated check-in card export");
assertIncludes(app, "uploadApi.uploadCardImage", "card image upload for published check-ins");

const cardIndex = app.indexOf("post.cardImageUrl");
const photoIndex = app.indexOf("post.photoUrl");
if (cardIndex === -1 || photoIndex === -1 || cardIndex > photoIndex) {
  throw new Error("Web sip/gallery/diary behavior check failed: gallery should prefer cardImageUrl before photoUrl");
}

assertIncludes(app, "selectedSipCard", "selected diary card state");
assertIncludes(app, "checkin-card-preview", "check-in card preview modal");
assertIncludes(app, "onOpenCard", "diary log card click handler");
assertIncludes(app, "getCommunityPostRating", "gallery rating formatter");
assertIncludes(app, "feed-card-rating", "gallery numeric rating display");
assertIncludes(app, "expandedGalleryCards", "gallery in-place expanded card state");
assertIncludes(app, "toggleExpandedGalleryCard", "gallery image click toggles full card");
assertIncludes(app, "readCommunityPostRating", "gallery rating reads nested backend fields");
assertIncludes(app, 'className={`feed-card-photo ${hasCardImage ? "is-card" : ""}`}', "gallery card image class");
assertIncludes(app, 'className={`feed-card-media ${isExpanded ? "is-expanded" : ""}`}', "gallery media expands in place");
assertIncludes(styles, ".feed-card-photo.is-card", "gallery card image contained style");
assertIncludes(styles, ".feed-card-media.is-expanded", "gallery expanded card media style");
assertIncludes(styles, "object-fit: contain;", "gallery card image keeps full generated card visible");
assertIncludes(styles, ".feed-card-rating", "gallery rating style");

console.log("Web sip/gallery/diary behavior check passed.");
