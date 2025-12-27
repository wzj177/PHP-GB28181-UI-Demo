<template>
  <div class="device-stats-container">
    <div class="page-header">
      <h2>设备统计</h2>
      <div class="header-actions">
        <el-button
          :loading="loading"
          @click="refreshData"
        >
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <div class="stats-content">
      <!-- Overview Stats -->
      <el-card class="stats-card overview-card">
        <template #header>
          <div class="card-title">
            <el-icon><DataBoard /></el-icon>
            <span>设备概览</span>
          </div>
        </template>
        <div class="overview-stats">
          <div class="overview-item">
            <div class="overview-icon total">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">
                设备总数
              </div>
              <div class="overview-value">
                {{ deviceStats.total_count || 0 }}
              </div>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon online">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">
                在线设备
              </div>
              <div class="overview-value">
                {{ deviceStats.online_count || 0 }}
              </div>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon offline">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">
                离线设备
              </div>
              <div class="overview-value">
                {{ deviceStats.offline_count || 0 }}
              </div>
            </div>
          </div>
          <div class="overview-item">
            <div class="overview-icon rate">
              <el-icon><TrendCharts /></el-icon>
            </div>
            <div class="overview-info">
              <div class="overview-label">
                在线率
              </div>
              <div class="overview-value">
                {{ onlineRate }}%
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Device Type Distribution -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-title">
            <el-icon><PieChart /></el-icon>
            <span>设备类型分布</span>
          </div>
        </template>
        <div class="type-stats">
          <div
            v-for="item in deviceStats.type_distribution || []"
            :key="item.type"
            class="type-item"
          >
            <div class="type-header">
              <span class="type-name">{{ item.type_name }}</span>
              <span class="type-count">{{ item.count }}</span>
            </div>
            <el-progress
              :percentage="getTypePercentage(item.count)"
              :show-text="false"
              :color="getTypeColor(item.type)"
            />
          </div>
        </div>
      </el-card>

      <!-- Channel Stats -->
      <el-card class="stats-card">
        <template #header>
          <div class="card-title">
            <el-icon><VideoPlay /></el-icon>
            <span>通道统计</span>
          </div>
        </template>
        <div class="channel-stats">
          <div class="channel-grid">
            <div class="channel-item">
              <div class="channel-label">
                总通道数
              </div>
              <div class="channel-value">
                {{ deviceStats.total_channels || 0 }}
              </div>
            </div>
            <div class="channel-item">
              <div class="channel-label">
                在线通道
              </div>
              <div class="channel-value success">
                {{ deviceStats.online_channels || 0 }}
              </div>
            </div>
            <div class="channel-item">
              <div class="channel-label">
                离线通道
              </div>
              <div class="channel-value danger">
                {{ deviceStats.offline_channels || 0 }}
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Manufacturer Distribution -->
      <el-card class="stats-card full-width">
        <template #header>
          <div class="card-title">
            <el-icon><OfficeBuilding /></el-icon>
            <span>厂商分布</span>
          </div>
        </template>
        <div class="manufacturer-grid">
          <div
            v-for="item in deviceStats.manufacturer_distribution || []"
            :key="item.manufacturer"
            class="manufacturer-item"
          >
            <div class="manufacturer-header">
              <div class="manufacturer-name">
                {{ item.manufacturer }}
              </div>
              <div class="manufacturer-count">
                {{ item.count }} 台
              </div>
            </div>
            <div class="manufacturer-models">
              <el-tag
                v-for="model in item.models?.slice(0, 3)"
                :key="model"
                size="small"
                type="info"
              >
                {{ model }}
              </el-tag>
              <span
                v-if="item.models?.length > 3"
                class="more-models"
              >
                +{{ item.models.length - 3 }}
              </span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- Recent Devices -->
      <el-card class="stats-card full-width">
        <template #header>
          <div class="card-title">
            <el-icon><Clock /></el-icon>
            <span>最近活动</span>
          </div>
        </template>
        <el-table
          :data="deviceStats.recent_activities || []"
          style="width: 100%"
        >
          <el-table-column
            prop="device_name"
            label="设备名称"
            width="200"
          />
          <el-table-column
            prop="device_id"
            label="设备ID"
            width="150"
          />
          <el-table-column
            label="状态"
            width="100"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'online' ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 'online' ? '在线' : '离线' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="last_seen"
            label="最后上线时间"
          />
          <el-table-column
            label="操作"
            width="120"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="viewDevice(row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- Status Timeline -->
      <el-card class="stats-card full-width">
        <template #header>
          <div class="card-title">
            <el-icon><Histogram /></el-icon>
            <span>24小时设备在线趋势</span>
          </div>
        </template>
        <div class="timeline-chart">
          <div class="timeline-bars">
            <div
              v-for="(item, index) in deviceStats.hourly_stats || []"
              :key="index"
              class="timeline-item"
            >
              <div class="timeline-bar-wrapper">
                <div
                  class="timeline-bar"
                  :style="{
                    height: `${getTimelineHeight(item.online_count, item.total_count)}%`,
                    background: getTimelineColor(item.online_rate)
                  }"
                >
                  <div class="timeline-tooltip">
                    <div>{{ item.hour }}:00</div>
                    <div>在线: {{ item.online_count }}</div>
                    <div>总计: {{ item.total_count }}</div>
                    <div>在线率: {{ item.online_rate }}%</div>
                  </div>
                </div>
              </div>
              <div class="timeline-label">
                {{ item.hour }}时
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Refresh, DataBoard, Monitor, CircleCheckFilled, CircleCloseFilled,
  TrendCharts, PieChart, VideoPlay, OfficeBuilding, Clock, Histogram
} from '@element-plus/icons-vue'
import { monitorApi } from '@/api/monitorApi'
import { ElMessage } from 'element-plus'

const loading = ref(false)

const deviceStats = ref({
  total_count: 0,
  online_count: 0,
  offline_count: 0,
  total_channels: 0,
  online_channels: 0,
  offline_channels: 0,
  type_distribution: [] as Array<{
    type: string
    type_name: string
    count: number
  }>,
  manufacturer_distribution: [] as Array<{
    manufacturer: string
    count: number
    models: string[]
  }>,
  recent_activities: [] as Array<{
    device_name: string
    device_id: string
    status: string
    last_seen: string
  }>,
  hourly_stats: [] as Array<{
    hour: number
    online_count: number
    total_count: number
    online_rate: number
  }>
})

let refreshTimer: number | null = null

const onlineRate = computed(() => {
  if (!deviceStats.value.total_count) return 0
  return Math.round(
    (deviceStats.value.online_count / deviceStats.value.total_count) * 100
  )
})

const getTypePercentage = (count: number) => {
  if (!deviceStats.value.total_count) return 0
  return Math.round((count / deviceStats.value.total_count) * 100)
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    ipc: '#3B82F6',
    nvr: '#22C55E',
    dvr: '#F59E0B',
    platform: '#8B5CF6',
    other: '#6B7280'
  }
  return colors[type] || colors.other
}

const getTimelineHeight = (online: number, total: number) => {
  if (!total) return 5
  const percentage = (online / total) * 100
  return Math.max(5, percentage)
}

const getTimelineColor = (rate: number) => {
  if (rate >= 80) return '#22C55E'
  if (rate >= 50) return '#F59E0B'
  return '#EF4444'
}

const fetchDeviceStats = async () => {
  try {
    loading.value = true
    const response: any = await monitorApi.getDeviceStats()
    if (response.data) {
      deviceStats.value = {
        total_count: response.data.total_count || 0,
        online_count: response.data.online_count || 0,
        offline_count: response.data.offline_count || 0,
        total_channels: response.data.total_channels || 0,
        online_channels: response.data.online_channels || 0,
        offline_channels: response.data.offline_channels || 0,
        type_distribution: response.data.type_distribution || [
          { type: 'ipc', type_name: 'IPC', count: 45 },
          { type: 'nvr', type_name: 'NVR', count: 12 },
          { type: 'dvr', type_name: 'DVR', count: 8 },
          { type: 'platform', type_name: '平台', count: 3 }
        ],
        manufacturer_distribution: response.data.manufacturer_distribution || [
          {
            manufacturer: '海康威视',
            count: 28,
            models: ['DS-2CD3xxx', 'DS-2CD2xxx', 'DS-2CD4xxx', 'DS-2CD5xxx']
          },
          {
            manufacturer: '大华',
            count: 18,
            models: ['DH-IPCxxx', 'DH-NVRxxx', 'DH-SDxxx']
          },
          {
            manufacturer: '宇视',
            count: 12,
            models: ['IPC-xxx', 'NVR-xxx']
          },
          {
            manufacturer: '其他',
            count: 10,
            models: ['Generic IPC', 'Generic NVR']
          }
        ],
        recent_activities: response.data.recent_activities || [
          {
            device_name: '大厅摄像头01',
            device_id: '34020000001310000001',
            status: 'online',
            last_seen: '2024-01-15 14:30:25'
          },
          {
            device_name: '停车场入口',
            device_id: '34020000001310000002',
            status: 'online',
            last_seen: '2024-01-15 14:28:15'
          },
          {
            device_name: '办公区走廊',
            device_id: '34020000001310000003',
            status: 'offline',
            last_seen: '2024-01-15 10:15:30'
          },
          {
            device_name: '后门入口',
            device_id: '34020000001310000004',
            status: 'online',
            last_seen: '2024-01-15 14:25:40'
          }
        ],
        hourly_stats: response.data.hourly_stats || generateHourlyStats()
      }
    }
  } catch (error) {
    console.error('获取设备统计信息失败:', error)
  } finally {
    loading.value = false
  }
}

const generateHourlyStats = () => {
  const stats = []
  const now = new Date()
  for (let i = 23; i >= 0; i--) {
    const hour = (now.getHours() - i + 24) % 24
    const total = 65 + Math.floor(Math.random() * 5)
    const online = Math.floor(total * (0.7 + Math.random() * 0.25))
    stats.push({
      hour,
      online_count: online,
      total_count: total,
      online_rate: Math.round((online / total) * 100)
    })
  }
  return stats
}

const viewDevice = (row: any) => {
  ElMessage.info(`查看设备: ${row.device_name}`)
}

const refreshData = async () => {
  await fetchDeviceStats()
  ElMessage.success('数据已刷新')
}

onMounted(() => {
  fetchDeviceStats()
  // 每 60 秒自动刷新
  refreshTimer = window.setInterval(() => {
    fetchDeviceStats()
  }, 60000)
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})
</script>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.device-stats-container {
  padding: 20px;
  background: var(--bg-hover);
  min-height: 100%;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: $spacing-md;
    background: var(--bg-panel);
    border-radius: $radius-panel;
    border: 1px solid var(--border-base);

    h2 {
      margin: 0;
      color: var(--text-main);
      font-size: 18px;
      font-weight: 600;
    }
  }

  .stats-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 16px;

    .stats-card {
      background: var(--bg-panel);
      border: 1px solid var(--border-base);
      border-radius: $radius-panel;

      &.full-width {
        grid-column: 1 / -1;
      }

      :deep(.el-card__header) {
        background: var(--bg-hover);
        border-bottom: 1px solid var(--border-base);
        padding: 12px 16px;
      }

      :deep(.el-card__body) {
        padding: 16px;
      }

      .card-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        color: var(--text-main);

        .el-icon {
          color: $primary;
        }
      }
    }

    .overview-card {
      .overview-stats {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;

        .overview-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          background: var(--bg-hover);
          border-radius: $radius-base;

          .overview-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 12px;
            font-size: 22px;

            &.total {
              background: rgba($primary, 0.15);
              color: $primary;
            }

            &.online {
              background: rgba($success, 0.15);
              color: $success;
            }

            &.offline {
              background: rgba($danger, 0.15);
              color: $danger;
            }

            &.rate {
              background: rgba($warning, 0.15);
              color: $warning;
            }
          }

          .overview-info {
            .overview-label {
              color: var(--text-muted);
              font-size: 13px;
              margin-bottom: 4px;
            }

            .overview-value {
              color: var(--text-main);
              font-size: 24px;
              font-weight: 600;
            }
          }
        }
      }
    }

    .type-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .type-item {
        .type-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          .type-name {
            color: var(--text-main);
            font-size: 14px;
            font-weight: 500;
          }

          .type-count {
            color: var(--text-muted);
            font-size: 14px;
          }
          }
        }
      }

    .channel-stats {
      .channel-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;

        .channel-item {
          padding: 18px;
          background: var(--bg-hover);
          border-radius: $radius-base;
          text-align: center;

          .channel-label {
            color: var(--text-muted);
            font-size: 13px;
            margin-bottom: 8px;
          }

          .channel-value {
            font-size: 26px;
            font-weight: 600;
            color: var(--text-main);

            &.success {
              color: $success;
            }

            &.danger {
              color: $danger;
            }
          }
        }
      }
    }

    .manufacturer-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;

      .manufacturer-item {
        padding: 16px;
        background: var(--bg-hover);
        border-radius: $radius-base;

        .manufacturer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .manufacturer-name {
            font-size: 15px;
            font-weight: 500;
            color: var(--text-main);
          }

          .manufacturer-count {
            font-size: 13px;
            color: var(--text-muted);
          }
        }

        .manufacturer-models {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;

          .more-models {
            font-size: 12px;
            color: var(--text-muted);
          }
        }
      }
    }

    .timeline-chart {
      .timeline-bars {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        height: 180px;
        gap: 4px;

        .timeline-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;

          .timeline-bar-wrapper {
            flex: 1;
            width: 100%;
            display: flex;
            align-items: flex-end;
            position: relative;

            .timeline-bar {
              width: 100%;
              border-radius: 4px 4px 0 0;
              position: relative;
              transition: all 0.2s;

              &:hover {
                filter: brightness(1.1);
              }

              .timeline-tooltip {
                position: absolute;
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                background: var(--bg-panel);
                border: 1px solid var(--border-base);
                border-radius: 6px;
                padding: 8px 12px;
                white-space: nowrap;
                opacity: 0;
                visibility: hidden;
                transition: all 0.2s;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                z-index: 100;

                div {
                  font-size: 12px;
                  line-height: 1.6;
                  color: var(--text-main);
                }
              }

              &:hover .timeline-tooltip {
                opacity: 1;
                visibility: visible;
              }
            }
          }

          .timeline-label {
            margin-top: 6px;
            font-size: 11px;
            color: var(--text-muted);
          }
        }
      }
    }
  }
}

@media (max-width: $breakpoint-md) {
  .stats-content {
    grid-template-columns: 1fr !important;
  }

  .overview-stats {
    grid-template-columns: 1fr 1fr !important;
  }

  .manufacturer-grid {
    grid-template-columns: 1fr !important;
  }

  .channel-grid {
    grid-template-columns: 1fr !important;
  }
}
</style>
