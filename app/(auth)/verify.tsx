import { useEffect, useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Linking,
} from 'react-native';
import { supabase } from '../../lib/supabase';

export default function AuthVerify() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading'
  );
  const [message, setMessage] = useState('認証中...');

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // URLパラメータからトークンとタイプを取得
        const token = (params.token as string) || '';
        const type = (params.type as string) || 'magiclink';
        const redirectTo = (params.redirect_to as string) || '';

        if (!token) {
          setStatus('error');
          setMessage('トークンが見つかりません');
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
          return;
        }

        // Supabaseのverifyエンドポイントを開いて、Deep Linkにリダイレクトさせる
        // これにより、Supabaseがトークンを検証し、セッションを設定してからDeep Linkにリダイレクトする
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        const finalRedirectTo =
          redirectTo || 'mentaiko-baguette://auth/callback';
        const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${encodeURIComponent(token)}&type=${type}&redirect_to=${encodeURIComponent(finalRedirectTo)}`;

        setMessage('認証を処理しています...');

        // Supabaseのverifyエンドポイントを開く
        // これにより、Supabaseがトークンを検証し、セッションを設定してからDeep Linkにリダイレクトする
        const canOpen = await Linking.canOpenURL(verifyUrl);
        if (canOpen) {
          await Linking.openURL(verifyUrl);
          setMessage('認証を完了しています...');

          // Deep Linkが処理されるまで少し待つ
          // セッションが設定されるのを待つ
          let attempts = 0;
          const maxAttempts = 15;
          const checkSession = setInterval(async () => {
            attempts++;
            const {
              data: { session },
            } = await supabase.auth.getSession();

            if (session) {
              clearInterval(checkSession);
              setStatus('success');
              setMessage('認証が完了しました');
              setTimeout(() => {
                router.replace('/(tabs)/reviews');
              }, 500);
            } else if (attempts >= maxAttempts) {
              clearInterval(checkSession);
              setStatus('error');
              setMessage(
                '認証に失敗しました。メールのリンクを再度クリックしてください。'
              );
              setTimeout(() => {
                router.replace('/(auth)/login');
              }, 3000);
            }
          }, 500);
        } else {
          setStatus('error');
          setMessage('認証URLを開けませんでした');
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('認証に失敗しました');
        setTimeout(() => {
          router.replace('/(auth)/login');
        }, 2000);
      }
    };

    handleVerification();
  }, [params, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={status === 'error' ? '#ff3b30' : '#007AFF'}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
