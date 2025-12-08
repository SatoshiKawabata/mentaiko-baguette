import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import type { ReviewWithImages } from '../lib/types';

interface ReviewCardProps {
  review: ReviewWithImages;
  onPress: () => void;
}

export function ReviewCard({ review, onPress }: ReviewCardProps) {
  const thumbnailImage =
    review.images && review.images.length > 0
      ? review.images[0].image_url
      : null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {thumbnailImage && (
        <Image source={{ uri: thumbnailImage }} style={styles.thumbnail} />
      )}
      <View style={styles.content}>
        <Text style={styles.storeName}>{review.store_name}</Text>
        {review.reviewed_at && (
          <Text style={styles.date}>
            {formatDate(review.reviewed_at)}
          </Text>
        )}
        {review.price && (
          <Text style={styles.price}>¥{review.price.toLocaleString()}</Text>
        )}
        {review.comment && (
          <Text style={styles.comment} numberOfLines={2}>
            {review.comment}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginBottom: 4,
  },
  comment: {
    fontSize: 14,
    color: '#333',
    marginTop: 4,
  },
});




