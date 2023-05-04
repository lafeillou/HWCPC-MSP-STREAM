import axios from "axios";

const request = axios.create({
  timeout: 30000, // 5分钟超时时间
  withCredentials: false,
});

// 响应拦截
request.interceptors.response.use(
  (res) => {
    if (!res?.data) {
      return res;
    }
    const { error_code, data, error_msg } = res.data;
    // 错误码不存在
    if (!error_code) {
      return { ...res.data, resHeader: res.headers };
    }
    // 存在错误
    switch (error_code) {
      case 1000:
        return data;
      default:
        return Promise.reject({ error_code, error_msg });
    }
  },
  async (error) => {
    if (error.response) {
      const { status, config } = error.response;
    }
    return Promise.reject({ message: error.message }); // 本系统的错误
  }
);

export { request };
