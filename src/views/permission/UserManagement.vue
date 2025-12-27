<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElTable, ElTableColumn, ElTag, ElButton, ElInput, ElSelect, ElOption, ElDialog, ElForm, ElFormItem, ElSwitch, ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { permissionApi } from '@/api/permissionApi'

interface User {
  id: number
  username: string
  email?: string
  phone?: string
  realName?: string
  roleId: number
  roleName?: string
  status: 'active' | 'disabled'
  lastLoginAt?: string
  lastLoginIp?: string
  createdAt: string
}

interface Role {
  id: number
  name: string
}

const loading = ref(false)
const users = ref<User[]>([])
const roles = ref<Role[]>([])
const total = ref(0)

const dialogVisible = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const userFormRef = ref()

// Filters
const filters = ref({
  keyword: '',
  status: '',
  roleId: '',
  page: 1,
  limit: 20
})

// User form
const userForm = ref({
  id: 0,
  username: '',
  password: '',
  email: '',
  phone: '',
  realName: '',
  roleId: null as number | null,
  status: 'active' as 'active' | 'disabled'
})

const formRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// Load users
const loadUsers = async () => {
  loading.value = true
  try {
    const params: any = {
      page: filters.value.page,
      limit: filters.value.limit
    }

    if (filters.value.keyword) params.keyword = filters.value.keyword
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.roleId) params.role_id = filters.value.roleId

    const response = await permissionApi.getUsers(params)

    if (response?.list) {
      users.value = response.list || []
      total.value = response.paginator?.total || 0
    }
  } catch (error: any) {
    console.error('Failed to load users:', error)
    ElMessage.error(error.message || '加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// Load roles
const loadRoles = async () => {
  try {
    const response = await permissionApi.getRoles({ page: 1, limit: 100 })
    if (response?.list) {
      roles.value = response.list || []
    }
  } catch (error: any) {
    console.error('Failed to load roles:', error)
  }
}

// Search
const searchUsers = () => {
  filters.value.page = 1
  loadUsers()
}

// Reset filters
const resetFilters = () => {
  filters.value = {
    keyword: '',
    status: '',
    roleId: '',
    page: 1,
    limit: 20
  }
  loadUsers()
}

// Open create dialog
const openCreateDialog = () => {
  dialogMode.value = 'create'
  userForm.value = {
    id: 0,
    username: '',
    password: '',
    email: '',
    phone: '',
    realName: '',
    roleId: null,
    status: 'active'
  }
  dialogVisible.value = true
}

// Open edit dialog
const openEditDialog = (user: User) => {
  dialogMode.value = 'edit'
  userForm.value = {
    id: user.id,
    username: user.username,
    password: '',
    email: user.email || '',
    phone: user.phone || '',
    realName: user.realName || '',
    roleId: user.roleId,
    status: user.status
  }
  dialogVisible.value = true
}

// Submit form
const submitForm = async () => {
  await userFormRef.value?.validate()

  const data: any = {
    username: userForm.value.username,
    email: userForm.value.email,
    phone: userForm.value.phone,
    real_name: userForm.value.realName,
    role_id: userForm.value.roleId,
    status: userForm.value.status
  }

  if (dialogMode.value === 'create') {
    data.password = userForm.value.password
  } else if (userForm.value.password) {
    data.password = userForm.value.password
  }

  try {
    if (dialogMode.value === 'create') {
      await permissionApi.createUser(data)
      ElMessage.success('创建成功')
    } else {
      await permissionApi.updateUser(userForm.value.id, data)
      ElMessage.success('更新成功')
    }

    dialogVisible.value = false
    loadUsers()
  } catch (error: any) {
    console.error('Failed to save user:', error)
    ElMessage.error(error.message || '保存失败')
  }
}

// Delete user
const deleteUser = async (user: User) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${user.username}" 吗？`, '确认删除', {
      type: 'warning'
    })

    await permissionApi.deleteUser(user.id)
    ElMessage.success('删除成功')
    loadUsers()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Failed to delete user:', error)
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// Toggle status
const toggleStatus = async (user: User) => {
  try {
    const newStatus = user.status === 'active' ? 'disabled' : 'active'
    await permissionApi.updateUser(user.id, { status: newStatus })
    user.status = newStatus
    ElMessage.success('状态已更新')
  } catch (error: any) {
    console.error('Failed to update status:', error)
    ElMessage.error(error.message || '更新失败')
  }
}

// Pagination
const handlePageChange = (page: number) => {
  filters.value.page = page
  loadUsers()
}

const handleSizeChange = (size: number) => {
  filters.value.limit = size
  filters.value.page = 1
  loadUsers()
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}

onMounted(() => {
  loadUsers()
  loadRoles()
})
</script>

<template>
  <div class="user-management-container">
    <div class="page-header">
      <h2>用户管理</h2>
      <div class="header-actions">
        <el-button :icon="Refresh" @click="loadUsers">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="openCreateDialog">新建用户</el-button>
      </div>
    </div>

    <div class="stats-content">
      <ElCard class="stats-card full-width">
        <!-- Filters -->
        <div class="filter-bar">
          <el-input v-model="filters.keyword" placeholder="搜索用户名/邮箱/手机号" style="width: 250px" clearable />

          <el-select v-model="filters.status" placeholder="状态" style="width: 120px" clearable>
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>

          <el-select v-model="filters.roleId" placeholder="角色" style="width: 150px" clearable>
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>

          <el-button type="primary" @click="searchUsers">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </div>

        <!-- Table -->
        <ElTable
          v-loading="loading"
          :data="users"
          style="width: 100%"
          stripe
        >
          <ElTableColumn prop="id" label="ID" width="80" />

          <ElTableColumn prop="username" label="用户名" width="120" />

          <ElTableColumn prop="realName" label="真实姓名" width="120">
            <template #default="{ row }">
              {{ row.realName || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="email" label="邮箱" min-width="180">
            <template #default="{ row }">
              {{ row.email || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="phone" label="手机号" width="130">
            <template #default="{ row }">
              {{ row.phone || '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn prop="roleName" label="角色" width="120" />

          <ElTableColumn prop="status" label="状态" width="80">
            <template #default="{ row }">
              <ElTag :type="row.status === 'active' ? 'success' : 'danger'" size="small">
                {{ row.status === 'active' ? '启用' : '禁用' }}
              </ElTag>
            </template>
          </ElTableColumn>

          <ElTableColumn prop="lastLoginAt" label="最后登录" width="170">
            <template #default="{ row }">
              {{ row.lastLoginAt ? formatDate(row.lastLoginAt) : '-' }}
            </template>
          </ElTableColumn>

          <ElTableColumn label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
              <el-button size="small" @click="toggleStatus(row)">
                {{ row.status === 'active' ? '禁用' : '启用' }}
              </el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="deleteUser(row)">删除</el-button>
            </template>
          </ElTableColumn>
        </ElTable>

        <!-- Pagination -->
        <div class="pagination">
          <el-pagination
            :current-page="filters.page"
            :page-size="filters.limit"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </ElCard>
    </div>

    <!-- Dialog -->
    <ElDialog
      v-model="dialogVisible"
      :title="dialogMode === 'create' ? '新建用户' : '编辑用户'"
      width="600px"
    >
      <ElForm
        ref="userFormRef"
        :model="userForm"
        :rules="formRules"
        label-width="100px"
      >
        <ElFormItem label="用户名" prop="username">
          <ElInput v-model="userForm.username" :disabled="dialogMode === 'edit'" />
        </ElFormItem>

        <ElFormItem label="密码" :prop="dialogMode === 'create' ? 'password' : ''">
          <ElInput v-model="userForm.password" type="password" show-password :placeholder="dialogMode === 'edit' ? '留空则不修改' : ''" />
        </ElFormItem>

        <ElFormItem label="邮箱" prop="email">
          <ElInput v-model="userForm.email" />
        </ElFormItem>

        <ElFormItem label="手机号">
          <ElInput v-model="userForm.phone" />
        </ElFormItem>

        <ElFormItem label="真实姓名">
          <ElInput v-model="userForm.realName" />
        </ElFormItem>

        <ElFormItem label="角色" prop="roleId">
          <ElSelect v-model="userForm.roleId" style="width: 100%">
            <ElOption v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem label="状态">
          <ElSwitch v-model="userForm.status" active-value="active" inactive-value="disabled" active-text="启用" inactive-text="禁用" />
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

.user-management-container {
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

  .filter-bar {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
