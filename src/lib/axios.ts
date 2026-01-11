import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; // Import nProgress styles

// Configure nProgress
NProgress.configure({
  showSpinner: false, // Disable spinner for cleaner look
  trickleSpeed: 200, // Adjust progress bar speed
});

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  console.warn('NEXT_PUBLIC_API_URL chưa được thiết lập. Axios sẽ không hoạt động đúng.');
}

const api = axios.create({
  baseURL: baseURL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
    // Nếu bạn cần Authorization token, bạn có thể thêm logic ở đây
    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
});

// Add request interceptor to start nProgress
api.interceptors.request.use(
  (config) => {
    NProgress.start();
    return config;
  },
  (error) => {
    NProgress.done();
    return Promise.reject(error);
  }
);

// Add response interceptor to stop nProgress
api.interceptors.response.use(
  (response) => {
    NProgress.done();
    return response;
  },
  (error) => {
    NProgress.done();
    if (error.response && error.response.status === 401) {
      console.log('Phiên đăng nhập hết hạn hoặc không hợp lệ.');
    }
    return Promise.reject(error);
  }
);

export default api;
