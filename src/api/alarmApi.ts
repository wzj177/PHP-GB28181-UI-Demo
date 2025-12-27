import request from '@/utils/request';

/**
 * 告警管理 API 服务
 * 对应后端路由：
 * GET /admin/gb28181/alarms - 获取告警列表
 * GET /admin/gb28181/alarms/{id} - 获取告警详情
 * PUT /admin/gb28181/alarms/{id} - 更新告警状态
 */
export const alarmApi = {
  /**
   * 获取告警列表
   * GET /gb28181/alarms
   */
  getAlarmList: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    device_id?: string;
    start_time?: string;
    end_time?: string;
  }) => {
    return request.get('/gb28181/alarms', { params });
  },

  /**
   * 获取告警详情
   * GET /gb28181/alarms/{id}
   */
  getAlarmDetail: (id: string) => {
    return request.get(`/gb28181/alarms/${id}`);
  },

  /**
   * 更新告警状态
   * PUT /gb28181/alarms/{id}
   */
  updateAlarm: (id: string, data: {
    status?: string;
    remark?: string;
  }) => {
    return request.put(`/gb28181/alarms/${id}`, data);
  }
};

export default alarmApi;
