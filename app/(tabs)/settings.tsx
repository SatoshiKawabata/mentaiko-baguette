import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const handleSignOut = async () => {
    Alert.alert('ログアウト', 'ログアウトしますか？', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: 'ログアウト',
        style: 'destructive',
        onPress: async () => {
          const { error } = await signOut();
          if (error) {
            Alert.alert('エラー', 'ログアウトに失敗しました');
          } else {
            router.replace('/(auth)/login');
          }
        },
      },
    ]);
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください');
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail.trim(),
      });

      if (error) {
        Alert.alert('エラー', error.message);
      } else {
        Alert.alert(
          '確認メールを送信しました',
          '新しいメールアドレスに確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。'
        );
        setNewEmail('');
      }
    } catch (error) {
      Alert.alert('エラー', 'メールアドレスの変更に失敗しました');
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アカウント情報</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>メールアドレス</Text>
          <Text style={styles.infoValue}>{user?.email || '未設定'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ユーザーID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {user?.id || '未設定'}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>メールアドレス変更</Text>
        <TextInput
          style={styles.input}
          placeholder="新しいメールアドレス"
          value={newEmail}
          onChangeText={setNewEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          editable={!updating}
        />
        <TouchableOpacity
          style={[styles.button, updating && styles.buttonDisabled]}
          onPress={handleUpdateEmail}
          disabled={updating}
        >
          <Text style={styles.buttonText}>
            {updating ? '更新中...' : 'メールアドレスを変更'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleSignOut}
        >
          <Text style={[styles.buttonText, styles.dangerButtonText]}>
            ログアウト
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.versionText}>バージョン 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#ff3b30',
  },
  dangerButtonText: {
    color: '#fff',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
