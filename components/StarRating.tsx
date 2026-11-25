// Percentage-fill star rating — two stacked Unicode star rows so partial
// ratings (e.g. 4.8) render as a partially-filled star, not just a round number.
export default function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const stars = "★★★★★";

  return (
    <span className="star-rating" style={{ fontSize: size }} aria-label={`${rating.toFixed(1)} out of 5 stars`}>
      <span className="star-rating-track" aria-hidden="true">{stars}</span>
      <span className="star-rating-fill" style={{ width: `${pct}%` }} aria-hidden="true">{stars}</span>
    </span>
  );
}
