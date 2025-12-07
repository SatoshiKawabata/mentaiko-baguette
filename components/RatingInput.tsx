import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { RatingValue } from '../lib/types';

interface RatingInputProps {
  label: string;
  value: RatingValue | null;
  onChange: (value: RatingValue) => void;
}

export function RatingInput({ label, value, onChange }: RatingInputProps) {
  const ratings: RatingValue[] = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.ratingContainer}>
        {ratings.map((rating) => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              value === rating && styles.ratingButtonSelected,
            ]}
            onPress={() => onChange(rating)}
          >
            <Text
              style={[
                styles.ratingText,
                value === rating && styles.ratingTextSelected,
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  ratingButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  ratingTextSelected: {
    color: '#fff',
  },
});

