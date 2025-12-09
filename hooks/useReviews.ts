import { useState, useEffect } from 'react';
import type { ReviewWithImages } from '../lib/types';
import {
  getMyReviews,
  createReview,
  updateReview,
  deleteReview,
} from '../lib/api/reviews';
import type { ReviewInsert, ReviewUpdate } from '../lib/types';

export function useReviews() {
  const [reviews, setReviews] = useState<ReviewWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyReviews();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const refetch = () => {
    return fetchReviews();
  };

  const create = async (reviewData: ReviewInsert, imageUrls: string[] = []) => {
    try {
      const newReview = await createReview(reviewData, imageUrls);
      setReviews([newReview, ...reviews]);
      return { data: newReview, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      return { data: null, error };
    }
  };

  const update = async (
    reviewId: string,
    reviewData: ReviewUpdate,
    imageUrls: string[] = []
  ) => {
    try {
      const updatedReview = await updateReview(reviewId, reviewData, imageUrls);
      setReviews(reviews.map((r) => (r.id === reviewId ? updatedReview : r)));
      return { data: updatedReview, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      return { data: null, error };
    }
  };

  const remove = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
      return { error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      return { error };
    }
  };

  return {
    reviews,
    loading,
    error,
    refetch,
    create,
    update,
    remove,
  };
}
