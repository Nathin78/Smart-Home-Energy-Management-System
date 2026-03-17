import axios from 'axios'

// Default to the Vite proxy (`/api`) in dev to avoid CORS.
// Allow overrides in any mode when explicitly provided.
const DEFAULT_API_BASE_URL = '/api'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

// Create axios instance with CORS headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
  timeout: 20000,
})

// Add request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  verifyResetOTP: (otp, newPassword) => apiClient.post('/auth/verify-reset-otp', { otp, newPassword }),
  sendOTP: (email) => apiClient.post('/auth/send-otp', { email }),
  verifyEmail: (otp) => apiClient.post('/auth/verify-email', { otp }),
}

// Device APIs
export const deviceAPI = {
  getDevices: (userId) => apiClient.get('/devices', { params: userId ? { userId } : undefined }),
  addDevice: (deviceData) => apiClient.post('/devices', deviceData),
  updateDevice: (id, deviceData) => apiClient.put(`/devices/${id}`, deviceData),
  deleteDevice: (id) => apiClient.delete(`/devices/${id}`),
  getDeviceConsumption: (id) => apiClient.get(`/devices/${id}/consumption`),
}

// Dashboard APIs
export const dashboardAPI = {
  getEnergyStats: (userId) => apiClient.get('/dashboard/energy-stats', { params: userId ? { userId } : undefined }),
  getTodayConsumption: () => apiClient.get('/dashboard/today-consumption'),
  getMonthlyData: () => apiClient.get('/dashboard/monthly-data'),
  getConsumption: (userId, period) => apiClient.get('/dashboard/consumption', { params: { userId, period } }),
  getRoomWise: (userId) => apiClient.get('/dashboard/room-wise', { params: { userId } }),
  getPreferences: (userId) => apiClient.get('/dashboard/preferences', { params: { userId } }),
  savePreferences: (userId, prefs) => apiClient.post('/dashboard/preferences', prefs, { params: { userId } }),
  // Use 'arraybuffer' which is more reliably handled across browsers
  downloadDailyReport: (userId, date) =>
    apiClient.get('/dashboard/report/daily', {
      params: date ? { userId, date } : { userId },
      responseType: 'arraybuffer',
    }),
  downloadWeeklyReport: (userId) => apiClient.get(`/dashboard/report/weekly?userId=${userId}`, { responseType: 'arraybuffer' }),
  downloadMonthlyReport: (userId) => apiClient.get(`/dashboard/report/monthly?userId=${userId}`, { responseType: 'arraybuffer' }),
}

// Room APIs
export const roomAPI = {
  getRooms: (userId) => apiClient.get('/rooms', { params: { userId } }),
  addRoom: (userId, name) => apiClient.post('/rooms', { name }, { params: { userId } }),
}

// User APIs
export const userAPI = {
  updateProfile: (userId, profileData) => apiClient.put(`/users/${userId}/profile`, profileData),
}

export default apiClient
