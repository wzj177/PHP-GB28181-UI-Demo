<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElCard, ElButton, ElTag, ElDialog, ElMessage } from 'element-plus'
import { Location, VideoCamera, MapLocation } from '@element-plus/icons-vue'
import { mapApi } from '@/api/mapApi'
import { gb28181Api } from '@/api/gb28181Api'

declare global {
  interface Window {
    AMap: any
  }
}

interface Device {
  id: string
  name: string
  lng: number
  lat: number
  online: boolean
  status: 'normal' | 'motion_detect' | 'alarm'
  address: string
}

// State
const mapInstance = ref<any>(null)
const devices = ref<Device[]>([])
const markers = ref<any[]>([])
const loading = ref(false)
const selectedDevice = ref<Device | null>(null)
const showPlayerDialog = ref(false)

// Initialize map with AMap
const initMap = async () => {
  loading.value = true
  try {
    // Wait for AMap to be available
    await new Promise<void>((resolve) => {
      if (window.AMap) {
        resolve()
      } else {
        // Wait for AMap to load if not available yet
        const checkAMap = setInterval(() => {
          if (window.AMap) {
            clearInterval(checkAMap)
            resolve()
          }
        }, 100)
      }
    })

    // Create map instance
    mapInstance.value = new AMap.Map('map-container', {
      zoom: 11,
      center: [116.397428, 39.90923],
      viewMode: '3D'
    })

    // Load devices and add markers
    await loadDevices()
  } catch (error) {
    console.error('Failed to initialize map:', error)
  } finally {
    loading.value = false
  }
}

// Load devices
const loadDevices = async () => {
  try {
    // Get device locations from the API
    const response = await mapApi.getDeviceLocations();

    let deviceData = [];
    if (response.code === 0 && response.data) {
      deviceData = response.data;
    } else {
      // Fallback: get devices from GB28181 API and use default coordinates
      const devicesResponse = await gb28181Api.getDeviceList();
      if (devicesResponse.code === 0) {
        const devicesList = devicesResponse.data.list || devicesResponse.data || [];

        // Assign default coordinates to devices for map display
        deviceData = devicesList.map((device: any, index: number) => ({
          id: device.device_id,
          name: device.device_name || device.name || '未知设备',
          lng: 116.397428 + (index * 0.01), // Distribute on map
          lat: 39.90923 + (index * 0.01),
          online: device.status === 'online',
          status: device.status === 'online' ? 'normal' : 'offline',
          address: device.address || '未知地址'
        }));
      }
    }

    devices.value = deviceData;

    // Remove existing markers
    if (mapInstance.value) {
      markers.value.forEach(marker => {
        mapInstance.value.remove(marker)
      })
    }
    markers.value = []

    // Add markers to the map
    devices.value.forEach(device => {
      // Set marker icon based on status
      const statusColors: Record<string, string> = {
        normal: '#67C23A',      // green
        motion_detect: '#E6A23C', // orange
        alarm: '#F56C6C',        // red
        offline: '#909399'       // gray
      }

      const color = device.online ? statusColors[device.status] || '#909399' : statusColors.offline
      const borderColor = device.online ? (device.status === 'alarm' ? '#F56C6C' : color) : '#909399'

      // Create SVG icon based on status
      const deviceFillColor = device.online ? (device.status === 'alarm' ? '#ffcccc' : color) : '#909399'
      const deviceSvgIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36"><path d="M12 0C5.373 0 0 5.373 0 12 0 22.5 12 36 12 36S24 22.5 24 12C24 5.373 18.627 0 12 0Z" fill="${deviceFillColor}" stroke="${borderColor}" stroke-width="2"/></svg>`

      const marker = new AMap.Marker({
        position: [device.lng, device.lat],
        title: device.name,
        icon: new AMap.Icon({
          size: new AMap.Size(24, 36),
          image: deviceSvgIcon,
        }),
        label: {
          content: device.name,
          offset: new AMap.Pixel(0, 0)
        }
      })

      // Add click event to marker
      marker.on('click', () => {
        handleDeviceClick(device)
      })

      if (mapInstance.value) {
        mapInstance.value.add(marker)
        markers.value.push(marker)
      }
    })

    // Set map bounds to fit all markers
    if (devices.value.length > 0 && mapInstance.value) {
      const bounds = new AMap.Bounds()
      devices.value.forEach(device => {
        bounds.extend([device.lng, device.lat])
      })
      mapInstance.value.setBounds(bounds)
    }
  } catch (error: any) {
    console.error('Failed to load devices:', error)
    // If the API call fails, we could show an error message or use mock data
    ElMessage.error(error.message || '获取设备位置失败');
  }
}

// Handle device click
const handleDeviceClick = (device: Device) => {
  selectedDevice.value = device
  showPlayerDialog.value = true
}

// Get device status tag
const getStatusTag = (status: string, online: boolean) => {
  if (!online) {
    return { type: 'info', label: '离线' }
  }

  switch (status) {
    case 'normal':
      return { type: 'success', label: '正常' }
    case 'motion_detect':
      return { type: 'warning', label: '移动侦测' }
    case 'alarm':
      return { type: 'danger', label: '报警' }
    default:
      return { type: 'info', label: '未知' }
  }
}

// Initialize on component mounted
onMounted(() => {
  initMap()
})

// Clean up map on component unmount
onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})
</script>

<template>
  <div class="map-page">

    <ElCard class="map-card">
      <template #header>
        <div class="card-header">
          <span>设备分布图</span>
          <div class="map-controls">
            <ElButton
              type="primary"
              size="small"
            >
              <Location class="control-icon" />
              定位
            </ElButton>
            <ElButton size="small">
              <VideoCamera class="control-icon" />
              批量播放
            </ElButton>
          </div>
        </div>
      </template>
      
      <!-- Map container -->
      <div
        id="map-container"
        v-loading="loading"
        class="map-container"
      />
    </ElCard>

    <!-- Player dialog -->
    <ElDialog
      v-model="showPlayerDialog"
      :title="selectedDevice?.name || '视频播放'"
      width="800px"
      :before-close="() => showPlayerDialog = false"
    >
      <div
        v-if="selectedDevice"
        class="player-container"
      >
        <div class="device-info">
          <h4>{{ selectedDevice.name }}</h4>
          <p><strong>地址:</strong> {{ selectedDevice.address }}</p>
          <p>
            <strong>状态:</strong> 
            <ElTag :type="getStatusTag(selectedDevice.status, selectedDevice.online).type">
              {{ getStatusTag(selectedDevice.status, selectedDevice.online).label }}
            </ElTag>
          </p>
        </div>
        
        <div class="video-player-area">
          <video 
            class="video-player" 
            controls
            :src="`https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4`"
            preload="metadata"
          />
        </div>
        
        <div class="player-controls">
          <ElButton type="primary">
            云台控制
          </ElButton>
          <ElButton>录像回放</ElButton>
          <ElButton>报警设置</ElButton>
        </div>
      </div>
    </ElDialog>
  </div>
</template>

<style scoped>
.map-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-icon {
  color: #409eff;
}

.map-card {
  flex: 1;
  margin: 1rem;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e6e6e6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem !important;
  font-weight: 600;
  color: #333;
}

.map-controls {
  display: flex;
  gap: 0.5rem;
}

.control-icon {
  margin-right: 0.25rem;
}

:deep(.el-card__body) {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

.map-container {
  flex: 1;
  position: relative;
  width: 100%;
  height: 100%;
}

#map-container {
  width: 100%;
  height: 100%;
}

.player-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.device-info {
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.video-player-area {
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  position: relative;
  background-color: #000;
  border-radius: 8px;
  overflow: hidden;
}

.video-player {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.player-controls {
  display: flex;
  gap: 1rem;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}
</style>