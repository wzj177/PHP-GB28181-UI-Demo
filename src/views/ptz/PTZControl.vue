<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElTree, ElButton, ElMessage } from 'element-plus'
import PTZDialogNew from '@/components/ptz/PTZDialogNew.vue'
import { Play, Monitor } from '@element-plus/icons-vue'
import { gb28181Api } from '@/api/gb28181Api'

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
  rtspUrl?: string
  type: 'video-channel'
  device_id?: string // Add device_id to link channel with device
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

// Load device tree from backend
const loadDeviceTree = async () => {
  try {
    console.log('📼 Fetching device list for PTZ...')
    const deviceResponse = await gb28181Api.getDeviceList();

    console.log('📼 Device response:', deviceResponse)

    // Handle different response structures
    let devices: any[] = []

    if (deviceResponse?.list) {
      // Mock API returns { list: [...], paginator: {...} }
      devices = deviceResponse.list
    } else if (deviceResponse?.code === 0 && deviceResponse.data?.list) {
      // Real API returns { code: 0, data: { list: [...] } }
      devices = deviceResponse.data.list
    } else if (deviceResponse?.code === 0 && Array.isArray(deviceResponse.data)) {
      // Alternative: { code: 0, data: [...] }
      devices = deviceResponse.data
    } else if (Array.isArray(deviceResponse)) {
      // Direct array response
      devices = deviceResponse
    } else if (deviceResponse?.code !== 0) {
      throw new Error(deviceResponse.message || '获取设备列表失败');
    }

    console.log('📼 Parsed devices:', devices)

    const treeData: DeviceNode[] = [];

    // Group devices by manufacturer or other logical groupings
    const groupedDevices: { [key: string]: any[] } = {};

    devices.forEach((device: any) => {
      const groupKey = device.manufacturer || 'Unknown';
      if (!groupedDevices[groupKey]) {
        groupedDevices[groupKey] = [];
      }
      groupedDevices[groupKey].push(device);
    });

    // Transform devices into tree structure
    Object.entries(groupedDevices).forEach(([group, devices]) => {
      const groupNode: DeviceNode = {
        id: `group_${group}`,
        name: group,
        children: devices.map((device: any) => {
          // Get channels for this device
          return {
            id: device.device_id,
            name: device.device_name || device.name,
            online: device.status === 'online',
            type: 'ipc',
            status: device.status === 'online' ? 'online' : 'offline',
            children: [] // Will be populated with channels
          };
        })
      };
      treeData.push(groupNode);
    });

    deviceTree.value = treeData;

    // Now, for each device, fetch its channels
    for (const group of deviceTree.value) {
      if (group.children) {
        for (const deviceNode of group.children) {
          try {
            const channelResponse = await gb28181Api.getChannelList(deviceNode.id);

            if (channelResponse.code === 0) {
              const channels = channelResponse.data.channels || channelResponse.data;

              // Update the device node with channels
              if (Array.isArray(channels) && channels.length > 0) {
                deviceNode.children = channels.map((channel: any) => ({
                  id: channel.channel_id,
                  name: channel.channel_name || channel.name,
                  status: channel.status === 'streaming' ? 'online' :
                         channel.status === 'motion_detect' ? 'motion_detect' : 'offline',
                  type: 'video-channel',
                  device_id: deviceNode.id
                }));
              } else {
                deviceNode.children = [];
              }
            }
          } catch (error) {
            console.error(`获取设备 ${deviceNode.id} 通道失败:`, error);
            // Set empty children if channels couldn't be loaded
            deviceNode.children = [];
          }
        }
      }
    }
  } catch (error: any) {
    console.error('加载设备树失败:', error);
    ElMessage.error(error.message || '获取设备列表失败');
  }
}

// Handle node click in the tree
const handleNodeClick = (data: DeviceNode | Channel) => {
  // If the clicked node is a channel, select it
  if ('type' in data && data.type === 'video-channel') {
    selectedChannel.value = data.id
  }
}

// Handle channel selection and play in active cell
const handleSelectChannel = async (channelId: string) => {
  if (activeCell.value !== null && activeCell.value >= 0) {
    // Find the device ID for this channel
    let deviceId = '';
    for (const group of deviceTree.value) {
      if (group.children) {
        for (const device of group.children) {
          if (device.children) {
            const channel = device.children.find((ch: Channel) => ch.id === channelId);
            if (channel && channel.device_id) {
              deviceId = channel.device_id;
              break;
            }
          }
        }
        if (deviceId) break;
      }
    }

    if (!deviceId) {
      ElMessage.error('无法找到设备ID');
      return;
    }

    try {
      // Start the live stream using the GB28181 API
      const response = await gb28181Api.startLive({
        device_id: deviceId,
        channel_id: channelId
      });

      if (response.code === 0) {
        // Set the channel as playing in the selected cell
        playingChannels.value[activeCell.value] = channelId;
        selectedChannel.value = channelId;
        ElMessage.success('视频播放开始');
      } else {
        ElMessage.error(response.message || '启动视频播放失败');
      }
    } catch (error: any) {
      console.error('启动视频播放失败:', error);
      ElMessage.error(error.message || '启动视频播放失败');
    }
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
        // Find the device name from the deviceTree
        for (const group of deviceTree.value) {
          if (group.children) {
            for (const device of group.children) {
              if (device.children) {
                const foundChannel = device.children.find((ch: Channel) => ch.id === channelId);
                if (foundChannel) {
                  return { deviceName: device.name, channelName: node.name }
                }
              }
            }
          }
        }
        // If we couldn't find the device name, just return the channel name
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
    if (group.children) {
      for (const device of group.children) {
        if (device.children) {
          const channel = device.children.find((ch: Channel) => ch.id === channelId);
          if (channel) {
            return `${device.name} - ${channel.name}`;
          }
        }
      }
    }
  }

  return '未播放'
}

// Get channel status
const getChannelStatus = (channelId: string) => {
  for (const group of deviceTree.value) {
    if (group.children) {
      for (const device of group.children) {
        if (device.children) {
          const channel = device.children.find((ch: Channel) => ch.id === channelId);
          if (channel) {
            return channel.status
          }
        }
      }
    }
  }

  return 'offline'
}

// Initialize on mount
onMounted(() => {
  loadDeviceTree()
})
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
        default-expand-all
        :class="'device-tree'"
        @node-click="handleNodeClick"
      >
        <template #default="{ node, data }">
          <div
            v-if="data.children"
            class="tree-node"
          >
            <!-- Device Group -->
            <div class="device-group">
              <span
                class="status-dot"
                :class="getStatusClass(data.status || 'offline')"
              />
              <span class="node-label">{{ data.name }}</span>
            </div>
          </div>
          <div
            v-else
            class="tree-node"
          >
            <!-- Device -->
            <div
              v-if="data.type === 'ipc'"
              class="device"
            >
              <span
                class="status-dot"
                :class="getStatusClass(data.status || 'offline')"
              />
              <span class="node-label">{{ data.name }}</span>
            </div>

            <!-- Channel -->
            <div
              v-else-if="data.type === 'video-channel'"
              class="channel"
              @click.stop="handleSelectChannel(data.id)"
            >
              <div class="channel-left">
                <span
                  class="status-dot"
                  :class="getStatusClass(data.status || 'offline')"
                />
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
      <div
        class="grid"
        :style="activeLayout === 6 ? {} : gridStyle"
      >
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
          <div
            v-if="activeCell === index - 1"
            class="ptz-float"
          >
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
  // border: 1px solid $border-light;
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