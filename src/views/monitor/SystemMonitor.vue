<template>
  <div class="system-monitor-container">
    <div class="page-header">
      <h2>系统监控</h2>
      <div
        class="refresh-btn"
        @click="refreshData"
      >
        <el-icon :size="16">
          <Refresh />
        </el-icon>
        <span>刷新</span>
      </div>
    </div>

    <div class="monitor-content">
      <!-- System Stats Overview -->
      <el-card class="monitor-card">
        <template #header>
          <div class="card-header">
            <span>系统概览</span>
          </div>
        </template>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">
              CPU使用率
            </div>
            <div class="stat-value">
              {{ systemStats.cpu_usage }}%
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              内存使用率
            </div>
            <div class="stat-value">
              {{ systemStats.memory_usage }}%
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              磁盘使用率
            </div>
            <div class="stat-value">
              {{ systemStats.disk_usage }}%
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              网络IO
            </div>
            <div class="stat-value">
              {{ systemStats.network_io }}
            </div>
          </div>
        </div>
      </el-card>

      <!-- System Resources -->
      <el-card class="monitor-card">
        <template #header>
          <div class="card-header">
            <span>系统资源</span>
          </div>
        </template>
        <div class="resource-charts">
          <div class="chart-item">
            <h4>CPU使用率</h4>
            <el-progress 
              type="dashboard" 
              :percentage="systemStats.cpu_usage" 
              :color="cpuColor"
              :width="150"
            />
          </div>
          <div class="chart-item">
            <h4>内存使用率</h4>
            <el-progress 
              type="dashboard" 
              :percentage="systemStats.memory_usage" 
              :color="memoryColor"
              :width="150"
            />
          </div>
          <div class="chart-item">
            <h4>磁盘使用率</h4>
            <el-progress 
              type="dashboard" 
              :percentage="systemStats.disk_usage" 
              :color="diskColor"
              :width="150"
            />
          </div>
        </div>
      </el-card>

      <!-- ZLMediaKit Status -->
      <el-card class="monitor-card">
        <template #header>
          <div class="card-header">
            <span>ZLMediaKit状态</span>
          </div>
        </template>
        <div class="zlm-status">
          <div class="status-item">
            <span class="status-label">运行状态:</span>
            <el-tag :type="zlmStats.running ? 'success' : 'danger'">
              {{ zlmStats.running ? '运行中' : '已停止' }}
            </el-tag>
          </div>
          <div class="status-item">
            <span class="status-label">版本:</span>
            <span>{{ zlmStats.version || '未知' }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">流数量:</span>
            <span>{{ zlmStats.stream_count || 0 }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">会话数量:</span>
            <span>{{ zlmStats.session_count || 0 }}</span>
          </div>
        </div>
      </el-card>

      <!-- Device Stats -->
      <el-card class="monitor-card">
        <template #header>
          <div class="card-header">
            <span>设备统计</span>
          </div>
        </template>
        <div class="device-stats">
          <div class="stat-item">
            <div class="stat-label">
              在线设备
            </div>
            <div class="stat-value">
              {{ deviceStats.online_count }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              离线设备
            </div>
            <div class="stat-value">
              {{ deviceStats.offline_count }}
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-label">
              总设备数
            </div>
            <div class="stat-value">
              {{ deviceStats.total_count }}
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { monitorApi } from '@/api/monitorApi'
import { ElMessage } from 'element-plus'

// System stats
const systemStats = ref({
  cpu_usage: 0,
  memory_usage: 0,
  disk_usage: 0,
  network_io: '0 B/s'
})

// ZLMediaKit stats
const zlmStats = ref({
  running: false,
  version: '',
  stream_count: 0,
  session_count: 0
})

// Device stats
const deviceStats = ref({
  online_count: 0,
  offline_count: 0,
  total_count: 0
})

// Color configurations for progress bars
const cpuColor = ref([
  { color: '#5cb87a', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#f56c6c', percentage: 80 }
])

const memoryColor = ref([
  { color: '#5cb87a', percentage: 30 },
  { color: '#e6a23c', percentage: 60 },
  { color: '#f56c6c', percentage: 80 }
])

const diskColor = ref([
  { color: '#5cb87a', percentage: 40 },
  { color: '#e6a23c', percentage: 70 },
  { color: '#f56c6c', percentage: 90 }
])

// Fetch system stats
const fetchSystemStats = async () => {
  try {
    const response = await monitorApi.getSystemStats()
    if (response.data) {
      systemStats.value = {
        cpu_usage: response.data.cpu_usage || 0,
        memory_usage: response.data.memory_usage || 0,
        disk_usage: response.data.disk_usage || 0,
        network_io: response.data.network_io || '0 B/s'
      }
    }
  } catch (error) {
    console.error('获取系统统计信息失败:', error)
    ElMessage.error('获取系统统计信息失败')
  }
}

// Fetch ZLMediaKit stats
const fetchZLMediaKitStats = async () => {
  try {
    const response = await monitorApi.getZLMediaKitStats()
    if (response.data) {
      zlmStats.value = {
        running: response.data.running || false,
        version: response.data.version || '',
        stream_count: response.data.stream_count || 0,
        session_count: response.data.session_count || 0
      }
    }
  } catch (error) {
    console.error('获取ZLMediaKit状态失败:', error)
    ElMessage.error('获取ZLMediaKit状态失败')
  }
}

// Fetch device stats
const fetchDeviceStats = async () => {
  try {
    const response = await monitorApi.getDeviceStats()
    if (response.data) {
      deviceStats.value = {
        online_count: response.data.online_count || 0,
        offline_count: response.data.offline_count || 0,
        total_count: response.data.total_count || 0
      }
    }
  } catch (error) {
    console.error('获取设备统计信息失败:', error)
    ElMessage.error('获取设备统计信息失败')
  }
}

// Refresh all data
const refreshData = async () => {
  await Promise.all([
    fetchSystemStats(),
    fetchZLMediaKitStats(),
    fetchDeviceStats()
  ])
  ElMessage.success('数据已刷新')
}

// Initialize data on component mount
onMounted(() => {
  refreshData()
})
</script>

<style scoped lang="scss">
.system-monitor-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
      font-weight: 500;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      background-color: #fff;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      color: #606266;

      &:hover {
        background-color: #f5f7fa;
        color: #409eff;
      }
    }
  }

  .monitor-content {
    .monitor-card {
      margin-bottom: 20px;

      .card-header {
        font-weight: 500;
        color: #303133;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;

        .stat-item {
          text-align: center;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 500;
            color: #303133;
          }
        }
      }

      .resource-charts {
        display: flex;
        justify-content: space-around;
        flex-wrap: wrap;
        gap: 20px;

        .chart-item {
          text-align: center;

          h4 {
            margin: 0 0 10px 0;
            color: #606266;
            font-size: 14px;
          }
        }
      }

      .zlm-status {
        .status-item {
          display: flex;
          align-items: center;
          margin-bottom: 10px;

          .status-label {
            font-weight: 500;
            min-width: 100px;
            color: #909399;
          }

          .el-tag {
            margin-left: 10px;
          }
        }
      }

      .device-stats {
        display: flex;
        justify-content: space-around;

        .stat-item {
          text-align: center;

          .stat-label {
            font-size: 14px;
            color: #909399;
            margin-bottom: 8px;
          }

          .stat-value {
            font-size: 24px;
            font-weight: 500;
            color: #303133;
          }
        }
      }
    }
  }
}
</style>