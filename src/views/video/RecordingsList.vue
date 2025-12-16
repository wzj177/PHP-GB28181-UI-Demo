<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  ElCard,
  ElButton,
  ElTable,
  ElTableColumn,
  ElMessage,
  ElTag
} from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import { deviceApi } from '@/api/deviceApi'

// Define recording interface
interface Recording {
  id: string
  deviceId: string
  channelId: string
  startTime: string
  endTime: string
  duration: number // in minutes
  fileSize: string
  type: 'motion' | 'manual' | 'schedule'
}

const route = useRoute()
const deviceId = ref(route.params.deviceId as string)
const recordings = ref<Recording[]>([])
const loading = ref(false)

// Load recordings
onMounted(() => {
  loadRecordings()
})

const loadRecordings = async () => {
  if (!deviceId.value) return
  
  loading.value = true
  try {
    // In a real app, this would call the API
    // For demo, we'll use mock data
    const mockResponse = {
      data: [
        {
          id: 'rec1',
          deviceId: deviceId.value,
          channelId: 'ch1',
          startTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          endTime: new Date(Date.now() - 3000000).toISOString(), // 50 mins ago
          duration: 10,
          fileSize: '120MB',
          type: 'motion' as const
        },
        {
          id: 'rec2',
          deviceId: deviceId.value,
          channelId: 'ch1', 
          startTime: new Date(Date.now() - 1800000).toISOString(), // 30 mins ago
          endTime: new Date(Date.now() - 1200000).toISOString(), // 20 mins ago
          duration: 10,
          fileSize: '110MB',
          type: 'manual' as const
        },
        {
          id: 'rec3',
          deviceId: deviceId.value,
          channelId: 'ch2',
          startTime: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          endTime: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          duration: 60,
          fileSize: '600MB',
          type: 'schedule' as const
        }
      ]
    }

    recordings.value = mockResponse.data
  } catch (error) {
    console.error('Failed to fetch recordings:', error)
    ElMessage.error('获取录像列表失败')
  } finally {
    loading.value = false
  }
}

// Get recording type label
const getRecordingTypeLabel = (type: string) => {
  switch (type) {
    case 'motion': return '移动侦测'
    case 'manual': return '手动录像'
    case 'schedule': return '计划录像'
    default: return '未知类型'
  }
}

// Get recording type tag type
const getRecordingTypeTagType = (type: string) => {
  switch (type) {
    case 'motion': return 'warning'
    case 'manual': return 'primary'
    case 'schedule': return 'success'
    default: return 'info'
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Download recording
const downloadRecording = (recordingId: string) => {
  console.log(`Downloading recording: ${recordingId}`)
  ElMessage.success('下载开始')
}
</script>

<template>
  <div class="recordings-list-page">
    <div class="header">
      <h2>录像列表</h2>
    </div>

    <div class="main-content">
      <!-- Recordings list -->
      <ElCard class="recordings-card">
        <template #header>
          <div class="card-header">
            <span>录像列表</span>
          </div>
        </template>

        <ElTable
          :data="recordings"
          v-loading="loading"
          style="width: 100%"
        >
          <ElTableColumn prop="startTime" label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.startTime) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="endTime" label="结束时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.endTime) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="duration" label="时长(分钟)" width="120" />
          <ElTableColumn prop="fileSize" label="文件大小" width="120" />
          <ElTableColumn label="类型" width="120">
            <template #default="{ row }">
              <ElTag :type="getRecordingTypeTagType(row.type)">
                {{ getRecordingTypeLabel(row.type) }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="120">
            <template #default="{ row }">
              <ElButton
                size="small"
                :icon="Download"
                @click="downloadRecording(row.id)"
              >
                下载
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.recordings-list-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.main-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recordings-card {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e6e6e6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem !important;
  border-bottom: 1px solid #e6e6e6;
  font-weight: 600;
  color: #333;
}

:deep(.el-table) {
  border-radius: 8px;
}
</style>