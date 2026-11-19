import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Resuelve la URL base del backend local:
 * 1. En navegador Web en la misma PC: http://localhost:3000.
 * 2. Si Expo Go informa hostUri de Metro (ej. "192.168.1.6:8081"), usa automáticamente esa misma IP LAN en el puerto 3000.
 * 3. EXPO_PUBLIC_API_URL desde .env.
 * 4. Fallback emulador Android: http://10.0.2.2:3000 / iOS: http://localhost:3000.
 */
function resolverUrlBaseApi() {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  const hostMetro =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostMetro) {
    const ipLan = hostMetro.split(':')[0];
    if (ipLan && ipLan !== 'localhost' && ipLan !== '127.0.0.1') {
      return `http://${ipLan}:3000`;
    }
  }

  const urlEntorno = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (urlEntorno) {
    return urlEntorno.replace(/\/+$/, '');
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
}

export const URL_BASE_API = resolverUrlBaseApi();

if (__DEV__) {
  console.log(`[AI Ticket It] URL de API Backend: ${URL_BASE_API}/api`);
}
