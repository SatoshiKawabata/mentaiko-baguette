import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithMagicLink } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('エラー', 'メールアドレスを入力してください');
      return;
    }

    // 簡単なメールアドレス形式チェック
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('エラー', '有効なメールアドレスを入力してください');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        Alert.alert('エラー', error.message);
      } else {
        Alert.alert(
          'メールを確認してください',
          'ログインリンクをメールで送信しました。メール内のリンクをクリックしてログインしてください。'
        );
      }
    } catch (err) {
      Alert.alert('エラー', 'ログインに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>明太フランス</Text>
        <Text style={styles.subtitle}>レビューアプリ</Text>

        <View style={styles.form}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '送信中...' : 'ログインリンクを送信'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.helpText}>
          メールアドレスを入力すると、ログインリンクが送信されます。
          メール内のリンクをクリックしてログインしてください。
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 48,
  },
  form: {
    marginBottom: 24,
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
    marginBottom: 16,
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
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
