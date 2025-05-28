import axios from 'axios';

const api = axios.create({
  baseURL: 'https://fastfood-online-backend.onrender.com',
  timeout: 5000, 
});

export default api;
