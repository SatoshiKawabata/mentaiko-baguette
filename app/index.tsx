import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace('/(tabs)/reviews');
    } else {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}




