export interface ReviewItem {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const DEFAULT_REVIEWS: Record<string, ReviewItem[]> = {
  default: [
    {
      _id: 'sample-1',
      user: { name: 'Alex Carter' },
      rating: 9,
      comment: 'Absolutely phenomenal cinematography and sound design! Must watch in HD.',
      createdAt: '2 hours ago',
    },
    {
      _id: 'sample-2',
      user: { name: 'Sarah Jenkins' },
      rating: 8,
      comment: 'Super fast streaming with no buffering. Loved the storyline and character development!',
      createdAt: '1 day ago',
    },
  ],
};

export function getLocalReviews(mediaId: string): ReviewItem[] {
  if (typeof window === 'undefined' || !mediaId) return DEFAULT_REVIEWS.default;
  try {
    const raw = localStorage.getItem(`mv_reviews_${mediaId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEFAULT_REVIEWS.default;
}

export function saveLocalReview(
  mediaId: string,
  comment: string,
  rating: number = 9
): ReviewItem {
  let userName = 'Movie Fan';
  try {
    const userRaw = localStorage.getItem('movieverse-user');
    if (userRaw) {
      const userObj = JSON.parse(userRaw);
      if (userObj.name) userName = userObj.name;
    }
  } catch (e) {}

  const newReview: ReviewItem = {
    _id: `rev-${Date.now()}`,
    user: {
      name: userName,
    },
    rating: Math.max(1, Math.min(10, rating || 9)),
    comment: comment.trim(),
    createdAt: 'Just now',
  };

  if (typeof window !== 'undefined' && mediaId) {
    try {
      const existing = getLocalReviews(mediaId);
      const updated = [newReview, ...existing];
      localStorage.setItem(`mv_reviews_${mediaId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save review locally:', e);
    }

    // Optional background backend sync
    syncReviewWithBackend(mediaId, newReview.rating, newReview.comment);
  }

  return newReview;
}

async function syncReviewWithBackend(mediaId: string, rating: number, comment: string) {
  if (typeof window === 'undefined') return;
  const token = localStorage.getItem('movieverse-token');
  if (!token) return;

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    await fetch(`${apiUrl}/reviews/movie/${mediaId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ rating, comment }),
    }).catch(() => null);
  } catch (e) {}
}
