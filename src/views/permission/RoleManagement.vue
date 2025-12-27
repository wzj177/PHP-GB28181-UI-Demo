<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElInput, ElDialog, ElForm, ElFormItem, ElSwitch, ElMessage, ElTree, ElCheckbox, ElCheckboxGroup } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { permissionApi } from '@/api/permissionApi'

interface Role {
  id: number
  name: string
  code: string
  description?: string
  status: 'active' | 'disabled'
  menuIds?: number[]
  createdAt: string
}

interface Menu {
  id: number
  title: string
  children?: Menu[]
}

const loading = ref(false)
const roles = ref<Role[]>([])
const allMenus = ref<Menu[]>([])
const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const roleFormRef = ref()
const menuTreeRef = ref()

// Role form
const roleForm = ref({
  id: 0,
  name: '',
  code: '',
  description: '',
  status: 'active' as 'active' | 'disabled',
  menuIds: [] as number[]
})

// Load roles
const loadRoles = async () => {
  loading.value = true
  try {
    const response = await permissionApi.getRoles({ page: 1, limit: 100 })
    if (response?.list) {
      roles.value = response.list || []
    }
  } catch (error: any) {
    console.error('Failed to load roles:', error)
    ElMessage.error(error.message || '加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// Load all menus
const loadMenus = async () => {
  try {
    const response = await permissionApi.getMenus()
    if (response?.data) {
      allMenus.value = response.data || []
    }
  } catch (error: any) {
    console.error('Failed to load menus:', error)
  }
}

// Open create dialog
const openCreateDialog = () => {
  dialogMode.value = 'create'
  roleForm.value = {
    id: 0,
    name: '',
    code: '',
    description: '',
    status: 'active',
    menuIds: []
  }
  dialogVisible.value = true
}

// Open edit dialog
const openEditDialog = async (role: Role) => {
  dialogMode.value = 'edit'
  roleForm.value = {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description || '',
    status: role.status,
    menuIds: role.menuIds || []
  }
  dialogVisible.value = true

  // Load role menu permissions
  try {
    const response = await permissionApi.getRoleMenus(role.id)
    if (response?.data) {
      roleForm.value.menuIds = response.data || []
    }
  } catch (error) {
    console.error('Failed to load role menus:', error)
  }
}

// Submit form
const submitForm = async () => {
  try {
    const data = {
      name: roleForm.value.name,
      code: roleForm.value.code,
      description: roleForm.value.description,
      status: roleForm.value.status,
      menu_ids: roleForm.value.menuIds
    }

    if (dialogMode.value === 'create') {
      await permissionApi.createRole(data)
      ElMessage.success('创建成功')
    } else {
      await permissionApi.updateRole(roleForm.value.id, data)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    loadRoles()
  } catch (error: any) {
    console.error('Failed to save role:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

// Delete role
const deleteRole = async (role: Role) => {
  try {
    await ElMessageBox.confirm(`确定要删除角色 "${role.name}" 吗？`, '确认删除', {
      type: 'warning'
    })

    await permissionApi.deleteRole(role.id)
    ElMessage.success('删除成功')
    loadRoles()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete role:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadRoles()
  loadMenus()
})
</script>

<template>
  <div class="role-management-container">
    <div class="page-header">
      <h2>角色管理</h2>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="loadRoles">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建角色</el-button>
      </div>
    </div>

    <div class="stats-content">
      <ElCard class="stats-card full-width">
        <ElTable
          v-loading="loading"
          :data="roles"
          style="width: 100%"
          stripe
        >
          <ElTableColumn prop="id" label="ID" width="80" />

          <ElTableColumn prop="name" label="角色名称" width="150" />

          <ElTableColumn prop="code" label="角色代码" width="150" />

          <ElTableColumn prop="description" label="描述" min-width="200">
            <template #default="{ row }">
              {{ row.description || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="status" label="状态" width="80">
            <template #default="{ row }">
              <ElTag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="createdAt" label="创建时间" width="170">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button size="small" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="deleteRole(row)">删除</el-button>
            </template>
          </ElTableColumn>
        </ElTable>
      </ElCard>
    </div>

    <!-- Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建角色' : '编辑角色'"
      width="700px"
    >
      <ElForm
        ref="roleFormRef"
        :model="roleForm"
        label-width="100px"
      >
        <ElFormItem label="角色名称" required>
          <ElInput v-model="roleForm.name" placeholder="请输入角色名称" />
        </ElFormItem>

        <ElFormItem label="角色代码" required>
          <ElInput v-model="roleForm.code" placeholder="ROLE_ADMIN" />
        </ElFormItem>

        <ElFormItem label="描述">
          <ElInput v-model="roleForm.description" type="textarea" :rows="2" />
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSwitch v-model="roleForm.status" active-value="active" inactive-value="disabled" active-text="启用" inactive-text="禁用" />
        </ElFormItem>

        <ElFormItem label="菜单权限">
          <ElTree
            ref="menuTreeRef"
            :data="allMenus"
            :props="{ label: 'title', children: 'children' }"
            node-key="id"
            show-checkbox
            default-expand-all
            :default-checked-keys="roleForm.menuIds"
            @check="(node, checked) => { roleForm.menuIds = checked.checkedKeys }"
          />
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

.role-management-container {
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
