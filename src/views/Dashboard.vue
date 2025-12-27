<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h2>视频监控平台 - 系统概览</h2>
      <div class="date-display">
        {{ currentTime }}
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon online">
          <i class="icon-device">📺</i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalDevices }}</h3>
          <p>设备总数</p>
          <div class="trend up">
            +2.5%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon active">
          <i class="icon-online">🟢</i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.onlineDevices }}</h3>
          <p>在线设备</p>
          <div class="trend up">
            +1.2%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon record">
          <i class="icon-record">🔴</i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.recordingsToday }}</h3>
          <p>今日录像(GB)</p>
          <div class="trend down">
            -0.8%
          </div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon alarm">
          <i class="icon-alarm">⚠️</i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeAlarms }}</h3>
          <p>活跃告警</p>
          <div class="trend up">
            +3.1%
          </div>
        </div>
      </div>
    </div>

    <!-- 设备状态图表和实时视频 -->
    <div class="dashboard-content">
      <div class="left-section">
        <!-- 设备在线趋势图 -->
        <div class="chart-container">
          <h3>设备在线趋势</h3>
          <div class="chart-placeholder">
            <div class="chart-title">
              最近7天设备在线趋势
            </div>
            <div class="chart-graph">
              <div
                v-for="(value, index) in chartData.onlineTrend"
                :key="index"
                class="chart-bar"
                :style="{ height: value + '%' }"
              >
                <span class="bar-value">{{ value }}%</span>
              </div>
            </div>
            <div class="chart-legend">
              <div class="legend-item">
                <div class="legend-color online-color" />
                <span>在线设备</span>
              </div>
              <div class="legend-item">
                <div class="legend-color offline-color" />
                <span>离线设备</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 告警统计 -->
        <div class="chart-container">
          <h3>告警类型分布</h3>
          <div class="chart-placeholder">
            <div class="alarm-stats">
              <div
                v-for="(alarm, index) in alarmStats"
                :key="index"
                class="alarm-item"
              >
                <div class="alarm-type">
                  {{ alarm.type }}
                </div>
                <div class="alarm-progress">
                  <div
                    class="alarm-bar"
                    :style="{ width: alarm.percentage + '%' }"
                  />
                </div>
                <div class="alarm-count">
                  {{ alarm.count }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 实时视频预览 -->
      <div class="right-section">
        <div class="video-section">
          <h3>实时视频预览</h3>
          <div class="video-grid">
            <div
              v-for="camera in recentCameras"
              :key="camera.id"
              class="video-tile"
            >
              <div class="video-placeholder">
                <div class="camera-name">
                  {{ camera.name }}
                </div>
                <div
                  class="status-indicator"
                  :class="camera.status"
                >
                  {{ camera.statusText }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 最新告警 -->
        <div class="alarms-section">
          <h3>最新告警</h3>
          <div class="alarms-list">
            <div
              v-for="alarm in recentAlarms"
              :key="alarm.id"
              class="alarm-item"
            >
              <div
                class="alarm-icon"
                :class="alarm.type"
              />
              <div class="alarm-content">
                <div class="alarm-device">
                  {{ alarm.deviceName }}
                </div>
                <div class="alarm-desc">
                  {{ alarm.description }}
                </div>
                <div class="alarm-time">
                  {{ alarm.time }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { monitorApi } from '@/api/monitorApi'

// 当前时间
const currentTime = ref('')
const timeInterval = ref()

// 统计数据
const stats = ref({
  totalDevices: 0,
  onlineDevices: 0,
  recordingsToday: 0,
  activeAlarms: 0
})

// 图表数据
const chartData = ref({
  onlineTrend: [] as number[]
})

// 告警统计
const alarmStats = ref([
  { type: '移动侦测', count: 0, percentage: 0 },
  { type: '视频遮挡', count: 0, percentage: 0 },
  { type: '设备离线', count: 0, percentage: 0 },
  { type: '视频丢失', count: 0, percentage: 0 }
])

// 摄像头数据
const recentCameras = ref([
  { id: 1, name: '大厅摄像头', status: 'online', statusText: '在线' },
  { id: 2, name: '停车场入口', status: 'online', statusText: '在线' },
  { id: 3, name: '办公区走廊', status: 'offline', statusText: '离线' },
  { id: 4, name: '后门入口', status: 'online', statusText: '在线' }
])

// 最新告警
const recentAlarms = ref([
  { id: 1, deviceName: '大厅摄像头', description: '移动侦测告警', type: 'motion', time: '2分钟前' },
  { id: 2, deviceName: '停车场入口', description: '视频遮挡告警', type: 'obstruction', time: '5分钟前' },
  { id: 3, deviceName: '办公区走廊', description: '设备离线告警', type: 'offline', time: '10分钟前' },
  { id: 4, deviceName: '后门入口', description: '视频丢失告警', type: 'loss', time: '15分钟前' }
])

// Update data from backend API
const updateData = async () => {
  try {
    // Update statistics from backend API
    const deviceStats = await monitorApi.getDeviceStats();
    if (deviceStats.code === 0) {
      stats.value = {
        totalDevices: deviceStats.data.totalDevices || 0,
        onlineDevices: deviceStats.data.onlineDevices || 0,
        recordingsToday: deviceStats.data.recordingToday || 0,
        activeAlarms: deviceStats.data.activeAlarms || 0
      }
    } else {
      // Fallback to mock data if API fails
      stats.value = {
        totalDevices: Math.floor(Math.random() * 100) + 400,
        onlineDevices: Math.floor(Math.random() * 80) + 350,
        recordingsToday: Math.floor(Math.random() * 500) + 1000,
        activeAlarms: Math.floor(Math.random() * 10) + 5
      }
    }

    // Update chart data - for now using mock data, but could be enhanced with historical data from API
    chartData.value.onlineTrend = Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 60)

    // Update alarm statistics from backend if available
    // For now using mock data as there's no specific alarm stats API
    alarmStats.value = [
      { type: '移动侦测', count: Math.floor(Math.random() * 50) + 10, percentage: 45 },
      { type: '视频遮挡', count: Math.floor(Math.random() * 30) + 5, percentage: 25 },
      { type: '设备离线', count: Math.floor(Math.random() * 15) + 3, percentage: 15 },
      { type: '视频丢失', count: Math.floor(Math.random() * 10) + 2, percentage: 15 }
    ]
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
    // Fallback to mock data if API fails
    stats.value = {
      totalDevices: Math.floor(Math.random() * 100) + 400,
      onlineDevices: Math.floor(Math.random() * 80) + 350,
      recordingsToday: Math.floor(Math.random() * 500) + 1000,
      activeAlarms: Math.floor(Math.random() * 10) + 5
    }

    // Update chart data
    chartData.value.onlineTrend = Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 60)

    alarmStats.value = [
      { type: '移动侦测', count: Math.floor(Math.random() * 50) + 10, percentage: 45 },
      { type: '视频遮挡', count: Math.floor(Math.random() * 30) + 5, percentage: 25 },
      { type: '设备离线', count: Math.floor(Math.random() * 15) + 3, percentage: 15 },
      { type: '视频丢失', count: Math.floor(Math.random() * 10) + 2, percentage: 15 }
    ]
  }
}

// 更新当前时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN')
}

onMounted(() => {
  // 初始化数据
  updateData()
  updateTime()

  // 每分钟更新一次时间
  timeInterval.value = setInterval(updateTime, 60000)

  // 每10秒更新一次统计数据
  const dataInterval = setInterval(updateData, 10000)

  // 保存dataInterval到组件实例，以便在卸载时清理
  ;(window as any).dataInterval = dataInterval
})

onUnmounted(() => {
  if (timeInterval.value) {
    clearInterval(timeInterval.value)
  }

  if ((window as any).dataInterval) {
    clearInterval((window as any).dataInterval)
  }
})
</script>

<style lang="scss" scoped>
@use "sass:color";
@use '@/styles/variables.scss' as *;

.dashboard-container {
  padding: 20px;
  background-color: $bg-main;
  min-height: 100vh;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: $text-main;
    font-size: 1.5rem;
  }

  .date-display {
    color: $text-muted;
    font-size: 0.9rem;
  }
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  }

  .stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-size: 24px;

    &.online {
      background-color: rgba($success, 0.1);
      color: $success;
    }

    &.active {
      background-color: rgba($primary, 0.1);
      color: $primary;
    }

    &.record {
      background-color: rgba($warning, 0.1);
      color: $warning;
    }

    &.alarm {
      background-color: rgba($danger, 0.1);
      color: $danger;
    }
  }

  .stat-content {
    h3 {
      margin: 0;
      font-size: 1.8rem;
      color: $text-main;
    }

    p {
      margin: 5px 0 0;
      color: $text-muted;
      font-size: 0.9rem;
    }
  }

  .trend {
    margin-top: 8px;
    font-size: 0.8rem;
    font-weight: 500;

    &.up {
      color: $success;
    }

    &.down {
      color: $danger;
    }
  }
}

.dashboard-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.left-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.right-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chart-container {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  h3 {
    margin-top: 0;
    margin-bottom: 15px;
    color: $text-main;
  }
}

.chart-placeholder {
  background: $bg-panel;
  border-radius: 8px;
  padding: 15px;
  color: $text-muted;
}

.chart-title {
  font-size: 0.9rem;
  margin-bottom: 15px;
  text-align: center;
  color: $text-main;
}

.chart-graph {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 150px;
  padding: 10px 0;
  gap: 8px;
}

.chart-bar {
  flex: 1;
  background: linear-gradient(to top, $primary, color.mix($primary, #fff, 20%));
  border-radius: 4px 4px 0 0;
  position: relative;
  min-width: 20px;

  .bar-value {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    color: $text-muted;
  }
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;

    &.online-color {
      background-color: $primary;
    }

    &.offline-color {
      background-color: $text-muted;
    }
  }
}

.alarm-stats {
  .alarm-item {
    display: flex;
    align-items: center;
    padding: 8px 0;

    .alarm-type {
      width: 80px;
      font-size: 0.9rem;
      color: $text-main;
    }

    .alarm-progress {
      flex: 1;
      height: 10px;
      background: $border-base;
      border-radius: 5px;
      overflow: hidden;
      margin: 0 10px;

      .alarm-bar {
        height: 100%;
        background: linear-gradient(to right, $warning, $danger);
        border-radius: 5px;
        transition: width 0.3s ease;
      }
    }

    .alarm-count {
      width: 40px;
      text-align: right;
      font-size: 0.9rem;
      color: $text-main;
    }
  }
}

.video-section h3 {
  margin-top: 0;
  color: $text-main;
}

.video-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.video-tile {
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  background: $bg-panel;
  border: 1px solid $border-base;
  position: relative;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  padding: 10px;
  text-align: center;

  .camera-name {
    font-size: 0.9rem;
    font-weight: 500;
    color: $text-main;
    margin-bottom: 5px;
  }
}

.status-indicator {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  position: absolute;
  top: 8px;
  right: 8px;

  &.online {
    background-color: rgba($success, 0.2);
    color: $success;
  }

  &.offline {
    background-color: rgba($text-muted, 0.2);
    color: $text-muted;
  }
}

.alarms-section h3 {
  margin-top: 0;
  color: $text-main;
}

.alarms-list {
  .alarm-item {
    display: flex;
    padding: 10px 0;
    border-bottom: 1px solid $border-base;

    &:last-child {
      border-bottom: none;
    }

    .alarm-icon {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 10px;
      font-size: 0.8rem;
      flex-shrink: 0;

      &.motion {
        background-color: rgba($warning, 0.2);
        color: $warning;
      }

      &.obstruction {
        background-color: rgba($danger, 0.2);
        color: $danger;
      }

      &.offline {
        background-color: rgba($text-muted, 0.2);
        color: $text-muted;
      }

      &.loss {
        background-color: rgba($info, 0.2);
        color: $info;
      }
    }

    .alarm-content {
      flex: 1;

      .alarm-device {
        font-weight: 500;
        color: $text-main;
        margin-bottom: 3px;
      }

      .alarm-desc {
        font-size: 0.85rem;
        color: $text-muted;
        margin-bottom: 3px;
      }

      .alarm-time {
        font-size: 0.75rem;
        color: $text-muted;
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }

  .video-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .stat-card {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;

    .stat-icon {
      margin-bottom: 10px;
      margin-right: 0;
    }
  }
}
</style>