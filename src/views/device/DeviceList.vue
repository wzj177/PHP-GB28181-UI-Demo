<template>
  <div class="device-list-container">
    <!-- Search and filters -->
    <div class="search-filters">
      <div class="filters">
        <ElSelect
          v-model="filters.status"
          placeholder="设备状态"
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
          placeholder="请输入设备名称或编号"
          style="width: 200px; margin-right: 10px;"
          @keyup.enter="searchDevices"
        />

        <ElButton
          type="primary"
          @click="searchDevices"
        >
          搜索
        </ElButton>
        <ElButton @click="resetFilters">
          重置
        </ElButton>
      </div>
    </div>

    <!-- Devices table -->
    <div class="table-container">
      <ElTable
        v-loading="loading"
        :data="devices"
        style="width: 100%"
      >
        <ElTableColumn
          prop="device_id"
          label="设备ID"
          width="180"
        />
        <ElTableColumn
          prop="device_name"
          label="设备名称"
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
          prop="firmware"
          label="固件版本"
          width="120"
        />
        <ElTableColumn
          label="设备状态"
          width="100"
        >
          <template #default="{ row }">
            <ElTag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="通道数"
          width="80"
        >
          <template #default="{ row }">
            {{ row.channel_counts || 0 }}
          </template>
        </ElTableColumn>
        <ElTableColumn
          prop="ip"
          label="IP地址"
          width="150"
        />
        <ElTableColumn
          prop="port"
          label="端口"
          width="80"
        />
        <ElTableColumn
          prop="last_heartbeat_at"
          label="最后心跳时间"
          width="180"
        />
        <ElTableColumn
          label="操作"
          width="300"
        >
          <template #default="{ row }">
            <ElButton
              size="small"
              @click="viewChannels(row)"
            >
              通道列表
            </ElButton>
            <ElButton
              size="small"
              type="primary"
              @click="viewLive(row)"
            >
              实时预览
            </ElButton>
            <ElButton
              size="small"
              type="success"
              @click="queryCatalog(row)"
            >
              查询目录
            </ElButton>
            <ElButton 
              size="small" 
              type="warning" 
              :loading="row.syncing"
              @click="syncChannels(row)"
            >
              同步通道
            </ElButton>
            <ElButton
              size="small"
              type="danger"
              @click="deleteDevice(row)"
            >
              删除
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { gb28181Api } from '@/api/gb28181Api'

// Define device type
interface Device {
  id: number;
  device_id: string;
  device_name: string;
  manufacturer: string;
  model: string;
  firmware: string;
  status: 'online' | 'offline';
  ip: string;
  port: number;
  channel_counts?: number;
  last_heartbeat_at: string;
  [key: string]: any;
}

// State
const devices = ref<Device[]>([])
const loading = ref(false)
const filters = ref({
  status: '',
  keyword: ''
})
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const router = useRouter()

// Get device list
const getDeviceList = async () => {
  loading.value = true
  try {
    // Fetch device list from API with filters and pagination
    const params = {
      status: filters.value.status || undefined,
      page: pagination.value.currentPage,
      limit: pagination.value.pageSize,
      keyword: filters.value.keyword || undefined
    }
    
    const response = await gb28181Api.getDeviceList(params)
    
    // Extract data from response based on actual backend response structure
    // Backend response format: { code: 0, message: "success", data: { list: [...], paginator: {...} } }
    if (response?.code === 0) {
      devices.value = response.data.list || []
      pagination.value.total = response.data.paginator?.total || 0
    } else {
      devices.value = []
      pagination.value.total = 0
      throw new Error(response?.message || '获取设备列表失败')
    }
  } catch (error: any) {
    console.error('Failed to fetch device list:', error)
    ElMessage.error(error.message || '获取设备列表失败')
  } finally {
    loading.value = false
  }
}

// Search devices
const searchDevices = () => {
  pagination.value.currentPage = 1
  getDeviceList()
}

// Reset filters
const resetFilters = () => {
  filters.value = {
    status: '',
    keyword: ''
  }
  pagination.value.currentPage = 1
  getDeviceList()
}

// Handle page size change
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  getDeviceList()
}

// Handle current page change
const handleCurrentChange = (page: number) => {
  pagination.value.currentPage = page
  getDeviceList()
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

// View device channels
const viewChannels = (device: Device) => {
  // Navigate to channels page for this device
  router.push(`/devices/${device.device_id}/channels`)
}

// View live stream
const viewLive = (device: Device) => {
  // Navigate to live view page for this device
  router.push(`/live-preview/${device.device_id}`)
}

// Query device catalog
const queryCatalog = async (device: Device) => {
  try {
    await gb28181Api.queryDeviceCatalog(device.device_id)
    ElMessage.success('目录查询命令已发送')
  } catch (error: any) {
    console.error('Failed to query catalog:', error)
    ElMessage.error(error.message || '发送目录查询命令失败')
  }
}

// Sync channels for device
const syncChannels = async (device: Device) => {
  // Temporarily update the UI to show loading state
  device.syncing = true
  
  try {
    // Usually this is done by querying catalog
    await gb28181Api.queryDeviceCatalog(device.device_id)
    ElMessage.success('同步通道命令已发送')
  } catch (error: any) {
    console.error('Failed to sync channels:', error)
    ElMessage.error(error.message || '同步通道失败')
  } finally {
    // Reset the loading state
    device.syncing = false
  }
}

// Delete device
const deleteDevice = async (device: Device) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除设备 "${device.device_name}" 吗？删除后将无法恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await gb28181Api.deleteDevice(device.device_id)
    ElMessage.success('设备删除成功')
    // Refresh the list after deletion
    getDeviceList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete device:', error)
      ElMessage.error(error.message || '删除设备失败')
    }
  }
}

// Initialize data
onMounted(() => {
  getDeviceList()
})
</script>

<style scoped>
.device-list-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.header {
  margin-bottom: 20px;
}

.search-filters {
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
</style>