import { apiAdapter } from './adapter'

// Device-related API
export const deviceApi = {
  // Get device tree
  getDeviceTree: () => apiAdapter.request({ url: '/devices/tree', method: 'GET' }),

  // Get device channels
  getDeviceChannels: (deviceId: string) => apiAdapter.request({ url: `/devices/${deviceId}/channels`, method: 'GET' }),

  // PTZ control
  ptzControl: (deviceId: string, params: any) =>
    apiAdapter.request({ url: `/devices/${deviceId}/ptz/control`, method: 'POST', data: params }),

  // Get preset positions
  getPresetPositions: (deviceId: string) => apiAdapter.request({ url: `/devices/${deviceId}/presets`, method: 'GET' }),

  // Set preset position
  setPresetPosition: (deviceId: string, presetId: string) =>
    apiAdapter.request({ url: `/devices/${deviceId}/presets/${presetId}/set`, method: 'POST' }),

  // Go to preset position
  goToPresetPosition: (deviceId: string, presetId: string) =>
    apiAdapter.request({ url: `/devices/${deviceId}/presets/${presetId}/go`, method: 'POST' }),

  // Get recordings
  getRecordings: (deviceId: string, channelId: string, startTime: string, endTime: string) =>
    apiAdapter.request({
      url: '/recordings',
      method: 'GET',
      params: {
        deviceId,
        channelId,
        startTime,
        endTime
      }
    }),

  // Download recording
  downloadRecording: (recordingId: string) =>
    apiAdapter.request({ url: `/recordings/${recordingId}/download`, method: 'GET', responseType: 'blob' }),

  // Get alarms
  getAlarms: (params?: any) => apiAdapter.request({ url: '/alarms', method: 'GET', params }),

  // Update alarm status
  updateAlarmStatus: (alarmId: string, status: string) =>
    apiAdapter.request({ url: `/alarms/${alarmId}/status`, method: 'PUT', data: { status } })
}

export default deviceApi