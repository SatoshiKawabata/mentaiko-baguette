import { supabase } from '../supabase';

const BUCKET_NAME = 'review-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadImageResult {
  url: string;
  path: string;
}

/**
 * 画像をSupabase Storageにアップロード
 * @param fileUri ローカルファイルURI（expo-image-pickerから取得）
 * @param reviewId レビューID（パスに含める）
 * @param fileName ファイル名（オプション）
 * @returns アップロードされた画像のURLとパス
 */
export async function uploadReviewImage(
  fileUri: string,
  reviewId: string,
  fileName?: string
): Promise<UploadImageResult> {
  try {
    // ファイル名を生成（reviewId/timestamp-random.ext）
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = fileName?.split('.').pop() || 'jpg';
    const filePath = `${reviewId}/${timestamp}-${random}.${ext}`;

    // ファイルを読み込む
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // ファイルサイズチェック
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error('ファイルサイズが10MBを超えています');
    }

    // Supabase Storageにアップロード
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType: blob.type || 'image/jpeg',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 公開URLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * 複数の画像をアップロード
 */
export async function uploadReviewImages(
  fileUris: string[],
  reviewId: string
): Promise<UploadImageResult[]> {
  const uploadPromises = fileUris.map((uri, index) =>
    uploadReviewImage(uri, reviewId, `image-${index}.jpg`)
  );
  return Promise.all(uploadPromises);
}

/**
 * 画像を削除
 */
export async function deleteReviewImage(filePath: string): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    throw error;
  }
}

/**
 * 複数の画像を削除
 */
export async function deleteReviewImages(filePaths: string[]): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(filePaths);

  if (error) {
    throw error;
  }
}

