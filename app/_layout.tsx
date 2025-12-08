import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Linking from 'expo-linking';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

export default function RootLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Deep Linkの処理
    const handleDeepLink = async (url: string) => {
      const parsed = Linking.parse(url);

      // パスの解析（複数の形式に対応）
      const path = parsed.path || '';
      const hostname = parsed.hostname || '';
      const queryParams = parsed.queryParams || {};

      // mentaiko-baguette://auth/callback 形式
      if (hostname === 'auth' && path === 'callback') {
        router.push({
          pathname: '/(auth)/callback',
          params: queryParams,
        });
        return;
      }

      // Supabase認証URLの処理
      // https://xxx.supabase.co/auth/v1/verify?token=...&type=magiclink&redirect_to=...
      if (
        parsed.hostname?.includes('supabase.co') &&
        path?.includes('/auth/v1/verify')
      ) {
        router.push({
          pathname: '/(auth)/verify',
          params: queryParams,
        });
        return;
      }

      // exp://localhost:8081/--/(auth)/callback 形式（Expo Go用）
      if (path.includes('(auth)/callback') || path.includes('auth/callback')) {
        router.push({
          pathname: '/(auth)/callback',
          params: queryParams,
        });
        return;
      }

      // URLパラメータから直接トークンを取得する場合
      if (queryParams.access_token || queryParams['#access_token']) {
        router.push({
          pathname: '/(auth)/callback',
          params: queryParams,
        });
      }
    };

    // アプリ起動時のDeep Linkを処理
    Linking.getInitialURL()
      .then((url) => {
        if (url) {
          handleDeepLink(url);
        }
      })
      .catch((err) => {
        console.error('Error getting initial URL:', err);
      });

    // Deep Linkのリスナーを設定
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // 未認証の場合はログイン画面へ
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup && segments[1] !== 'callback') {
      // 認証済みの場合はレビュー一覧へ（コールバック画面は除く）
      router.replace('/(tabs)/reviews');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
