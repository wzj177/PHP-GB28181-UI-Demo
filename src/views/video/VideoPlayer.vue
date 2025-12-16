<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
  ElCard,
  ElButton,
  ElDatePicker,
  ElInput,
  ElMessage
} from 'element-plus'
import { Search, VideoCamera, Download } from '@element-plus/icons-vue'
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
const selectedDateRange = ref<[Date, Date] | null>(null)
const currentTime = ref(new Date())
const isPlaying = ref(false)
const currentTimePosition = ref(0)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const isDragging = ref(false)
const startTime = ref(new Date())
const endTime = ref(new Date())

// Initialize with today's date
onMounted(() => {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  selectedDateRange.value = [yesterday, today]
  startTime.value = yesterday
  endTime.value = today
  loadRecordings()
  nextTick(() => {
    drawTimeline()
  })
})

// Handle window resize to redraw canvas
onUnmounted(() => {
  window.removeEventListener('resize', drawTimeline)
})

// Load recordings
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
        }
      ]
    }

    recordings.value = mockResponse.data
    drawTimeline()
  } catch (error) {
    console.error('Failed to fetch recordings:', error)
    ElMessage.error('获取录像列表失败')
  } finally {
    loading.value = false
  }
}

// Search recordings
const searchRecordings = () => {
  if (!selectedDateRange.value) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  const [start, end] = selectedDateRange.value
  startTime.value = start
  endTime.value = end
  loadRecordings()
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

// Get recording type color
const getRecordingTypeColor = (type: string) => {
  switch (type) {
    case 'motion': return '#e6a23c' // orange
    case 'manual': return '#409eff' // blue
    case 'schedule': return '#67c23a' // green
    default: return '#909399' // gray
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Format time for display
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  })
}

// Canvas drawing functions for timeline
const drawTimeline = () => {
  if (!canvasRef.value) return
  
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // Set canvas dimensions
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  
  const width = canvas.width
  const height = canvas.height
  const padding = 20
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  // Draw background
  ctx.fillStyle = '#f8f9fa'
  ctx.fillRect(0, 0, width, height)
  
  // Draw time major ticks
  ctx.strokeStyle = '#dee2e6'
  ctx.lineWidth = 1
  
  // Calculate and draw time ticks
  const totalDuration = endTime.value.getTime() - startTime.value.getTime()
  const pixelsPerMs = width / totalDuration
  
  // Draw hour marks
  const startHour = new Date(startTime.value)
  startHour.setMinutes(0, 0, 0)
  
  let currentHour = new Date(startHour)
  while (currentHour.getTime() < endTime.value.getTime()) {
    const x = (currentHour.getTime() - startTime.value.getTime()) * pixelsPerMs
    
    if (x >= 0 && x <= width) {
      // Draw vertical line
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
      
      // Draw time label
      ctx.fillStyle = '#495057'
      ctx.font = '10px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(currentHour.toLocaleTimeString('zh-CN', { hour: '2-digit' }), x, height - 5)
    }
    
    // Move to next hour
    currentHour.setHours(currentHour.getHours() + 1)
  }
  
  // Draw minute marks (smaller ticks)
  const startMinute = new Date(startTime.value)
  startMinute.setSeconds(0, 0)
  
  let currentMinute = new Date(startMinute)
  while (currentMinute.getTime() < endTime.value.getTime()) {
    // Skip if this minute is already covered by hour mark
    if (currentMinute.getMinutes() === 0) {
      currentMinute.setMinutes(currentMinute.getMinutes() + 1)
      continue
    }
    
    const x = (currentMinute.getTime() - startTime.value.getTime()) * pixelsPerMs
    
    if (x >= 0 && x <= width) {
      // Draw smaller vertical line for minutes
      ctx.beginPath()
      ctx.moveTo(x, height - 15)
      ctx.lineTo(x, height)
      ctx.strokeStyle = '#e9ecef'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
    
    currentMinute.setMinutes(currentMinute.getMinutes() + 1)
  }
  
  // Draw recording events
  recordings.value.forEach(rec => {
    const start = new Date(rec.startTime).getTime()
    const end = new Date(rec.endTime).getTime()
    
    const startX = (start - startTime.value.getTime()) * pixelsPerMs
    const endX = (end - startTime.value.getTime()) * pixelsPerMs
    const rectWidth = endX - startX
    
    if (rectWidth > 0 && startX <= width && endX >= 0) {
      const color = getRecordingTypeColor(rec.type)
      
      // Draw event rectangle
      ctx.fillStyle = color + '80' // Add transparency (80 hex = 50% opacity)
      ctx.fillRect(startX, padding, Math.max(rectWidth, 2), height - padding * 2)
      
      // Draw border
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.strokeRect(startX, padding, Math.max(rectWidth, 2), height - padding * 2)
    }
  })
  
  // Draw time cursor
  const now = new Date()
  const cursorX = (now.getTime() - startTime.value.getTime()) * pixelsPerMs
  if (cursorX >= 0 && cursorX <= width) {
    ctx.strokeStyle = '#dc3545' // Red color for current time
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(cursorX, 0)
    ctx.lineTo(cursorX, height)
    ctx.stroke()
    
    // Draw triangle at top
    ctx.fillStyle = '#dc3545'
    ctx.beginPath()
    ctx.moveTo(cursorX - 5, 0)
    ctx.lineTo(cursorX + 5, 0)
    ctx.lineTo(cursorX, 10)
    ctx.closePath()
    ctx.fill()
  }
}

// Handle canvas mouse events for dragging
const handleMouseDown = (e: MouseEvent) => {
  isDragging.value = true
  updateTimelinePosition(e)
}

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    updateTimelinePosition(e)
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

const updateTimelinePosition = (e: MouseEvent) => {
  if (!canvasRef.value) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const width = canvas.width

  // Calculate time based on position
  const totalDuration = endTime.value.getTime() - startTime.value.getTime()
  const newTime = startTime.value.getTime() + (x / width) * totalDuration
  currentTime.value = new Date(newTime)

  // Update position percentage
  currentTimePosition.value = (x / width) * 100

  // Draw the timeline to show the cursor
  drawTimeline()
}

// Format date for display
const formatDisplayDate = (date: Date | null) => {
  if (!date) return ''
  return date.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Download recording
const downloadRecording = (recordingId: string) => {
  console.log(`Downloading recording: ${recordingId}`)
  ElMessage.success('下载开始')
}
</script>

<template>
  <div class="video-player-page">
    <div class="header">
      <h2>录像回放</h2>
    </div>

    <div class="main-content">
      <!-- Search controls -->
      <ElCard class="search-card">
        <div class="search-controls">
          <ElDatePicker
            v-model="selectedDateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY/MM/DD HH:mm:ss"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
            :shortcuts="[
              {
                text: '今天',
                value: () => {
                  const end = new Date()
                  const start = new Date()
                  start.setHours(0, 0, 0, 0)
                  return [start, end]
                },
              },
              {
                text: '最近7天',
                value: () => {
                  const end = new Date()
                  const start = new Date()
                  start.setDate(start.getDate() - 7)
                  return [start, end]
                },
              },
            ]"
          />

          <ElButton
            type="primary"
            @click="searchRecordings"
            :icon="Search"
          >
            查询
          </ElButton>
        </div>
      </ElCard>

      <!-- Video player -->
      <ElCard class="player-card">
        <template #header>
          <div class="card-header">
            <span>视频播放</span>
          </div>
        </template>

        <div class="video-player-container">
          <!-- Black background instead of video player -->
          <div class="black-player-background"></div>
        </div>
      </ElCard>

      <!-- Timeline -->
      <ElCard class="timeline-card">
        <template #header>
          <div class="card-header">
            <span>录像时间轴</span>
            <div class="timeline-info">
              <span>当前时间: {{ formatTime(currentTime) }}</span>
            </div>
          </div>
        </template>

        <div class="timeline-container">
          <div class="canvas-wrapper">
            <canvas
              ref="canvasRef"
              class="timeline-canvas"
              @mousedown="handleMouseDown"
              @mousemove="handleMouseMove"
              @mouseup="handleMouseUp"
              @mouseleave="handleMouseUp"
            ></canvas>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style scoped>
.video-player-page {
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
  display: flex;
  flex: 1;
  overflow: auto;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  height: 100%;
}

.search-card, .player-card, .timeline-card {
  flex: none; /* Don't grow */
}

.search-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e6e6e6;
}

.search-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.player-card, .timeline-card, .recordings-card {
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

.timeline-info {
  font-weight: normal;
  font-size: 0.9em;
  color: #666;
}

.video-player-container {
  max-width: 50%; /* Maximum width of 50% */
  width: 600px; /* Larger width */
  height: 337.5px; /* Maintain 16:9 aspect ratio */
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #000;
  margin: 20px auto; /* Center horizontally */
}

.black-player-background {
  width: 100%;
  height: 100%;
  background-color: #000;
}

.timeline-container {
  height: 200px; /* Increased height to make timeline more visible */
  padding: 10px 0;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  overflow: hidden;
  background-color: #fff;
}

.timeline-canvas {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

:deep(.el-card__body) {
  padding: 0;
}
</style>