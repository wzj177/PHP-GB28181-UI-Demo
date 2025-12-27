import request from '@/utils/request';

/**
 * 电子地图 API 服务
 * 对应后端路由：
 * GET /admin/gb28181/map/devices - 获取地图设备列表
 * PUT /admin/gb28181/map/devices/{id}/position - 更新设备位置
 */
export const mapApi = {
  /**
   * 获取地图设备列表（包含位置信息）
   * GET /gb28181/map/devices
   */
  getDeviceLocations: (params?: {
    status?: string;
  }) => {
    return request.get('/gb28181/map/devices', { params });
  },

  /**
   * 更新设备位置
   * PUT /gb28181/map/devices/{id}/position
   */
  updateDevicePosition: (id: string, data: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    return request.put(`/gb28181/map/devices/${id}/position`, data);
  }
};

export default mapApi;
