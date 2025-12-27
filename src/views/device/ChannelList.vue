<template>
  <div class="channel-list-container">
    <!-- Channel filters -->
    <div class="channel-filters">
      <div class="filters">
        <ElSelect
          v-model="filters.status"
          placeholder="通道状态"
          clearable
          style="width: 150px; margin-right: 10px;"
        >
          <ElOption
            label="在线"
            value="online"
          />
          <ElOption
            label="离线"
            value="offline"
          />
        </ElSelect>

        <ElInput
          v-model="filters.keyword"
          placeholder="请输入通道名称或编号"
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="searchChannels"
        />

        <ElButton
          type="primary"
          @click="searchChannels"
        >
          搜索
        </ElButton>
        <ElButton @click="refreshChannels">
          刷新
        </ElButton>
      </div>
    </div>

    <!-- Channels table -->
    <div class="table-container">
      <ElTable
        v-loading="loading"
        :data="channels"
        style="width: 100%"
      >
        <ElTableColumn
          prop="channel_id"
          label="通道ID"
          width="180"
        />
        <ElTableColumn
          prop="channel_name"
          label="通道名称"
          width="150"
        />
        <ElTableColumn
          prop="manufacturer"
          label="厂商"
          width="120"
        />
        <ElTableColumn
          prop="model"
          label="型号"
          width="120"
        />
        <ElTableColumn
          label="通道状态"
          width="100"
        >
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="stream_id"
          label="流ID"
          width="180"
        />
        <ElTableColumn
          prop="main_video"
          label="主码流地址"
          width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="sub_video"
          label="子码流地址"
          width="200"
          show-overflow-tooltip
        />
        <ElTableColumn
          prop="last_update_at"
          label="最后更新时间"
          width="160"
        />
        <ElTableColumn
          label="操作"
          width="250"
        >
          <template #default="{ row }">
            <ElButton
              size="small"
              type="primary"
              @click="startPlay(row)"
            >
              播放
            </ElButton>
            <ElButton
              size="small"
              type="success"
              @click="startRecord(row)"
            >
              录像
            </ElButton>
            <ElButton
              size="small"
              type="warning"
              @click="ptzCtrl(row)"
            >
              PTZ
            </ElButton>
            <ElButton
              size="small"
              type="info"
              @click="getPlayback(row)"
            >
              回放
            </ElButton>
            <ElButton
              size="small"
              @click="getPicture(row)"
            >
              抓拍
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <!-- Pagination -->
    <div class="pagination">
      <ElPagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Video playback dialog -->
    <ElDialog
      v-model="playDialog.visible"
      :title="playDialog.title"
      width="80%"
      top="5vh"
    >
      <div class="video-container">
        <video 
          ref="videoRef" 
          :src="playDialog.videoUrl" 
          controls 
          autoplay 
          style="width: 100%; height: 500px;"
        />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closePlayDialog">关闭</ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { gb28181Api } from '@/api/gb28181Api'

const router = useRouter()

// Define channel type
interface Channel {
  id: number;
  channel_id: string;
  channel_name: string;
  device_id: string;
  manufacturer: string;
  model: string;
  status: 'online' | 'offline';
  stream_id?: string;
  main_video?: string;
  sub_video?: string;
  last_update_at: string;
}

// Props
const route = useRoute()

// State
const channels = ref<Channel[]>([])
const loading = ref(false)
const deviceInfo = ref({
  deviceId: route.params.deviceId as string,
  deviceName: '未知设备'
})
const filters = ref({
  status: '',
  keyword: ''
})
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// Play dialog
const playDialog = ref({
  visible: false,
  title: '',
  videoUrl: ''
})

// Get channel list
const getChannelList = async () => {
  const deviceId = route.params.deviceId as string
  if (!deviceId) {
    ElMessage.error('设备ID不能为空')
    return
  }

  loading.value = true
  try {
    const params = {
      status: filters.value.status || undefined,
      page: pagination.value.currentPage,
      limit: pagination.value.pageSize,
      keyword: filters.value.keyword || undefined
    }

    const response = await gb28181Api.getChannelList(deviceId, params)

    if (response?.code === 0) {
      channels.value = response.data.list || []
      pagination.value.total = response.data.paginator?.total || 0
    } else {
      channels.value = []
      pagination.value.total = 0
      throw new Error(response?.message || '获取通道列表失败')
    }
  } catch (error: any) {
    console.error('Failed to fetch channel list:', error)
    ElMessage.error(error.message || '获取通道列表失败')
  } finally {
    loading.value = false
  }
}

// Search channels
const searchChannels = () => {
  pagination.value.currentPage = 1
  getChannelList()
}

// Refresh channels
const refreshChannels = () => {
  getChannelList()
}

// Handle page size change
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  getChannelList()
}

// Handle current page change
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  getChannelList()
}

// Get status type for tag
const getStatusType = (status: string) => {
  switch (status) {
    case 'online':
      return 'success'
    case 'offline':
      return 'danger'
    default:
      return 'info'
  }
}

// Get status label
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    default:
      return '未知'
  }
}

// Start live playback
const startPlay = async (channel: Channel) => {
  try {
    const response = await gb28181Api.startLive({
      device_id: channel.device_id,
      channel_id: channel.channel_id
    })

    if (response?.code === 0 && response.data?.play_urls) {
      // Use the first available URL - typically would be an RTSP, RTMP, or HLS URL
      const urls = response.data.play_urls
      const firstUrl = urls[Object.keys(urls)[0]] || urls[0]

      // Show play dialog with video
      playDialog.value = {
        visible: true,
        title: `实时预览 - ${channel.channel_name}`,
        videoUrl: firstUrl
      }
    } else {
      throw new Error(response?.message || '启动实时播放失败')
    }
  } catch (error: any) {
    console.error('Failed to start live playback:', error)
    ElMessage.error(error.message || '启动实时播放失败')
  }
}

// Start recording
const startRecord = async (channel: Channel) => {
  try {
    const response = await gb28181Api.record.startRecord({
      device_id: channel.device_id,
      channel_id: channel.channel_id
    })
    
    if (response?.code === 0) {
      ElMessage.success('录像已开始')
    } else {
      throw new Error(response?.message || '开始录像失败')
    }
  } catch (error: any) {
    console.error('Failed to start recording:', error)
    ElMessage.error(error.message || '开始录像失败')
  }
}

// PTZ control
const ptzCtrl = (channel: Channel) => {
  // Navigate to PTZ control page for this channel
  router.push(`/ptz-control/${channel.device_id}/${channel.channel_id}`)
}

// Get playback options
const getPlayback = (channel: Channel) => {
  // Navigate to playback page for this channel
  router.push(`/playback/${channel.device_id}/${channel.channel_id}`)
}

// Get picture/snapshot
const getPicture = async (channel: Channel) => {
  try {
    const response = await gb28181Api.snapshot.getSnapshot({
      device_id: channel.device_id,
      channel_id: channel.channel_id
    })
    
    if (response?.code === 0 && response.data?.snapshot_url) {
      // Open snapshot in a new window/tab
      window.open(response.data.snapshot_url, '_blank')
      ElMessage.success('抓拍成功')
    } else {
      throw new Error(response?.message || '抓拍失败')
    }
  } catch (error: any) {
    console.error('Failed to get snapshot:', error)
    ElMessage.error(error.message || '抓拍失败')
  }
}

// Close play dialog
const closePlayDialog = () => {
  playDialog.value.visible = false
  playDialog.value.videoUrl = ''

  // Pause video if needed
  const video = document.querySelector('video')
  if (video) {
    video.pause()
  }
}

// Initialize data
onMounted(() => {
  const deviceId = route.params.deviceId as string

  // Get device info first
  gb28181Api.getDeviceDetail(deviceId).then(response => {
    if (response?.code === 0) {
      deviceInfo.value.deviceName = response.data.device_name || response.data.name || '未知设备'
    }
  }).catch(error => {
    console.error('Failed to get device info:', error)
    deviceInfo.value.deviceName = '未知设备'
  })

  // Get channel list
  getChannelList()
})
</script>

<style scoped>
.channel-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.header {
  margin-bottom: 20px;
}

.device-info {
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.device-info span {
  margin-right: 20px;
}

.channel-filters {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  align-items: center;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.video-container {
  width: 100%;
  height: 500px;
}
</style>