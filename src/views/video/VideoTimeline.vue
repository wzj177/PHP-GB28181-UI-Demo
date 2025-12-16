<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'

/* ================= 类型定义 ================= */

interface RecordingSegment {
  start: number
  end: number
  type: 'normal' | 'alarm'
}

interface Props {
  records: RecordingSegment[]
  currentTime?: number
  totalSeconds?: number
  defaultDate?: Date
}

interface Emits {
  (e: 'timeChange', time: number): void
  (e: 'segmentPlay', segment: RecordingSegment): void
  (e: 'ready'): void
  (e: 'dateChange', date: Date): void
}

/* ================= Props ================= */

const props = withDefaults(defineProps<Props>(), {
  records: () => [
    { start: 2 * 3600, end: 5 * 3600 + 1800, type: 'normal' },
    { start: 7 * 3600, end: 9 * 3600, type: 'normal' },
    { start: 16 * 3600 + 30, end: 17 * 3600 + 120, type: 'alarm' },
    { start: 19 * 3600, end: 21 * 3600 + 600, type: 'normal' }
  ],
  currentTime: 17 * 3600,
  totalSeconds: 86400,
  defaultDate: () => new Date()
})

const emit = defineEmits<Emits>()

/* ================= 状态 ================= */

const canvasRef = ref<HTMLCanvasElement | null>(null)
const labelRef = ref<HTMLDivElement | null>(null)
const currentSecond = ref(props.currentTime)

/* ================= 工具函数 ================= */

const format = (sec: number): string => {
  if (isNaN(sec) || sec < 0) return '--:--:--'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/* ================= 绘制 ================= */

const draw = () => {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.clientWidth
  const h = canvas.clientHeight
  const dpr = window.devicePixelRatio || 1

  canvas.width = w * dpr
  canvas.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  ctx.clearRect(0, 0, w, h)

  /* ===== 背景 ===== */
  ctx.fillStyle = '#020617'
  ctx.fillRect(0, 0, w, h)

  const axisY = h / 2

  /* ===== 时间映射 ===== */

  
  const leftPadding = 10
  const rightPadding = 10
  const usableWidth = w - leftPadding - rightPadding

  const timeToX = (sec: number) =>
    leftPadding + (sec / props.totalSeconds) * usableWidth

  /* ===== 主时间轴（仅 00:00 ~ 23:00）===== */

  ctx.strokeStyle = '#334155'
  ctx.beginPath()
  ctx.moveTo(leftPadding, axisY)
  ctx.lineTo(leftPadding + usableWidth, axisY)
  ctx.stroke()

  /* ===== 小时区间刻度（参考图逻辑）===== */

  const hourWidth = usableWidth / 24

  for (let hour = 0; hour < 24; hour++) {
    const blockStartX = leftPadding + hour * hourWidth
    const blockCenterX = blockStartX + hourWidth / 2

    // 区间分隔线（01:00 ~ 23:00）
    if (hour > 0) {
      ctx.strokeStyle = '#475569'
      ctx.beginPath()
      ctx.moveTo(blockStartX, axisY - 12)
      ctx.lineTo(blockStartX, axisY + 12)
      ctx.stroke()
    }

    // 时间文字（区间中间）
    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${String(hour).padStart(2, '0')}:00`,
      blockCenterX,
      axisY + 28
    )
  }

  /* ===== 录像段（仍然用真实时间映射）===== */

  props.records.forEach(r => {
    const x1 = timeToX(r.start)
    const x2 = timeToX(r.end)
    ctx.fillStyle = r.type === 'alarm' ? '#ef4444' : '#22c55e'
    ctx.fillRect(x1, axisY - 6, x2 - x1, 12)
  })

  /* ===== 当前时间指针 ===== */

  const safeTime = Math.max(0, Math.min(currentSecond.value, props.totalSeconds))
  const px = timeToX(safeTime)

  ctx.strokeStyle = '#ef4444'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(px, 0)
  ctx.lineTo(px, h)
  ctx.stroke()

  ctx.fillStyle = '#ef4444'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(format(safeTime), px, 14)

  if (labelRef.value) {
    labelRef.value.textContent = format(safeTime)
  }
}

/* ================= 点击换算 ================= */

const handleCanvasClick = (e: MouseEvent) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left

  const leftPadding = 50
  const rightPadding = 50
  const usableWidth = rect.width - leftPadding - rightPadding

  const clamped = Math.min(Math.max(x - leftPadding, 0), usableWidth)
  const newTime = Math.floor((clamped / usableWidth) * props.totalSeconds)

  currentSecond.value = newTime
  emit('timeChange', newTime)
  draw()
}

/* ================= 生命周期 ================= */

onMounted(() => {
  nextTick(draw)
  emit('ready')
  window.addEventListener('resize', draw)
})

watch(() => props.records, draw, { deep: true })
watch(() => props.currentTime, v => {
  if (typeof v === 'number') {
    currentSecond.value = v
    draw()
  }
})

defineExpose({
  seekToTime(time: number) {
    currentSecond.value = time
    draw()
    emit('timeChange', time)
  }
})
</script>

<template>
  <div class="container">
    <div class="player">
      <slot>
        <div class="player-placeholder">
          <p>视频播放器占位</p>
          <p>当前时间：{{ format(currentSecond) }}</p>
        </div>
      </slot>
    </div>

    <div class="timeline-wrapper">
      <div class="timeline-header">
        <div class="timeline-title">录像时间轴（24 小时）</div>
        <div ref="labelRef">{{ format(currentSecond) }}</div>
      </div>

      <canvas ref="canvasRef" class="timeline-canvas" @click="handleCanvasClick" />

      <div class="legend">
        <span><i class="dot"></i> 正常录像</span>
        <span><i class="dot red"></i> 报警录像</span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.container {
  max-width: 1200px;
  margin: 24px auto;
  padding: 16px;
  background: #0f172a;
  border-radius: 16px;
}

.player {
  height: 420px;
  background: #000;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.player-placeholder {
  color: #94a3b8;
  text-align: center;
}

.timeline-wrapper {
  margin-top: 16px;
  padding: 12px;
  background: #020617;
  border-radius: 12px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  color: #cbd5f5;
  margin-bottom: 6px;
  font-size: 13px;
}

.timeline-canvas {
  width: 100%;
  height: 72px;
  cursor: pointer;
}

.legend {
  margin-top: 6px;
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #94a3b8;
}

.dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  border-radius: 2px;
  display: inline-block;
}

.dot.red {
  background: #ef4444;
}
</style>