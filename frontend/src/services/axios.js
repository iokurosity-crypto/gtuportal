import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
console.log('📡 Axios initialized with baseURL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  timeout: 15000,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aluverse_token") || localStorage.getItem("authToken");
  const method = String(config.method || "GET").toUpperCase();
  console.log(`📤 [REQUEST] ${method} ${config.url}`);
  console.log(`  - Full URL: ${baseURL}${config.url}`);
  console.log(`  - Token: ${token ? '✓ present' : '✗ missing'}`);
  console.log(`  - Data:`, config.data);
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('  - Auth header: ✓ Bearer token added');
  }
  return config;
}, (error) => {
  console.error('❌ [REQUEST INTERCEPTOR] Error:', error);
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    const method = String(response.config.method || "GET").toUpperCase();
    console.log(`📥 [RESPONSE] ${method} ${response.config.url}`);
    console.log(`  - Status: ${response.status}`);
    console.log(`  - Data:`, response.data);
    return response;
  },
  (error) => {
    const method = error.config?.method?.toUpperCase() || "UNKNOWN";
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Skip verbose logging for expected 404s (missing data)
    const is404ForMissingData = status === 404 && (
      url.includes('/users/') || 
      url.includes('/posts/') ||
      url.includes('/events/') ||
      url.includes('/challenges/')
    );
    
    if (!is404ForMissingData) {
      console.error(`❌ [RESPONSE ERROR] ${method} ${url}`);
      console.error('  - Status:', status);
      console.error('  - Message:', error.response?.data?.message);
      console.error('  - Error:', error.message);
    }
    
    if (error.code === 'ECONNABORTED') {
      console.error('  - Reason: REQUEST TIMEOUT (15s exceeded)');
    } else if (error.code === 'ERR_NETWORK') {
      console.error('  - Reason: NETWORK ERROR - Cannot reach server at', baseURL);
    } else if (!error.response && !is404ForMissingData) {
      console.error('  - Reason: NO RESPONSE - Server may be down');
      console.error('  - Trying to reach:', baseURL);
    }
    
    const requestUrl = String(error.config?.url || "");
    const hadAuthHeader = Boolean(error.config?.headers?.Authorization);
    const shouldForceLogout =
      error.response?.status === 401 &&
      hadAuthHeader &&
      !requestUrl.includes("/auth/login") &&
      !requestUrl.includes("/auth/verify-temp-password") &&
      !requestUrl.includes("/auth/signup") &&
      !requestUrl.includes("/auth/self-register") &&
      !requestUrl.includes("/auth/forgot-password") &&
      !requestUrl.includes("/auth/reset-password");

    if (shouldForceLogout) {
      console.warn('⚠️ [401 UNAUTHORIZED] Clearing token and redirecting to login');
      localStorage.removeItem("aluverse_token");
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
