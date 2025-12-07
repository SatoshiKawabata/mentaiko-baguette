import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { RatingInput } from '../../../components/RatingInput';
import { ImagePickerComponent } from '../../../components/ImagePicker';
import { useReviews } from '../../../hooks/useReviews';
import { uploadReviewImages } from '../../../lib/api/storage';
import type { RatingValue, ReviewInsert } from '../../../lib/types';
import { RATING_LABELS } from '../../../lib/types';

export default function CreateReviewScreen() {
  const router = useRouter();
  const { create } = useReviews();
  const [loading, setLoading] = useState(false);

  // フォーム状態
  const [storeName, setStoreName] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [crustTexture, setCrustTexture] = useState<RatingValue | null>(null);
  const [crumbTexture, setCrumbTexture] = useState<RatingValue | null>(null);
  const [doughFlavor, setDoughFlavor] = useState<RatingValue | null>(null);
  const [fillingAmount, setFillingAmount] = useState<RatingValue | null>(null);
  const [fillingBalance, setFillingBalance] = useState<RatingValue | null>(
    null
  );
  const [mentaikoSpiciness, setMentaikoSpiciness] =
    useState<RatingValue | null>(null);
  const [overallBalance, setOverallBalance] = useState<RatingValue | null>(
    null
  );
  const [satisfaction, setSatisfaction] = useState<RatingValue | null>(null);
  const [price, setPrice] = useState('');
  const [comment, setComment] = useState('');
  const [reviewedAt, setReviewedAt] = useState('');
  const [imageUris, setImageUris] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (!storeName.trim()) {
      Alert.alert('エラー', '店名を入力してください');
      return;
    }

    setLoading(true);
    try {
      // レビューを作成（一時的なIDを生成）
      const tempReviewId = `temp-${Date.now()}`;

      // 画像をアップロード（ローカルURIの場合）
      let imageUrls: string[] = [];
      if (imageUris.length > 0) {
        const uploadResults = await uploadReviewImages(imageUris, tempReviewId);
        imageUrls = uploadResults.map((r) => r.url);
      }

      // レビューデータを準備
      const reviewData: ReviewInsert = {
        store_name: storeName.trim(),
        store_url: storeUrl.trim() || null,
        crust_texture: crustTexture,
        crumb_texture: crumbTexture,
        dough_flavor: doughFlavor,
        filling_amount: fillingAmount,
        filling_balance: fillingBalance,
        mentaiko_spiciness: mentaikoSpiciness,
        overall_balance: overallBalance,
        satisfaction: satisfaction,
        price: price ? parseInt(price, 10) : null,
        comment: comment.trim() || null,
        reviewed_at: reviewedAt || null,
      };

      const { error } = await create(reviewData, imageUrls);

      if (error) {
        Alert.alert('エラー', error.message);
      } else {
        Alert.alert('完了', 'レビューを投稿しました', [
          {
            text: 'OK',
            onPress: () => router.replace('/reviews'),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('エラー', 'レビューの投稿に失敗しました');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>店名 *</Text>
          <TextInput
            style={styles.input}
            placeholder="店名を入力"
            value={storeName}
            onChangeText={setStoreName}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>店のリンク</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com"
            value={storeUrl}
            onChangeText={setStoreUrl}
            keyboardType="url"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>食べた日</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={reviewedAt}
            onChangeText={setReviewedAt}
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>価格（円）</Text>
          <TextInput
            style={styles.input}
            placeholder="500"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>画像</Text>
          <ImagePickerComponent
            initialImages={[]}
            onImagesChange={setImageUris}
            maxImages={5}
          />
        </View>

        <RatingInput
          label={RATING_LABELS.crust_texture}
          value={crustTexture}
          onChange={setCrustTexture}
        />
        <RatingInput
          label={RATING_LABELS.crumb_texture}
          value={crumbTexture}
          onChange={setCrumbTexture}
        />
        <RatingInput
          label={RATING_LABELS.dough_flavor}
          value={doughFlavor}
          onChange={setDoughFlavor}
        />
        <RatingInput
          label={RATING_LABELS.filling_amount}
          value={fillingAmount}
          onChange={setFillingAmount}
        />
        <RatingInput
          label={RATING_LABELS.filling_balance}
          value={fillingBalance}
          onChange={setFillingBalance}
        />
        <RatingInput
          label={RATING_LABELS.mentaiko_spiciness}
          value={mentaikoSpiciness}
          onChange={setMentaikoSpiciness}
        />
        <RatingInput
          label={RATING_LABELS.overall_balance}
          value={overallBalance}
          onChange={setOverallBalance}
        />
        <RatingInput
          label={RATING_LABELS.satisfaction}
          value={satisfaction}
          onChange={setSatisfaction}
        />

        <View style={styles.field}>
          <Text style={styles.label}>コメント</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="総合コメントを入力"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? '投稿中...' : 'レビューを投稿'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

