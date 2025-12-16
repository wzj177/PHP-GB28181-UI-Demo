import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as mockData from '@/mock/index'; // Import mock functions

// Create axios instance for real API
const realApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API adapter
export const apiAdapter = {
  // Make request using real API or mock based on environment
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    // In development with mock enabled, use mock data
    if (import.meta.env.DEV && import.meta.env.VITE_MOCK_ENABLED !== 'false') {
      const response = await handleMockRequest<T>(config);
      return response.data;
    } else {
      // Use real API
      const response = await realApi(config);
      return response.data;
    }
  }
};

// Handle mock requests
async function handleMockRequest<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
  const { url = '', method = 'GET', params, data } = config;

  // Create a mock request options object similar to what Mock.js receives
  const mockOptions = {
    url: url,
    type: method.toUpperCase(),
    body: data ? JSON.stringify(data) : undefined,
    query: params,
    // Add other properties as needed
  };

  // Match URL patterns and return corresponding mock data
  // This simulates what Mock.js does internally
  if (url.includes('/devices/tree') && method.toLowerCase() === 'get') {
    return {
      data: getDeviceTreeMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (url.includes('/devices') && /\/channels$/.test(url) && method.toLowerCase() === 'get') {
    return {
      data: getDeviceChannelsMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (/\/devices\/[\w]+\/ptz\/control/.test(url) && method.toLowerCase() === 'post') {
    return {
      data: ptzControlMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (/\/devices\/[\w]+\/presets/.test(url) && method.toLowerCase() === 'get') {
    return {
      data: getPresetPositionsMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (/\/devices\/[\w]+\/presets\/[\w]+\/set/.test(url) && method.toLowerCase() === 'post') {
    return {
      data: setPresetPositionMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (/\/devices\/[\w]+\/presets\/[\w]+\/go/.test(url) && method.toLowerCase() === 'post') {
    return {
      data: goToPresetPositionMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (url.includes('/recordings') && method.toLowerCase() === 'get') {
    return {
      data: getRecordingsMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (/\/recordings\/[\w]+\/download/.test(url) && method.toLowerCase() === 'get') {
    return {
      data: downloadRecordingMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (url.includes('/alarms') && method.toLowerCase() === 'get') {
    return {
      data: getAlarmsMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  } else if (/\/alarms\/[\w]+\/status/.test(url) && method.toLowerCase() === 'put') {
    return {
      data: updateAlarmStatusMock(mockOptions) as T,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: config,
    } as AxiosResponse<T>;
  }

  // Default response if no match
  return {
    data: { code: 200, message: 'success', data: {} } as T,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: config,
  } as AxiosResponse<T>;
}

// Mock functions - these would replicate the logic from mock/index.ts
export const getDeviceTreeMock = (options: any) => {
  // Simulate device tree data
  return {
    code: 200,
    message: 'success',
    data: [
      {
        id: 'group1',
        name: '监控区域A',
        children: [
          {
            id: 'device1',
            name: '大厅IPC',
            online: true,
            type: 'ipc',
            channels: [
              {
                id: 'ch1-1',
                name: '通道1',
                status: 'online',
                rtspUrl: 'rtsp://example.com/stream'
              }
            ]
          }
        ]
      }
    ]
  };
};

export const getAlarmsMock = (options: any) => {
  const page = parseInt(options.query?.page || '1');
  const pageSize = parseInt(options.query?.pageSize || '10');
  const total = 50;
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  
  const alarms = [];
  for (let i = startIndex; i < endIndex; i++) {
    alarms.push({
      id: `alarm-${i}`,
      deviceId: `device-${i}`,
      deviceName: `IPC-${1000 + i}`,
      channel: `通道 ${i % 16 + 1}`,
      type: ['motion', 'tamper', 'disconnect', 'storage_full'][i % 4],
      status: ['active', 'acknowledged', 'cleared'][i % 3],
      description: `模拟报警 ${i + 1}`,
      timestamp: new Date(Date.now() - (i * 3600000)).toISOString(),
      severity: ['low', 'medium', 'high', 'critical'][i % 4]
    });
  }

  return {
    code: 200,
    message: 'success',
    data: {
      list: alarms,
      pagination: {
        page,
        pageSize,
        total
      }
    }
  };
};

// Add other mock functions as needed...
// For brevity, I'll implement only the most critical ones
export const ptzControlMock = (options: any) => {
  return {
    code: 200,
    message: 'PTZ command sent successfully',
    data: null
  };
};

export const getPresetPositionsMock = (options: any) => {
  return {
    code: 200,
    message: 'success',
    data: [
      { id: 'preset1', name: '预置位 1', description: '大厅视角' },
      { id: 'preset2', name: '预置位 2', description: '门口视角' }
    ]
  };
};

export const getRecordingsMock = (options: any) => {
  // Parse query parameters
  const { deviceId, channelId, startTime, endTime } = options.query || {};

  // Generate mock recordings
  const recordings = [];
  const count = Math.floor(Math.random() * 10) + 5;

  for (let i = 0; i < count; i++) {
    const start = new Date();
    start.setDate(start.getDate() - Math.floor(Math.random() * 7)); // Random day in past week
    start.setHours(Math.floor(Math.random() * 24));
    start.setMinutes(Math.floor(Math.random() * 60));
    start.setSeconds(Math.floor(Math.random() * 60));

    const end = new Date(start.getTime());
    end.setMinutes(end.getMinutes() + Math.floor(Math.random() * 60) + 5); // Duration 5-65 minutes

    recordings.push({
      id: `rec-${Date.now()}-${i}`,
      deviceId: deviceId || 'device1',
      channelId: channelId || 'ch1-1',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      duration: Math.floor((end.getTime() - start.getTime()) / 1000 / 60), // in minutes
      fileSize: `${Math.floor(Math.random() * 500) + 50}MB`,
      type: ['motion', 'manual', 'schedule'][Math.floor(Math.random() * 3)]
    });
  }

  return {
    code: 200,
    message: 'success',
    data: recordings
  };
};

export const updateAlarmStatusMock = (options: any) => {
  const body = options.body ? JSON.parse(options.body) : { status: 'active' };
  return {
    code: 200,
    message: `Alarm status updated to ${body.status}`,
    data: null
  };
};

export const getDeviceChannelsMock = (options: any) => {
  const deviceId = options.url?.match(/\/devices\/([^\/]+)\/channels/)?.[1] || 'device1';
  return {
    code: 200,
    message: 'success',
    data: [
      {
        id: `ch-${deviceId}-1`,
        name: '通道1',
        status: ['online', 'offline', 'motion_detect'][Math.floor(Math.random() * 3)],
        rtspUrl: 'rtsp://example.com/stream'
      },
      {
        id: `ch-${deviceId}-2`,
        name: '通道2',
        status: ['online', 'offline', 'motion_detect'][Math.floor(Math.random() * 3)],
        rtspUrl: 'rtsp://example.com/stream2'
      }
    ]
  };
};

export const setPresetPositionMock = (options: any) => {
  const match = options.url?.match(/\/devices\/([^\/]+)\/presets\/([^\/]+)\/set/);
  const deviceId = match?.[1] || 'device1';
  const presetId = match?.[2] || 'preset1';

  return {
    code: 200,
    message: 'Preset saved successfully',
    data: { deviceId, presetId }
  };
};

export const goToPresetPositionMock = (options: any) => {
  const match = options.url?.match(/\/devices\/([^\/]+)\/presets\/([^\/]+)\/go/);
  const deviceId = match?.[1] || 'device1';
  const presetId = match?.[2] || 'preset1';

  return {
    code: 200,
    message: 'Moving to preset position...',
    data: { deviceId, presetId }
  };
};

export const downloadRecordingMock = (options: any) => {
  const recordingId = options.url?.match(/\/recordings\/([^\/]+)\/download/)?.[1] || 'rec1';

  return {
    code: 200,
    message: 'Download started',
    data: { recordingId }
  };
};

export const getMapDevicesMock = (options: any) => {
  return {
    code: 200,
    message: 'success',
    data: [
      {
        id: 'device1',
        name: '大厅IPC',
        lng: 116.397428,
        lat: 39.90923,
        online: true,
        status: ['normal', 'motion_detect', 'alarm'][Math.floor(Math.random() * 3)],
        address: '北京市东城区天安门广场'
      },
      {
        id: 'device2',
        name: '门口IPC',
        lng: 116.407428,
        lat: 39.91923,
        online: true,
        status: ['normal', 'motion_detect', 'alarm'][Math.floor(Math.random() * 3)],
        address: '北京市东城区王府井大街'
      }
    ]
  };
};