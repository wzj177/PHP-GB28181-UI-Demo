<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElTree, ElButton } from 'element-plus'
import PTZDialogNew from '@/components/ptz/PTZDialogNew.vue'
import { Play, Monitor } from '@element-plus/icons-vue'

interface DeviceNode {
  id: string
  name: string
  online?: boolean
  type?: string
  status?: 'online' | 'offline' | 'motion_detect'
  children?: (DeviceNode | Channel)[]
  channels?: Channel[] // Keep for compatibility
}

interface Channel {
  id: string
  name: string
  status: 'online' | 'offline' | 'motion_detect'
  rtspUrl: string
  type: 'video-channel'
}

// State
const deviceTree = ref<DeviceNode[]>([])
const currentLayout = ref<number>(1)
const showPTZPanel = ref(false)
const activeCell = ref<number | null>(0)
const selectedChannel = ref<string | null>(null)
const playingChannels = ref<{ [key: number]: string | null }>({})
const activeLayout = ref<number>(1)

// Layout options
const layoutOptions = [1, 4, 6, 9]

// Initialize device tree with mock data
const loadDeviceTree = () => {
  deviceTree.value = [
    {
      id: 'group1',
      name: '监控区域A',
      children: [
        {
          id: 'device1',
          name: '大厅IPC',
          online: true,
          type: 'ipc',
          status: 'online',
          children: [
            {
              id: 'ch1-1',
              name: '通道1',
              status: 'online',
              rtspUrl: 'rtsp://example.com/camera1',
              type: 'video-channel'
            },
            {
              id: 'ch1-2',
              name: '通道2',
              status: 'motion_detect',
              rtspUrl: 'rtsp://example.com/camera2',
              type: 'video-channel'
            }
          ]
        },
        {
          id: 'device2',
          name: '门口IPC',
          online: true,
          type: 'ipc',
          status: 'online',
          children: [
            {
              id: 'ch2-1',
              name: '通道1',
              status: 'online',
              rtspUrl: 'rtsp://example.com/camera3',
              type: 'video-channel'
            }
          ]
        }
      ]
    },
    {
      id: 'group2',
      name: '监控区域B',
      children: [
        {
          id: 'device3',
          name: '停车场IPC',
          online: false,
          type: 'ipc',
          status: 'offline',
          children: [
            {
              id: 'ch3-1',
              name: '通道1',
              status: 'offline',
              rtspUrl: 'rtsp://example.com/camera4',
              type: 'video-channel'
            }
          ]
        }
      ]
    }
  ]
}

// Handle node click in the tree
const handleNodeClick = (data: DeviceNode | Channel) => {
  // If the clicked node is a device with channels, auto-select the first channel
  if ('channels' in data && data.channels && data.channels.length > 0) {
    selectedChannel.value = data.channels[0].id
  }
  // If the clicked node is a channel, select it
  else if ('type' in data && data.type === 'video-channel') {
    selectedChannel.value = data.id
  }
}

// Handle channel selection and play in active cell
const handleSelectChannel = (channelId: string) => {
  if (activeCell.value !== null && activeCell.value >= 0) {
    playingChannels.value[activeCell.value] = channelId
    selectedChannel.value = channelId
  }
}

// Change layout
const changeLayout = (layout: number) => {
  currentLayout.value = layout
  activeLayout.value = layout
  // Initialize the first cell as active when changing layout
  activeCell.value = 0
  // Reset playing channels
  playingChannels.value = {}
}

// Activate a cell
const activateCell = (index: number) => {
  activeCell.value = index
}

// Show PTZ controls for a specific channel
const showPTZControls = (channelId: string) => {
  selectedChannel.value = channelId
  showPTZPanel.value = true
}

// Get status class for display
const getStatusClass = (status: string) => {
  switch (status) {
    case 'online': return 'online'
    case 'offline': return 'offline'
    case 'motion_detect': return 'warning'
    default: return 'offline'
  }
}

// Get status text for display
const getStatusText = (status: string) => {
  switch (status) {
    case 'online': return '在线'
    case 'offline': return '离线'
    case 'motion_detect': return '移动侦测'
    default: return '未知'
  }
}

// Generate grid styles based on layout
const gridStyle = computed(() => {
  if (activeLayout.value === 1) return { gridTemplate: '1fr / 1fr' }
  if (activeLayout.value === 4) return { gridTemplate: '1fr 1fr / 1fr 1fr' }
  if (activeLayout.value === 9) return { gridTemplate: 'repeat(3,1fr) / repeat(3,1fr)' }
  
  // For 6 layout, we need special handling
  return {}
})

// Get specific grid styles for 6 layout
const getGridItemStyle = (index: number) => {
  if (activeLayout.value !== 6) return {}
  
  if (index === 0) {
    return { gridColumn: '1 / 3', gridRow: '1 / 3' }
  } else if (index === 1) {
    return { gridColumn: '3', gridRow: '1' }
  } else if (index === 2) {
    return { gridColumn: '3', gridRow: '2' }
  } else if (index === 3) {
    return { gridColumn: '1', gridRow: '3' }
  } else if (index === 4) {
    return { gridColumn: '2', gridRow: '3' }
  } else if (index === 5) {
    return { gridColumn: '3', gridRow: '3' }
  }
  
  return {}
}

// Get the name of the channel playing in a cell
const getChannelName = (index: number) => {
  const channelId = playingChannels.value[index]
  if (!channelId) return '未播放'

  // Find the channel name by ID
  const findChannel = (nodes: (DeviceNode | Channel)[]): { deviceName: string, channelName: string } | null => {
    for (const node of nodes) {
      if ('type' in node && node.type === 'video-channel' && node.id === channelId) {
        return { deviceName: '', channelName: node.name }
      }
      if ('children' in node && node.children) {
        // Check if this is a device with channels as children
        if (Array.isArray(node.children)) {
          const result = findChannel(node.children)
          if (result) {
            return { deviceName: (node as DeviceNode).name, channelName: result.channelName }
          }
        }
      }
    }
    return null
  }

  for (const group of deviceTree.value) {
    const result = findChannel(group.children || [])
    if (result) {
      return result.deviceName ? `${result.deviceName} - ${result.channelName}` : result.channelName
    }
  }

  return '未播放'
}

// Get channel status
const getChannelStatus = (channelId: string) => {
  const findChannelStatus = (nodes: (DeviceNode | Channel)[]): 'online' | 'offline' | 'motion_detect' | undefined => {
    for (const node of nodes) {
      if ('type' in node && node.type === 'video-channel' && node.id === channelId) {
        return node.status
      }
      if ('children' in node && node.children) {
        const status = findChannelStatus(node.children)
        if (status) return status
      }
    }
    return undefined
  }

  for (const group of deviceTree.value) {
    const status = findChannelStatus(group.children || [])
    if (status) return status
  }

  return 'offline'
}

// Initialize on mount
loadDeviceTree()
</script>

<template>
  <div class="page">
    <!-- Device tree panel -->
    <aside class="device-panel">
      <ElTree
        :data="deviceTree"
        :props="{ children: 'children', label: 'name' }"
        node-key="id"
        :expand-on-click-node="false"
        @node-click="handleNodeClick"
        default-expand-all
        :class="'device-tree'"
      >
        <template #default="{ node, data }">
          <div class="tree-node" v-if="data.children">
            <!-- Device Group -->
            <div class="device-group">
              <span
                class="status-dot"
                :class="getStatusClass(data.status || 'offline')"
              ></span>
              <span class="node-label">{{ data.name }}</span>
            </div>
          </div>
          <div class="tree-node" v-else>
            <!-- Device -->
            <div class="device" v-if="data.type === 'ipc'">
              <span
                class="status-dot"
                :class="getStatusClass(data.status || 'offline')"
              ></span>
              <span class="node-label">{{ data.name }}</span>
            </div>

            <!-- Channel -->
            <div
              class="channel"
              v-else-if="data.type === 'video-channel'"
              @click.stop="handleSelectChannel(data.id)"
            >
              <div class="channel-left">
                <span
                  class="status-dot"
                  :class="getStatusClass(data.status || 'offline')"
                ></span>
                <span class="node-label">{{ data.name }}</span>
              </div>

              <!-- Show PTZ button only for video-channel type -->
              <ElButton
                v-if="data.type === 'video-channel'"
                size="small"
                type="primary"
                plain
                @click.stop="showPTZControls(data.id)"
              >
                云台
              </ElButton>
            </div>
          </div>
        </template>
      </ElTree>
    </aside>

    <!-- Main content -->
    <main class="main">
      <!-- Top toolbar -->
      <div class="toolbar">
        <ElButton
          v-for="layout in layoutOptions"
          :key="layout"
          :class="['layout-btn', { active: activeLayout === layout }]"
          @click="changeLayout(layout)"
        >
          {{ layout }}
        </ElButton>
      </div>

      <!-- Video grid -->
      <div class="grid" :style="activeLayout === 6 ? {} : gridStyle">
        <div
          v-for="index in currentLayout"
          :key="index"
          :class="['cell', { active: activeCell === index - 1 }]"
          :style="activeLayout === 6 ? getGridItemStyle(index - 1) : {}"
          @click="activateCell(index - 1)"
        >
          <div class="placeholder">
            {{ getChannelName(index - 1) }}
          </div>
          <div class="ptz-float" v-if="activeCell === index - 1">
            <ElButton 
              size="small" 
              type="primary" 
              @click="showPTZControls(playingChannels[index - 1] || '')"
            >
              云台控制
            </ElButton>
          </div>
        </div>
      </div>
    </main>

    <!-- PTZ Dialog -->
    <PTZDialogNew
      v-model="showPTZPanel"
      :channel-id="selectedChannel || ''"
      @close="showPTZPanel = false"
    />
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.page {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100vh;
  background: $bg-main;
  color: $text-main;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "PingFang SC", "Microsoft YaHei", sans-serif;
}

/* Device Panel */
.device-panel {
  background: $bg-panel;
  border-right: 1px solid $border-base;
  padding: 12px;
  overflow-y: auto;
  height: 100%;

  :deep(.el-tree) {
    background-color: transparent;
    color: $text-main;
  }

  :deep(.el-tree-node__content) {
    height: auto;
    padding: 0;
    margin: 2px 0;
    background-color: $bg-panel !important;

    &:hover {
      background-color: $bg-hover !important;
    }
  }

  :deep(.el-tree-node:focus > .el-tree-node__content) {
    background-color: $bg-hover !important;
  }

  :deep(.el-tree-node > .el-tree-node__children) {
    background-color: transparent !important;
    overflow: hidden;
  }

  :deep(.el-tree-node__label) {
    color: $text-main;
  }
}

.tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 6px;
}

.device-group {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  width: 100%;
  font-size: 13px;
  color: $text-main;
}

.device {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px;
  width: 100%;
  font-size: 13px;
  color: $text-main;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.online {
  background: $success;
}

.offline {
  background: $danger;
}

.warning {
  background: $warning;
}

.channel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 8px 6px 22px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;

  &:hover {
    background: $bg-hover;
  }
}

.channel-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.node-label {
  flex: 1;
}

/* Main content */
.main {
  display: flex;
  flex-direction: column;
  background: #000;
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  background: $bg-panel;
  border-bottom: 1px solid $border-base;
}

.layout-btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: 1px solid $border-light;
  background: transparent;
  color: $text-main;

  &.active {
    background: $primary;
    border-color: $primary;
    color: #fff;
  }
}

/* Video Grid */
.grid {
  flex: 1;
  display: grid;
  gap: 4px;
  padding: 4px;
  background: #000;
}

.cell {
  position: relative;
  background: #000;
  border: 1px solid #111;
  cursor: pointer;

  &.active {
    outline: 2px solid $primary;
    z-index: 1;
  }
}

.placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  font-size: 13px;
}

/* PTZ float controls */
.ptz-float {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba($bg-panel, 0.9);
  border: 1px solid $border-light;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  display: none;
  z-index: 10;
  
  .el-button {
    font-size: 12px;
    padding: 4px 8px;
  }
}

.cell.active .ptz-float {
  display: block;
}

/* Special grid layout for 6 screens */
.grid:deep() {
  &.layout-6 {
    grid-template-columns: 2fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
  }
}
</style>