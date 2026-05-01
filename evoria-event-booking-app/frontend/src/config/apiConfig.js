import Constants from 'expo-constants';

// Base URL for the backend API.
//
// Priority order:
// 1) EXPO_PUBLIC_API_BASE_URL (for production / hosted backend)
// 2) Auto-detect Metro host (useful for Expo QR on phone; avoids hardcoding LAN IP)
// 3) Fallback to localhost (web/emulator)

const parseHost = (hostPort) => {
	if (!hostPort || typeof hostPort !== 'string') return null;
	// Examples:
	// - "192.168.1.10:19000"
	// - "localhost:19000"
	// - "exp.direct:443"
	const host = hostPort.split(':')[0]?.trim();
	return host || null;
};

const getDevHostFromExpo = () => {
	// In dev, Expo provides a "debuggerHost" that points to the machine running Metro.
	// This is the best signal for “what IP should my phone use to reach my computer?”.
	const debuggerHost =
		Constants?.expoConfig?.hostUri ||
		Constants?.manifest2?.extra?.expoClient?.hostUri ||
		Constants?.manifest?.debuggerHost ||
		Constants?.manifest2?.extra?.expoGo?.debuggerHost;

	const host = parseHost(debuggerHost);
	if (!host) return null;

	// If you are using Expo tunnel, host can be something like exp.direct.
	// In that case your phone cannot reach a local backend by host name,
	// so you must use a hosted API (set EXPO_PUBLIC_API_BASE_URL).
	if (host.includes('exp.direct')) return null;

	return host;
};

const getAutoDetectedApiBaseUrl = () => {
	const host = getDevHostFromExpo();
	if (!host) return null;

	// Backend runs on your machine at port 5000.
	// When using Expo QR on a phone, this must be your machine’s LAN IP.
	if (host === 'localhost' || host === '127.0.0.1') {
		return 'http://localhost:5000/api';
	}
	return `http://${host}:5000/api`;
};

export const API_BASE_URL =
	process.env.EXPO_PUBLIC_API_BASE_URL ||
	getAutoDetectedApiBaseUrl() ||
	'http://localhost:5000/api';
