import axios from 'axios'

export const axiosInstance  = axios.create({
    baseURL: 'https://aithur-ai.onrender.com/api/v1',
    withCredentials: true
});
