# 明太フランス (Mentaiko Baguette) 🥖

明太子入りフランスパン専用レビューアプリ

## 📱 概要

「明太フランス」は、明太子入りフランスパン（明太フランス）のレビューを投稿・管理するためのモバイルアプリです。店名、評価項目、画像、コメントなどを記録し、自分だけのレビューコレクションを作成できます。

## 🛠️ 技術スタック

- **フロントエンド**
  - React Native
  - Expo SDK 51+
  - Expo Router v3 (ファイルベースルーティング)
  - TypeScript
  - Expo UI

- **バックエンド**
  - Supabase
    - PostgreSQL (データベース)
    - Supabase Auth (認証 - Magic Link)
    - Supabase Storage (画像ストレージ)

- **主要ライブラリ**
  - `@supabase/supabase-js`: Supabaseクライアント
  - `expo-image-picker`: 画像選択機能
  - `@react-native-async-storage/async-storage`: ローカルストレージ

## 📋 機能

- ✅ パスワードレス認証 (Magic Link)
- ✅ レビューの作成・編集・削除・一覧表示
- ✅ 複数画像のアップロード
- ✅ 9つの評価項目（5段階評価）
  - 生地の食感（パリッ／カリッ度合い）
  - 生地の食べやすさ（もち／ふわ／しっとり具合）
  - 生地の風味
  - フィリング量・存在感
  - フィリング味のバランス
  - 明太子の辛さ
  - 全体のバランス／調和
  - 満足感／好み度
- ✅ 店名、店のリンク、価格、コメントの記録
- ✅ 食べた日付の記録
- ✅ 設定画面（メールアドレス変更、ログアウト）

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd mentaiko-baguette
```

### 2. 依存関係のインストール

```bash
npm install
# または
yarn install
```

### 3. Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. プロジェクトのURLとAnon Keyを取得
3. 環境変数の設定
   - `.env.example`ファイルをコピーして`.env`ファイルを作成
   - `.env`ファイルに実際のSupabaseのURLとAnon Keyを設定

```bash
cp .env.example .env
```

`.env`ファイルを編集して、以下の値を設定してください：

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. データベースマイグレーションの実行

1. Supabase DashboardのSQL Editorを開く
2. `supabase/migrations/20240101000000_initial_schema.sql`の内容を実行
3. Storageバケットを作成:
   - バケット名: `review-images`
   - 公開バケット: `false`
   - ファイルサイズ制限: 10MB
   - 許可されるファイル形式: jpg, jpeg, png, webp

### 5. アプリの起動

```bash
npm start
# または
yarn start
```

その後、iOSシミュレーター、Androidエミュレーター、または実機でアプリを起動します。

## 📁 ディレクトリ構成

```
mentaiko-baguette/
├── app/                          # Expo Routerの画面コンポーネント
│   ├── (auth)/                  # 認証関連画面
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (tabs)/                  # タブナビゲーション画面
│   │   ├── _layout.tsx
│   │   ├── reviews/            # レビュー関連画面
│   │   │   ├── index.tsx        # レビュー一覧
│   │   │   ├── [id].tsx         # レビュー詳細
│   │   │   ├── create.tsx       # レビュー作成
│   │   │   └── [id]/
│   │   │       └── edit.tsx     # レビュー編集
│   │   └── settings.tsx         # 設定画面
│   ├── _layout.tsx              # ルートレイアウト
│   └── index.tsx                 # エントリーポイント
├── components/                   # 再利用可能なコンポーネント
│   ├── ReviewCard.tsx
│   ├── RatingInput.tsx
│   └── ImagePicker.tsx
├── lib/                          # ライブラリ・ユーティリティ
│   ├── supabase.ts              # Supabaseクライアント設定
│   ├── types.ts                 # TypeScript型定義
│   └── api/                     # APIラッパー
│       ├── reviews.ts           # レビューCRUD操作
│       └── storage.ts           # 画像アップロード処理
├── hooks/                        # カスタムフック
│   ├── useAuth.ts               # 認証フック
│   └── useReviews.ts            # レビュー管理フック
├── utils/                        # ユーティリティ関数
│   └── validation.ts            # バリデーション関数
├── supabase/                     # Supabase設定
│   └── migrations/               # データベースマイグレーション
│       └── 20240101000000_initial_schema.sql
├── app.json                      # Expo設定
├── package.json                  # 依存関係
├── tsconfig.json                 # TypeScript設定
├── .env.example                  # 環境変数のテンプレート
└── README.md                     # このファイル
```

## 🗄️ データベーススキーマ

### reviews テーブル

レビュー情報を格納するメインテーブル。

- `id`: UUID (主キー)
- `user_id`: UUID (auth.usersを参照)
- `store_name`: TEXT (必須)
- `store_url`: TEXT (任意)
- `crust_texture`: INTEGER (1-5, 任意)
- `crumb_texture`: INTEGER (1-5, 任意)
- `dough_flavor`: INTEGER (1-5, 任意)
- `filling_amount`: INTEGER (1-5, 任意)
- `filling_balance`: INTEGER (1-5, 任意)
- `mentaiko_spiciness`: INTEGER (1-5, 任意)
- `overall_balance`: INTEGER (1-5, 任意)
- `satisfaction`: INTEGER (1-5, 任意)
- `price`: INTEGER (任意)
- `comment`: TEXT (任意)
- `reviewed_at`: DATE (任意)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### review_images テーブル

レビューに紐づく画像URLを管理。

- `id`: UUID (主キー)
- `review_id`: UUID (reviewsを参照)
- `image_url`: TEXT (必須)
- `display_order`: INTEGER (表示順序)
- `created_at`: TIMESTAMP

### Row Level Security (RLS)

- ユーザーは自分のレビューのみ閲覧・編集・削除可能
- 認証済みユーザーのみレビューを作成可能

## 🔐 認証

- Magic Link認証を使用（パスワード不要）
- メールアドレスを入力すると、ログインリンクが送信される
- メール内のリンクをクリックしてログイン

## 📸 画像アップロード

- `expo-image-picker`を使用して画像を選択
- Supabase Storageにアップロード
- 1レビューあたり最大5枚まで
- ファイルサイズ制限: 10MB
- 対応形式: jpg, jpeg, png, webp

## 🧪 開発

### 型チェック

```bash
npx tsc --noEmit
```

### リンター

```bash
npx eslint .
```

## 📝 ライセンス

このプロジェクトは個人利用を目的としています。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

---

## 📖 Overview (English)

**Mentaiko Baguette** is a mobile app for reviewing mentaiko-filled French bread (mentaiko baguette). Record store names, ratings, images, and comments to create your own review collection.

### Features

- Passwordless authentication (Magic Link)
- Create, edit, delete, and list reviews
- Multiple image uploads
- 9 rating categories (5-point scale)
- Store information, price, and comments
- Date tracking

### Tech Stack

- React Native + Expo SDK 51+
- Expo Router v3
- TypeScript
- Supabase (PostgreSQL, Auth, Storage)

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project:
   - Copy `.env.example` to `.env`
   - Configure your Supabase URL and Anon Key in `.env`
4. Run database migrations
5. Start the app: `npm start`

For detailed setup instructions, see the Japanese section above.
