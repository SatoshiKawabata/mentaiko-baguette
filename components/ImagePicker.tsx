import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadReviewImage } from '../lib/api/storage';

interface ImagePickerProps {
  reviewId?: string; // レビュー作成時は未設定、編集時は設定
  initialImages?: string[]; // 既存の画像URL
  onImagesChange: (imageUrls: string[]) => void;
  maxImages?: number;
}

export function ImagePickerComponent({
  reviewId,
  initialImages = [],
  onImagesChange,
  maxImages = 5,
}: ImagePickerProps) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        '権限が必要',
        '画像を選択するには、カメラロールへのアクセス権限が必要です。'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    if (images.length >= maxImages) {
      Alert.alert(`最大${maxImages}枚まで選択できます`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploading(true);

        try {
          // レビュー作成時は一時的なURIを保持、編集時はアップロード
          if (reviewId && asset.uri) {
            const uploadResult = await uploadReviewImage(
              asset.uri,
              reviewId
            );
            const newImages = [...images, uploadResult.url];
            setImages(newImages);
            onImagesChange(newImages);
          } else if (asset.uri) {
            // レビュー作成時はローカルURIを保持（後でアップロード）
            const newImages = [...images, asset.uri];
            setImages(newImages);
            onImagesChange(newImages);
          }
        } catch (error) {
          Alert.alert('エラー', '画像のアップロードに失敗しました');
          console.error(error);
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      Alert.alert('エラー', '画像の選択に失敗しました');
      console.error(error);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageGrid}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeImage(index)}
            >
              <View style={styles.removeButtonInner}>
                {/* ここに削除アイコンを配置 */}
              </View>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={pickImage}
            disabled={uploading}
          >
            <View style={styles.addButtonInner}>
              {/* ここに追加アイコンを配置 */}
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonInner: {
    width: 12,
    height: 12,
    backgroundColor: 'white',
  },
  addButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonInner: {
    width: 40,
    height: 40,
    backgroundColor: '#ccc',
  },
});




