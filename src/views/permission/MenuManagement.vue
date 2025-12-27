<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElInput, ElSelect, ElOption, ElDialog, ElForm, ElFormItem, ElSwitch, ElMessage, ElTree } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { permissionApi } from '@/api/permissionApi'

interface MenuItem {
  id: string
  name: string
  icon?: string
  path: string
  component?: string
  title: string
  parentId: number | string
  sort: number
  type: 'menu' | 'directory' | 'path' | 'api'
  children?: MenuItem[]
}

const loading = ref(false)
const menus = ref<MenuItem[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const menuFormRef = ref()

// Menu form
const menuForm = ref({
  id: '',
  name: '',
  icon: '',
  path: '',
  component: '',
  title: '',
  parentId: 0,
  sort: 0,
  type: 'menu' as 'menu' | 'directory' | 'path' | 'api'
})

const typeOptions = [
  { label: '菜单', value: 'menu' },
  { label: '目录', value: 'directory' },
  { label: '路径', value: 'path' },
  { label: 'API', value: 'api' }
]

const iconOptions = [
  'House', 'Monitor', 'VideoCamera', 'Bell', 'MapLocation',
  'DataAnalysis', 'VideoPlay', 'Film', 'User', 'Setting'
]

// Load menus
const loadMenus = async () => {
  loading.value = true
  try {
    const response = await permissionApi.getMenus()
    if (response?.data) {
      menus.value = response.data || []
    }
  } catch (error: any) {
    console.error('Failed to load menus:', error)
    ElMessage.error(error.message || '加载菜单失败')
  } finally {
    loading.value = false
  }
}

// Open create dialog
const openCreateDialog = (parentId: number = 0) => {
  dialogMode.value = 'create'
  menuForm.value = {
    id: '',
    name: '',
    icon: '',
    path: '',
    component: '',
    title: '',
    parentId,
    sort: 0,
    type: 'menu'
  }
  dialogVisible.value = true
}

// Open edit dialog
const openEditDialog = (menu: MenuItem) => {
  dialogMode.value = 'edit'
  menuForm.value = { ...menu }
  dialogVisible.value = true
}

// Submit form
const submitForm = async () => {
  try {
    const data = {
      name: menuForm.value.name,
      icon: menuForm.value.icon,
      path: menuForm.value.path,
      component: menuForm.value.component,
      title: menuForm.value.title,
      parent_id: menuForm.value.parentId,
      sort: menuForm.value.sort,
      type: menuForm.value.type
    }

    if (dialogMode.value === 'create') {
      await permissionApi.createMenu(data)
      ElMessage.success('创建成功')
    } else {
      await permissionApi.updateMenu(menuForm.value.id, data)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    loadMenus()
  } catch (error: any) {
    console.error('Failed to save menu:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

// Delete menu
const deleteMenu = async (menu: MenuItem) => {
  try {
    await ElMessageBox.confirm(`确定要删除菜单 "${menu.title}" 吗？`, '确认删除', {
      type: 'warning'
    })

    await permissionApi.deleteMenu(menu.id)
    ElMessage.success('删除成功')
    loadMenus()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete menu:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// Get type tag
const getTypeTag = (type: string) => {
  const map: Record<string, { type: string; label: string }> = {
    'menu': { type: 'primary', label: '菜单' },
    'directory': { type: 'success', label: '目录' },
    'path': { type: 'info', label: '路径' },
    'api': { type: 'warning', label: 'API' }
  }
  return map[type] || { type: 'info', label: type }
}

onMounted(() => {
  loadMenus()
})
</script>

<template>
  <div class="menu-management-container">
    <div class="page-header">
      <h2>菜单管理</h2>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="loadMenus">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog()">新建菜单</el-button>
      </div>
    </div>

    <div class="stats-content">
      <ElCard class="stats-card full-width">
        <ElTable
          v-loading="loading"
          :data="menus"
          style="width: 100%"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          stripe
        >
          <ElTableColumn prop="title" label="菜单名称" min-width="200" />

          <ElTableColumn prop="icon" label="图标" width="100">
            <template #default="{ row }">
              {{ row.icon || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="path" label="路径" min-width="180" />

          <ElTableColumn prop="component" label="组件" width="150">
            <template #default="{ row }">
              {{ row.component || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="type" label="类型" width="80">
            <template #default="{ row }">
              <ElTag :type="getTypeTag(row.type).type" size="small">
                {{ getTypeTag(row.type).label }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="sort" label="排序" width="80" />

          <ElTableColumn label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button size="small" :icon="Plus" @click="openCreateDialog(row.id)">添加子菜单</el-button>
              <el-button size="small" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="deleteMenu(row)">删除</el-button>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>

    <!-- Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建菜单' : '编辑菜单'"
      width="600px"
    >
      <ElForm
        ref="menuFormRef"
        :model="menuForm"
        label-width="100px"
      >
        <ElFormItem label="类型" required>
          <ElSelect v-model="menuForm.type" style="width: 100%">
            <ElOption v-for="opt in typeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="菜单名称" required>
          <ElInput v-model="menuForm.title" />
        </ElFormItem>

        <ElFormItem label="名称" required>
          <ElInput v-model="menuForm.name" placeholder="唯一标识" />
        </ElFormItem>

        <ElFormItem label="路径" required>
          <ElInput v-model="menuForm.path" placeholder="/path" />
        </ElFormItem>

        <ElFormItem label="组件">
          <ElInput v-model="menuForm.component" placeholder="ComponentName" />
        </ElFormItem>

        <ElFormItem label="图标">
          <ElSelect v-model="menuForm.icon" style="width: 100%" clearable>
            <ElOption v-for="icon in iconOptions" :key="icon" :label="icon" :value="icon" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="排序">
          <ElInputNumber v-model="menuForm.sort" :min="0" />
        </ElFormItem>

        <ElFormItem label="父级ID">
          <ElInputNumber v-model="menuForm.parentId" :min="0" />
        </ElFormItem>
      </ElForm>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </ElDialog>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.menu-management-container {
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
    grid-template-columns: 1fr;
    gap: 16px;

    .stats-card {
      background: var(--bg-panel);
      border: 1px solid var(--border-base);
      border-radius: $radius-panel;

      &.full-width {
        grid-column: 1 / -1;
      }

      :deep(.el-card__body) {
        padding: 16px;
      }
    }
  }
}
</style>
