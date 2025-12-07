// データベース型定義

export interface Review {
  id: string;
  user_id: string;
  store_name: string;
  store_url: string | null;
  crust_texture: number | null; // 1-5
  crumb_texture: number | null; // 1-5
  dough_flavor: number | null; // 1-5
  filling_amount: number | null; // 1-5
  filling_balance: number | null; // 1-5
  mentaiko_spiciness: number | null; // 1-5
  overall_balance: number | null; // 1-5
  satisfaction: number | null; // 1-5
  price: number | null;
  comment: string | null;
  reviewed_at: string | null; // DATE format: YYYY-MM-DD
  created_at: string; // TIMESTAMP
  updated_at: string; // TIMESTAMP
}

export interface ReviewImage {
  id: string;
  review_id: string;
  image_url: string;
  display_order: number;
  created_at: string; // TIMESTAMP
}

export interface ReviewWithImages extends Review {
  images: ReviewImage[];
}

// レビュー作成用の型（user_idとタイムスタンプは除外）
export type ReviewInsert = Omit<
  Review,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

// レビュー更新用の型（一部フィールドのみ更新可能）
export type ReviewUpdate = Partial<
  Omit<Review, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;

// 画像作成用の型
export type ReviewImageInsert = Omit<
  ReviewImage,
  'id' | 'created_at'
>;

// 評価項目の型
export type RatingValue = 1 | 2 | 3 | 4 | 5;

// 評価項目のラベル
export interface RatingLabels {
  crust_texture: string; // 生地の食感（クラストの「パリッ／カリッ度合い」）
  crumb_texture: string; // 生地の食べやすさ／クラムの「もち／ふわ／しっとり具合」
  dough_flavor: string; // 生地の風味
  filling_amount: string; // フィリング量・存在感
  filling_balance: string; // フィリング味のバランス（塩気・辛さ・旨味）
  mentaiko_spiciness: string; // 明太子の辛さ
  overall_balance: string; // 全体のバランス／調和
  satisfaction: string; // 満足感／好み度
}

export const RATING_LABELS: RatingLabels = {
  crust_texture: '生地の食感（パリッ／カリッ度合い）',
  crumb_texture: '生地の食べやすさ（もち／ふわ／しっとり具合）',
  dough_flavor: '生地の風味',
  filling_amount: 'フィリング量・存在感',
  filling_balance: 'フィリング味のバランス',
  mentaiko_spiciness: '明太子の辛さ',
  overall_balance: '全体のバランス／調和',
  satisfaction: '満足感／好み度',
};

