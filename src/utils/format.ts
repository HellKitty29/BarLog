export function formatRating(rating?: number) {
  return typeof rating === "number" ? rating.toFixed(1) : "New";
}

export function formatDistance(distanceMeters?: number) {
  if (!distanceMeters) {
    return "";
  }

  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / 1000).toFixed(1)} km`;
}
