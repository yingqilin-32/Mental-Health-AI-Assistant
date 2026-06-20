import axios from "axios";
import { ElMessage } from 'element-plus';

// Create an Axios instance with default configuration
const apiClient = axios.create({
    baseURL: '/api', // Base URL for the API
    timeout: 5000, // Request timeout in milliseconds
})


//create a request interceptor to add the token to the headers of each request
apiClient.interceptors.request.use(
    (config) => {
    //What to do before sending the request
    const token = localStorage.getItem('token'); // Get the token from local storage
    if(token) {
        config.headers['token'] = token; // Add the token to the headers of the request
    }
    return config;
},

(error) => {
    // What to do if there is an error before sending the request

    return Promise.reject(error);
});


//create a response interceptor to handle the response of each request
apiClient.interceptors.response.use(
    (response) => {
        // What to do with the response data
        const{ data,config } = response;
        console.log('config:', config);
        console.log('data:', data);
        if (String(data.code) === '200') {
            return data;
        } else if (data.code === '-1') {
            ElMessage.error(data.message || 'Expiration Login, please login again.');
            if (!config.url?.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('userInfo');
                window.location.href = '/auth/login';
            }
            return Promise.reject(new Error(data.message || 'Login expired.'));
        } else {
            ElMessage.error(data.message || 'Network request Error...');
            return Promise.reject(new Error(data.message || 'Network request Error...'));
        }
    },
    (error) => {
        // What to do if there is an error with the response
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response error:', error.response.data);
            console.error('Status code:', error.response.status);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error setting up request:', error.message);
        }
        return Promise.reject(error);
    }
);

export default apiClient;
