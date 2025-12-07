import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getReviewById, deleteReview } from '../../../lib/api/reviews';
import type { ReviewWithImages } from '../../../lib/types';
import { RATING_LABELS } from '../../../lib/types';

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [review, setReview] = useState<ReviewWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadReview();
    }
  }, [id]);

  const loadReview = async () => {
    try {
      setLoading(true);
      const data = await getReviewById(id!);
      setReview(data);
    } catch (error) {
      Alert.alert('エラー', 'レビューの取得に失敗しました');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      '削除確認',
      'このレビューを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteReview(id!);
              Alert.alert('削除完了', 'レビューを削除しました');
              router.back();
            } catch (error) {
              Alert.alert('エラー', '削除に失敗しました');
              console.error(error);
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getRatingValue = (value: number | null) => {
    if (value === null) return '未評価';
    return `${value}/5`;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!review) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>レビューが見つかりません</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {review.images && review.images.length > 0 && (
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {review.images.map((img, index) => (
            <Image
              key={img.id}
              source={{ uri: img.image_url }}
              style={styles.image}
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.content}>
        <Text style={styles.storeName}>{review.store_name}</Text>
        {review.store_url && (
          <Text style={styles.storeUrl}>{review.store_url}</Text>
        )}
        {review.reviewed_at && (
          <Text style={styles.date}>食べた日: {formatDate(review.reviewed_at)}</Text>
        )}
        {review.price && (
          <Text style={styles.price}>¥{review.price.toLocaleString()}</Text>
        )}

        <View style={styles.ratingsSection}>
          <Text style={styles.sectionTitle}>評価</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.crust_texture}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.crust_texture)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.crumb_texture}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.crumb_texture)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.dough_flavor}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.dough_flavor)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.filling_amount}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.filling_amount)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.filling_balance}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.filling_balance)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.mentaiko_spiciness}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.mentaiko_spiciness)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.overall_balance}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.overall_balance)}
            </Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS.satisfaction}
            </Text>
            <Text style={styles.ratingValue}>
              {getRatingValue(review.satisfaction)}
            </Text>
          </View>
        </View>

        {review.comment && (
          <View style={styles.commentSection}>
            <Text style={styles.sectionTitle}>コメント</Text>
            <Text style={styles.comment}>{review.comment}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/reviews/${id}/edit`)}
          >
            <Text style={styles.editButtonText}>編集</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}
          >
            <Text style={styles.deleteButtonText}>
              {deleting ? '削除中...' : '削除'}
            </Text>
          </TouchableOpacity>
        </View>
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
  imageScroll: {
    height: 300,
  },
  image: {
    width: 400,
    height: 300,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  storeUrl: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 24,
  },
  ratingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  commentSection: {
    marginBottom: 24,
  },
  comment: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#ff3b30',
  },
});

