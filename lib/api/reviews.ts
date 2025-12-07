import { supabase } from '../supabase';
import type {
  Review,
  ReviewImage,
  ReviewWithImages,
  ReviewInsert,
  ReviewUpdate,
  ReviewImageInsert,
} from '../types';

/**
 * ユーザーのレビュー一覧を取得
 */
export async function getMyReviews(): Promise<ReviewWithImages[]> {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (!reviews || reviews.length === 0) {
    return [];
  }

  // 各レビューに画像を紐付け
  const reviewsWithImages = await Promise.all(
    reviews.map(async (review) => {
      const { data: images } = await supabase
        .from('review_images')
        .select('*')
        .eq('review_id', review.id)
        .order('display_order', { ascending: true });

      return {
        ...review,
        images: images || [],
      } as ReviewWithImages;
    })
  );

  return reviewsWithImages;
}

/**
 * レビュー詳細を取得
 */
export async function getReviewById(
  reviewId: string
): Promise<ReviewWithImages | null> {
  const { data: review, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error) {
    throw error;
  }

  if (!review) {
    return null;
  }

  // 画像を取得
  const { data: images } = await supabase
    .from('review_images')
    .select('*')
    .eq('review_id', reviewId)
    .order('display_order', { ascending: true });

  return {
    ...review,
    images: images || [],
  } as ReviewWithImages;
}

/**
 * レビューを作成
 */
export async function createReview(
  reviewData: ReviewInsert,
  imageUrls: string[] = []
): Promise<ReviewWithImages> {
  // 現在のユーザーIDを取得
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('ユーザーが認証されていません');
  }

  // レビューを作成
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      ...reviewData,
      user_id: user.id,
    })
    .select()
    .single();

  if (reviewError) {
    throw reviewError;
  }

  // 画像を追加
  if (imageUrls.length > 0) {
    const imageInserts: ReviewImageInsert[] = imageUrls.map(
      (url, index) => ({
        review_id: review.id,
        image_url: url,
        display_order: index,
      })
    );

    const { error: imageError } = await supabase
      .from('review_images')
      .insert(imageInserts);

    if (imageError) {
      throw imageError;
    }
  }

  // 作成したレビューを取得（画像込み）
  const reviewWithImages = await getReviewById(review.id);
  if (!reviewWithImages) {
    throw new Error('レビューの作成に失敗しました');
  }

  return reviewWithImages;
}

/**
 * レビューを更新
 */
export async function updateReview(
  reviewId: string,
  reviewData: ReviewUpdate,
  imageUrls: string[] = []
): Promise<ReviewWithImages> {
  // レビューを更新
  const { error: reviewError } = await supabase
    .from('reviews')
    .update(reviewData)
    .eq('id', reviewId);

  if (reviewError) {
    throw reviewError;
  }

  // 既存の画像を削除
  const { error: deleteError } = await supabase
    .from('review_images')
    .delete()
    .eq('review_id', reviewId);

  if (deleteError) {
    throw deleteError;
  }

  // 新しい画像を追加
  if (imageUrls.length > 0) {
    const imageInserts: ReviewImageInsert[] = imageUrls.map(
      (url, index) => ({
        review_id: reviewId,
        image_url: url,
        display_order: index,
      })
    );

    const { error: imageError } = await supabase
      .from('review_images')
      .insert(imageInserts);

    if (imageError) {
      throw imageError;
    }
  }

  // 更新したレビューを取得（画像込み）
  const reviewWithImages = await getReviewById(reviewId);
  if (!reviewWithImages) {
    throw new Error('レビューの更新に失敗しました');
  }

  return reviewWithImages;
}

/**
 * レビューを削除
 */
export async function deleteReview(reviewId: string): Promise<void> {
  // レビューに紐づく画像のパスを取得（Storageから削除するため）
  const { data: images } = await supabase
    .from('review_images')
    .select('image_url')
    .eq('review_id', reviewId);

  // レビューを削除（CASCADEで画像レコードも削除される）
  const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

  if (error) {
    throw error;
  }

  // Storageから画像を削除（オプション、エラーが発生しても続行）
  if (images && images.length > 0) {
    const filePaths = images.map((img) => {
      // image_urlからパスを抽出（例: https://xxx.supabase.co/storage/v1/object/public/review-images/path/to/image.jpg）
      const urlParts = img.image_url.split('/review-images/');
      return urlParts.length > 1 ? urlParts[1] : null;
    }).filter((path): path is string => path !== null);

    if (filePaths.length > 0) {
      try {
        const { error: storageError } = await supabase.storage
          .from('review-images')
          .remove(filePaths);

        if (storageError) {
          console.warn('Failed to delete images from storage:', storageError);
        }
      } catch (err) {
        console.warn('Error deleting images from storage:', err);
      }
    }
  }
}

