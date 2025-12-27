import request from '@/utils/request';

/**
 * 系统监控 API 服务
 * 对应后端路由：
 * GET /admin/api/system/stats - 系统资源统计
 * GET /admin/api/system/device-stats - 设备统计
 * GET /admin/api/system/zlm-stats - ZLMediaKit 统计
 * GET /admin/system/cpu-usage - CPU 使用详情
 * GET /admin/system/memory-usage - 内存使用详情
 * GET /admin/system/network-stats - 网络统计
 * GET /admin/system/disk-stats - 磁盘使用情况
 */
export const monitorApi = {
  /**
   * 获取系统资源使用情况（CPU、内存、磁盘、网络）
   * GET /api/system/stats
   */
  getSystemStats: () => {
    return request.get('/api/system/stats');
  },

  /**
   * 获取设备统计信息
   * GET /api/system/device-stats
   */
  getDeviceStats: () => {
    return request.get('/api/system/device-stats');
  },

  /**
   * 获取 ZLMediaKit 流媒体网关统计
   * GET /api/system/zlm-stats
   */
  getZLMediaKitStats: () => {
    return request.get('/api/system/zlm-stats');
  },

  /**
   * 获取 CPU 使用详情
   * GET /system/cpu-usage
   */
  getCpuUsage: () => {
    return request.get('/system/cpu-usage');
  },

  /**
   * 获取内存使用详情
   * GET /system/memory-usage
   */
  getMemoryUsage: () => {
    return request.get('/system/memory-usage');
  },

  /**
   * 获取网络统计
   * GET /system/network-stats
   */
  getNetworkStats: () => {
    return request.get('/system/network-stats');
  },

  /**
   * 获取磁盘使用情况
   * GET /system/disk-stats
   */
  getDiskStats: () => {
    return request.get('/system/disk-stats');
  }
};

export default monitorApi;