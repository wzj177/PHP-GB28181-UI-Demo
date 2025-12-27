import request from '@/utils/request';

/**
 * 系统管理 API
 */
export const systemApi = {
  // ================= 系统日志 =================

  /**
   * 获取系统日志
   * GET /admin/system/logs
   */
  getLogs: (params?: {
    level?: string;
    module?: string;
    keyword?: string;
    start_time?: string;
    end_time?: string;
    page?: number;
    limit?: number;
  }) => {
    return request.get('/admin/system/logs', { params });
  },

  /**
   * 导出系统日志
   * GET /admin/system/logs/export
   */
  exportLogs: (params?: any) => {
    return request.get('/admin/system/logs/export', { params, responseType: 'blob' });
  },

  // ================= 系统设置 =================

  /**
   * 获取系统设置
   * GET /admin/system/settings
   */
  getSettings: () => {
    return request.get('/admin/system/settings');
  },

  /**
   * 保存系统设置
   * POST /admin/system/settings
   */
  saveSettings: (data: any) => {
    return request.post('/admin/system/settings', data);
  },

  /**
   * 重置系统设置
   * POST /admin/system/settings/reset
   */
  resetSettings: (type: string) => {
    return request.post('/admin/system/settings/reset', { type });
  },

  // ================= ZLM 配置 =================

  /**
   * 获取 ZLM 配置
   * GET /admin/system/zlm/config
   */
  getZLMConfig: () => {
    return request.get('/admin/system/zlm/config');
  },

  /**
   * 保存 ZLM 配置
   * POST /admin/system/zlm/config
   */
  saveZLMConfig: (data: any) => {
    return request.post('/admin/system/zlm/config', data);
  },

  /**
   * 重置 ZLM 配置
   * POST /admin/system/zlm/config/reset
   */
  resetZLMConfig: () => {
    return request.post('/admin/system/zlm/config/reset');
  },

  /**
   * 重启 ZLM 服务
   * POST /admin/system/zlm/restart
   */
  restartZLM: () => {
    return request.post('/admin/system/zlm/restart');
  }
};

export default systemApi;
