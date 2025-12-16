<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  ElCard, 
  ElTable, 
  ElTableColumn, 
  ElButton, 
  ElTag, 
  ElSelect, 
  ElOption, 
  ElInput, 
  ElPagination,
  ElMessage,
  ElPopconfirm,
  ElDialog,
  ElForm,
  ElFormItem
} from 'element-plus'
import { Search, Bell, Check, CircleCheck, Close, Location } from '@element-plus/icons-vue'
import { deviceApi } from '@/api/deviceApi'

// Define alarm interface
interface Alarm {
  id: string
  deviceId: string
  deviceName: string
  channel: string
  type: 'motion' | 'tamper' | 'disconnect' | 'storage_full'
  status: 'active' | 'acknowledged' | 'cleared'
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

interface Pagination {
  page: number
  pageSize: number
  total: number
}

// State
const alarms = ref<Alarm[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
  page: 1,
  pageSize: 10,
  total: 0
})

// Filters
const filters = reactive({
  status: '',
  severity: '',
  type: '',
  keyword: ''
})

// Dialog state
const showAlarmDetail = ref(false)
const selectedAlarm = ref<Alarm | null>(null)

// Load alarms
const loadAlarms = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      status: filters.status || undefined,
      severity: filters.severity || undefined,
      type: filters.type || undefined,
      keyword: filters.keyword || undefined
    }
    
    const response = await deviceApi.getAlarms(params)
    alarms.value = response.data.list
    pagination.total = response.data.pagination.total
  } catch (error) {
    console.error('Failed to fetch alarms:', error)
    ElMessage.error('获取报警列表失败')
  } finally {
    loading.value = false
  }
}

// Update alarm status
const updateAlarmStatus = async (alarmId: string, status: string) => {
  try {
    await deviceApi.updateAlarmStatus(alarmId, status)
    ElMessage.success('报警状态更新成功')
    loadAlarms() // Refresh the list
  } catch (error) {
    console.error('Failed to update alarm status:', error)
    ElMessage.error('更新报警状态失败')
  }
}

// Handle pagination change
const handlePageChange = (page: number) => {
  pagination.page = page
  loadAlarms()
}

const handleSizeChange = (size: number) => {
  pagination.page = 1
  pagination.pageSize = size
  loadAlarms()
}

// Get alarm type label
const getAlarmTypeLabel = (type: string) => {
  switch (type) {
    case 'motion': return '移动侦测'
    case 'tamper': return '防拆报警'
    case 'disconnect': return '设备断线'
    case 'storage_full': return '存储满'
    default: return '未知类型'
  }
}

// Get alarm type tag type
const getAlarmTypeTagType = (type: string) => {
  switch (type) {
    case 'motion': return 'warning'
    case 'tamper': return 'danger'
    case 'disconnect': return 'info'
    case 'storage_full': return 'primary'
    default: return 'info'
  }
}

// Get alarm status label
const getAlarmStatusLabel = (status: string) => {
  switch (status) {
    case 'active': return '激活'
    case 'acknowledged': return '已确认'
    case 'cleared': return '已清除'
    default: return '未知'
  }
}

// Get alarm status tag type
const getAlarmStatusTagType = (status: string) => {
  switch (status) {
    case 'active': return 'danger'
    case 'acknowledged': return 'warning'
    case 'cleared': return 'success'
    default: return 'info'
  }
}

// Get severity label
const getSeverityLabel = (severity: string) => {
  switch (severity) {
    case 'low': return '低'
    case 'medium': return '中'
    case 'high': return '高'
    case 'critical': return '严重'
    default: return '未知'
  }
}

// Get severity tag type
const getSeverityTagType = (severity: string) => {
  switch (severity) {
    case 'low': return 'info'
    case 'medium': return 'warning'
    case 'high': return 'danger'
    case 'critical': return 'danger'
    default: return 'info'
  }
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

// Show alarm detail
const showAlarmDetails = (alarm: Alarm) => {
  selectedAlarm.value = alarm
  showAlarmDetail.value = true
}

// Close detail dialog
const closeDetailDialog = () => {
  showAlarmDetail.value = false
  selectedAlarm.value = null
}

// Search alarms
const searchAlarms = () => {
  pagination.page = 1
  loadAlarms()
}

// Initialize on component mounted
onMounted(() => {
  loadAlarms()
})
</script>

<template>
  <div class="alarm-management-page">
    <div class="header">
      <h2>
        <Bell class="header-icon" />
        报警与通知
      </h2>
    </div>

    <!-- Filter controls -->
    <ElCard class="filter-card">
      <div class="filter-controls">
        <ElInput
          v-model="filters.keyword"
          placeholder="设备名称/通道/描述"
          style="width: 250px; margin-right: 1rem;"
          clearable
        />
        
        <ElSelect
          v-model="filters.status"
          placeholder="报警状态"
          style="width: 150px; margin-right: 1rem;"
          clearable
        >
          <ElOption label="激活" value="active" />
          <ElOption label="已确认" value="acknowledged" />
          <ElOption label="已清除" value="cleared" />
        </ElSelect>
        
        <ElSelect
          v-model="filters.severity"
          placeholder="严重等级"
          style="width: 150px; margin-right: 1rem;"
          clearable
        >
          <ElOption label="低" value="low" />
          <ElOption label="中" value="medium" />
          <ElOption label="高" value="high" />
          <ElOption label="严重" value="critical" />
        </ElSelect>
        
        <ElSelect
          v-model="filters.type"
          placeholder="报警类型"
          style="width: 150px; margin-right: 1rem;"
          clearable
        >
          <ElOption label="移动侦测" value="motion" />
          <ElOption label="防拆报警" value="tamper" />
          <ElOption label="设备断线" value="disconnect" />
          <ElOption label="存储满" value="storage_full" />
        </ElSelect>
        
        <ElButton 
          type="primary" 
          @click="searchAlarms"
          :icon="Search"
        >
          查询
        </ElButton>
      </div>
    </ElCard>

    <!-- Alarms table -->
    <ElCard class="alarms-card">
      <template #header>
        <div class="card-header">
          <span>报警列表</span>
        </div>
      </template>
      
      <ElTable 
        :data="alarms" 
        v-loading="loading"
        style="width: 100%"
      >
        <ElTableColumn prop="deviceName" label="设备名称" width="150" />
        <ElTableColumn prop="channel" label="通道" width="100" />
        <ElTableColumn label="报警类型" width="120">
          <template #default="{ row }">
            <ElTag :type="getAlarmTypeTagType(row.type)">
              {{ getAlarmTypeLabel(row.type) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="严重等级" width="100">
          <template #default="{ row }">
            <ElTag :type="getSeverityTagType(row.severity)">
              {{ getSeverityLabel(row.severity) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" width="100">
          <template #default="{ row }">
            <ElTag :type="getAlarmStatusTagType(row.status)">
              {{ getAlarmStatusLabel(row.status) }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="description" label="描述" min-width="200" />
        <ElTableColumn prop="timestamp" label="时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.timestamp) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="320">
          <template #default="{ row }">
            <ElButton
              size="small"
              type="primary"
              plain
              @click="showAlarmDetails(row)"
            >
              详情
            </ElButton>
            <ElButton
              size="small"
              type="warning"
              :icon="Check"
              @click="updateAlarmStatus(row.id, 'acknowledged')"
              v-if="row.status === 'active'"
            >
              确认
            </ElButton>
            <ElButton
              size="small"
              type="success"
              :icon="CircleCheck"
              @click="updateAlarmStatus(row.id, 'cleared')"
              v-if="row.status === 'active' || row.status === 'acknowledged'"
            >
              清除
            </ElButton>
            <ElPopconfirm
              title="确定要删除这个报警吗？"
              @confirm="updateAlarmStatus(row.id, 'cleared')"
            >
              <template #reference>
                <ElButton
                  size="small"
                  type="danger"
                  :icon="Close"
                >
                  删除
                </ElButton>
              </template>
            </ElPopconfirm>
          </template>
        </ElTableColumn>
      </ElTable>
      
      <!-- Pagination -->
      <div class="pagination">
        <ElPagination
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          :current-page="pagination.page"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </ElCard>

    <!-- Alarm detail dialog -->
    <ElDialog
      v-model="showAlarmDetail"
      title="报警详情"
      width="600px"
      :before-close="closeDetailDialog"
    >
      <div v-if="selectedAlarm" class="alarm-detail">
        <div class="detail-row">
          <span class="label">设备名称:</span>
          <span class="value">{{ selectedAlarm.deviceName }}</span>
        </div>
        <div class="detail-row">
          <span class="label">通道:</span>
          <span class="value">{{ selectedAlarm.channel }}</span>
        </div>
        <div class="detail-row">
          <span class="label">报警类型:</span>
          <span class="value">
            <ElTag :type="getAlarmTypeTagType(selectedAlarm.type)">
              {{ getAlarmTypeLabel(selectedAlarm.type) }}
            </ElTag>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">严重等级:</span>
          <span class="value">
            <ElTag :type="getSeverityTagType(selectedAlarm.severity)">
              {{ getSeverityLabel(selectedAlarm.severity) }}
            </ElTag>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">状态:</span>
          <span class="value">
            <ElTag :type="getAlarmStatusTagType(selectedAlarm.status)">
              {{ getAlarmStatusLabel(selectedAlarm.status) }}
            </ElTag>
          </span>
        </div>
        <div class="detail-row">
          <span class="label">时间:</span>
          <span class="value">{{ formatDate(selectedAlarm.timestamp) }}</span>
        </div>
        <div class="detail-row full-width">
          <span class="label">描述:</span>
          <span class="value">{{ selectedAlarm.description }}</span>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="closeDetailDialog">关闭</ElButton>
          <ElButton 
            type="primary" 
            @click="updateAlarmStatus(selectedAlarm!.id, 'cleared')"
            v-if="selectedAlarm?.status !== 'cleared'"
          >
            清除报警
          </ElButton>
        </span>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped>
.alarm-management-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.header {
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.header-icon {
  color: #e6a23c;
  height: 1rem;
}

.filter-card {
  margin: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e6e6e6;
}

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.alarms-card {
  flex: 1;
  margin: 0 1rem 1rem 1rem;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #e6e6e6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem !important;
  font-weight: 600;
  color: #333;
}

:deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.pagination {
  margin-top: 1rem;
  text-align: right;
  padding: 1rem;
}

.alarm-detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
}

.detail-row.full-width {
  flex-direction: column;
}

.detail-row .label {
  font-weight: 600;
  width: 100px;
  flex-shrink: 0;
  color: #555;
}

.detail-row .value {
  flex: 1;
  color: #666;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>