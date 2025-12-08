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

        // Supabaseの認証URLを再構築して、Deep Linkにリダイレクトさせる
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
        const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${token}&type=${type}&redirect_to=${encodeURIComponent(redirectTo || 'mentaiko-baguette://auth/callback')}`;

        // 認証URLを開く（ブラウザまたはアプリ内で）
        // これにより、SupabaseがDeep Linkにリダイレクトする
        const canOpen = await Linking.canOpenURL(verifyUrl);
        if (canOpen) {
          await Linking.openURL(verifyUrl);
          setMessage('認証ページを開いています...');

          // 少し待ってからセッションを確認
          setTimeout(async () => {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session) {
              setStatus('success');
              setMessage('認証が完了しました');
              router.replace('/(tabs)/reviews');
            } else {
              setStatus('error');
              setMessage(
                '認証に失敗しました。メールのリンクを再度クリックしてください。'
              );
              setTimeout(() => {
                router.replace('/(auth)/login');
              }, 3000);
            }
          }, 2000);
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
