import request from '@/utils/request';

/**
 * GB28181 API 服务
 * 对应后端路由：
 * 设备管理：/admin/gb28181/devices
 * 通道管理：/admin/gb28181/channels
 * 云台控制：/admin/gb28181/ptz
 * 流媒体：/admin/gb28181/streams
 * 录像：/admin/gb28181/recordings
 */
export const gb28181Api = {
  // ================= 设备管理 =================

  /**
   * 获取 GB28181 设备列表
   * GET /admin/gb28181/devices
   */
  getDeviceList: (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return request.get('/admin/gb28181/devices', { params });
  },

  /**
   * 获取设备详情
   * GET /admin/gb28181/devices/{deviceId}
   */
  getDeviceDetail: (deviceId: string) => {
    return request.get(`/admin/gb28181/devices/${deviceId}`);
  },

  /**
   * 删除设备
   * DELETE /admin/gb28181/devices/{deviceId}
   */
  deleteDevice: (deviceId: string) => {
    return request.delete(`/admin/gb28181/devices/${deviceId}`);
  },

  /**
   * 查询设备目录（发送命令到信令网关获取通道列表）
   * POST /admin/gb28181/devices/{deviceId}/catalog
   */
  queryDeviceCatalog: (deviceId: string) => {
    return request.post(`/admin/gb28181/devices/${deviceId}/catalog`);
  },

  // ================= 通道管理 =================

  /**
   * 获取设备通道列表
   * GET /admin/gb28181/channels/{deviceId}
   */
  getChannelList: (deviceId: string, params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    return request.get(`/admin/gb28181/channels/${deviceId}`, { params });
  },

  /**
   * 获取通道详情
   * GET /admin/gb28181/channels/{deviceId}/channel/{channelId}
   */
  getChannelDetail: (deviceId: string, channelId: string) => {
    return request.get(`/admin/gb28181/channels/${deviceId}/channel/${channelId}`);
  },

  // ================= 云台控制 (PTZ) =================

  /**
   * PTZ 云台控制
   * POST /admin/gb28181/ptz
   */
  ptzControl: (params: {
    device_id: string;
    channel_id: string;
    command: string; // up, down, left, right, zoom_in, zoom_out, focus_near, focus_far, iris_open, iris_close, etc.
    speed?: number; // 1-255, default 5
    preset_id?: number; // for preset operations
  }) => {
    return request.post('/admin/gb28181/ptz', params);
  },

  // ================= 流媒体控制 =================

  /**
   * 开始实时视频（拉流）
   * POST /admin/gb28181/streams/start-live
   */
  startLive: (params: {
    device_id: string;
    channel_id: string;
    stream_type?: 'main' | 'sub'; // 主码流/子码流
  }) => {
    return request.post('/admin/gb28181/streams/start-live', params);
  },

  /**
   * 停止实时视频
   * POST /admin/gb28181/streams/stop-live
   */
  stopLive: (params: {
    device_id: string;
    channel_id: string;
  }) => {
    return request.post('/admin/gb28181/streams/stop-live', params);
  },

  /**
   * 获取播放地址
   * GET /admin/gb28181/streams/play-urls
   */
  getPlayUrls: (params: {
    device_id: string;
    channel_id: string;
    stream_type?: 'main' | 'sub';
  }) => {
    return request.get('/admin/gb28181/streams/play-urls', { params });
  },

  /**
   * 开始录像回放
   * POST /admin/gb28181/streams/playback
   */
  startPlayback: (params: {
    device_id: string;
    channel_id: string;
    start_time: string; // ISO format: 2024-01-01T00:00:00
    end_time: string;
  }) => {
    return request.post('/admin/gb28181/streams/playback', params);
  },

  // ================= 录像管理 =================

  /**
   * 获取录像列表
   * GET /admin/gb28181/recordings
   */
  getRecordings: (params: {
    device_id: string;
    channel_id?: string;
    start_time: string; // ISO format
    end_time: string;
  }) => {
    return request.get('/admin/gb28181/recordings', { params });
  },

  /**
   * 开始录像
   * POST /admin/gb28181/recordings/start-record
   */
  startRecord: (params: {
    device_id: string;
    channel_id: string;
  }) => {
    return request.post('/admin/gb28181/recordings/start-record', params);
  },

  /**
   * 停止录像
   * POST /admin/gb28181/recordings/stop-record
   */
  stopRecord: (params: {
    device_id: string;
    channel_id: string;
  }) => {
    return request.post('/admin/gb28181/recordings/stop-record', params);
  },

  /**
   * 抓拍快照
   * POST /admin/gb28181/recordings/snapshot
   */
  snapshot: (params: {
    device_id: string;
    channel_id: string;
  }) => {
    return request.post('/admin/gb28181/recordings/snapshot', params);
  }
};

export default gb28181Api;
