-- 明太フランスレビューアプリ 初期スキーマ
-- ユーザー情報は auth.users テーブルを使用（追加の profiles テーブルは作成しない）

-- ============================================
-- 1. reviews テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    store_url TEXT NULL,
    crust_texture INTEGER CHECK (crust_texture >= 1 AND crust_texture <= 5) NULL,
    crumb_texture INTEGER CHECK (crumb_texture >= 1 AND crumb_texture <= 5) NULL,
    dough_flavor INTEGER CHECK (dough_flavor >= 1 AND dough_flavor <= 5) NULL,
    filling_amount INTEGER CHECK (filling_amount >= 1 AND filling_amount <= 5) NULL,
    filling_balance INTEGER CHECK (filling_balance >= 1 AND filling_balance <= 5) NULL,
    mentaiko_spiciness INTEGER CHECK (mentaiko_spiciness >= 1 AND mentaiko_spiciness <= 5) NULL,
    overall_balance INTEGER CHECK (overall_balance >= 1 AND overall_balance <= 5) NULL,
    satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5) NULL,
    price INTEGER NULL,
    comment TEXT NULL,
    reviewed_at DATE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- reviews テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_store_name ON public.reviews(store_name);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_at ON public.reviews(reviewed_at);

-- ============================================
-- 2. review_images テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS public.review_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- review_images テーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_review_images_review_id ON public.review_images(review_id);
CREATE INDEX IF NOT EXISTS idx_review_images_display_order ON public.review_images(review_id, display_order);

-- ============================================
-- 3. RLS (Row Level Security) ポリシー
-- ============================================

-- reviews テーブルのRLSを有効化
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- reviews テーブルのRLSポリシー
-- SELECT: ユーザーは自分のレビューのみ閲覧可能
CREATE POLICY "Users can view their own reviews"
    ON public.reviews
    FOR SELECT
    USING (auth.uid() = user_id);

-- INSERT: 認証済みユーザーは自分のレビューのみ作成可能
CREATE POLICY "Users can insert their own reviews"
    ON public.reviews
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- UPDATE: ユーザーは自分のレビューのみ更新可能
CREATE POLICY "Users can update their own reviews"
    ON public.reviews
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- DELETE: ユーザーは自分のレビューのみ削除可能
CREATE POLICY "Users can delete their own reviews"
    ON public.reviews
    FOR DELETE
    USING (auth.uid() = user_id);

-- review_images テーブルのRLSを有効化
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;

-- review_images テーブルのRLSポリシー
-- SELECT: レビューを閲覧できるユーザーは、そのレビューの画像も閲覧可能
CREATE POLICY "Users can view images of their own reviews"
    ON public.review_images
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE reviews.id = review_images.review_id
            AND reviews.user_id = auth.uid()
        )
    );

-- INSERT: レビューを作成できるユーザーは、そのレビューの画像も作成可能
CREATE POLICY "Users can insert images to their own reviews"
    ON public.review_images
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE reviews.id = review_images.review_id
            AND reviews.user_id = auth.uid()
        )
    );

-- UPDATE: レビューを更新できるユーザーは、そのレビューの画像も更新可能
CREATE POLICY "Users can update images of their own reviews"
    ON public.review_images
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE reviews.id = review_images.review_id
            AND reviews.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE reviews.id = review_images.review_id
            AND reviews.user_id = auth.uid()
        )
    );

-- DELETE: レビューを削除できるユーザーは、そのレビューの画像も削除可能
CREATE POLICY "Users can delete images of their own reviews"
    ON public.review_images
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.reviews
            WHERE reviews.id = review_images.review_id
            AND reviews.user_id = auth.uid()
        )
    );

-- ============================================
-- 4. トリガー関数: updated_at の自動更新
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- reviews テーブルにトリガーを設定
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. Storage バケット作成（コメント）
-- ============================================
-- 注意: Storage バケットは Supabase Dashboard から手動で作成する必要があります
-- バケット名: review-images
-- 公開バケット: false（認証済みユーザーのみアクセス可能）
-- ファイルサイズ制限: 10MB
-- 許可されるファイル形式: jpg, jpeg, png, webp
--
-- Storage ポリシーは Supabase Dashboard の Storage セクションから設定してください:
-- - アップロード: 認証済みユーザーのみ
-- - ダウンロード: レビューを閲覧できるユーザーのみ
-- - 削除: レビューを削除できるユーザーのみ

