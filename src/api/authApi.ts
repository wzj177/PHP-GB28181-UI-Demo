import request from '@/utils/request'
import axios from 'axios'

/**
 * 认证 API 服务
 * 对应后端路由：
 * POST /auth/login - 管理员登录
 * POST /auth/logout - 退出登录
 * GET /auth/captcha - 获取验证码
 */
export const authApi = {
  /**
   * 管理员登录
   * POST /auth/login
   */
  login: (username: string, password: string, captcha?: string) => {
    const data: any = {
      username,
      password
    };

    // Only include captcha and checkCaptcha if captcha is provided
    if (captcha) {
      data.checkCaptcha = true;
      data.captcha = captcha;
    }

    // Use X-Public header to bypass authentication token
    return request.post('/admin/auth/login', data, {
      headers: { 'X-Public': true }
    });
  },

  /**
   * 退出登录
   * POST /auth/logout
   */
  logout: () =>
    request.post('/admin/auth/logout'),

  /**
   * 获取验证码图片
   * GET /auth/captcha
   */
  getCaptcha: async () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || '';
    // Use direct axios request to bypass mock and interceptors
    const response = await axios({
      url: `${baseURL}/admin/auth/captcha`,
      method: 'GET',
      responseType: 'blob',
      validateStatus: (status) => status === 200
    });

    return response.data;
  }
}

export default authApi