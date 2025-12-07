import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RatingInput } from '../../../../components/RatingInput';
import { ImagePickerComponent } from '../../../../components/ImagePicker';
import { useReviews } from '../../../../hooks/useReviews';
import { getReviewById } from '../../../../lib/api/reviews';
import { uploadReviewImages } from '../../../../lib/api/storage';
import type { RatingValue, ReviewUpdate } from '../../../../lib/types';
import { RATING_LABELS } from '../../../../lib/types';

export default function EditReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { update } = useReviews();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadReview();
    }
  }, [id]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const review = await getReviewById(id!);
      if (review) {
        setStoreName(review.store_name);
        setStoreUrl(review.store_url || '');
        setCrustTexture(review.crust_texture as RatingValue | null);
        setCrumbTexture(review.crumb_texture as RatingValue | null);
        setDoughFlavor(review.dough_flavor as RatingValue | null);
        setFillingAmount(review.filling_amount as RatingValue | null);
        setFillingBalance(review.filling_balance as RatingValue | null);
        setMentaikoSpiciness(review.mentaiko_spiciness as RatingValue | null);
        setOverallBalance(review.overall_balance as RatingValue | null);
        setSatisfaction(review.satisfaction as RatingValue | null);
        setPrice(review.price?.toString() || '');
        setComment(review.comment || '');
        setReviewedAt(review.reviewed_at || '');
        setImageUrls(
          review.images?.map((img: { image_url: string }) => img.image_url) || []
        );
      }
    } catch (error) {
      Alert.alert('エラー', 'レビューの取得に失敗しました');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!storeName.trim()) {
      Alert.alert('エラー', '店名を入力してください');
      return;
    }

    setSaving(true);
    try {
      // 新しい画像をアップロード（ローカルURIの場合）
      const localImageUris = imageUrls.filter((url) => url.startsWith('file://'));
      const existingImageUrls = imageUrls.filter(
        (url) => !url.startsWith('file://')
      );

      let finalImageUrls = [...existingImageUrls];
      if (localImageUris.length > 0) {
        const uploadResults = await uploadReviewImages(localImageUris, id!);
        finalImageUrls = [
          ...finalImageUrls,
          ...uploadResults.map((r: { url: string }) => r.url),
        ];
      }

      // レビューデータを準備
      const reviewData: ReviewUpdate = {
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

      const { error } = await update(id!, reviewData, finalImageUrls);

      if (error) {
        Alert.alert('エラー', error.message);
      } else {
        Alert.alert('完了', 'レビューを更新しました', [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('エラー', 'レビューの更新に失敗しました');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
            editable={!saving}
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
            editable={!saving}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>食べた日</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={reviewedAt}
            onChangeText={setReviewedAt}
            editable={!saving}
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
            editable={!saving}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>画像</Text>
          <ImagePickerComponent
            reviewId={id}
            initialImages={imageUrls}
            onImagesChange={setImageUrls}
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
            editable={!saving}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, saving && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitButtonText}>
            {saving ? '更新中...' : 'レビューを更新'}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

