import { useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // URLパラメータからトークンを取得（複数の形式に対応）
        const access_token =
          (params.access_token as string) ||
          (params['#access_token'] as string) ||
          (params['access_token'] as string);
        const refresh_token =
          (params.refresh_token as string) ||
          (params['#refresh_token'] as string) ||
          (params['refresh_token'] as string);
        const type = params.type as string;

        if (type === 'recovery') {
          // パスワードリセットの場合は別の処理
          router.replace('/(auth)/login');
          return;
        }

        if (access_token && refresh_token) {
          // セッションを設定
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token,
          });

          if (error) {
            console.error('Auth callback error:', error);
            router.replace('/(auth)/login');
          } else if (data.session) {
            // 認証成功
            router.replace('/(tabs)/reviews');
          } else {
            router.replace('/(auth)/login');
          }
        } else {
          // トークンが見つからない場合はログイン画面へ
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        router.replace('/(auth)/login');
      }
    };

    handleAuthCallback();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>認証中...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
