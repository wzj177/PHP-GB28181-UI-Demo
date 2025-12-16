<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ElMenu,
  ElMenuItem,
  ElSubMenu,
  ElMenuItemGroup,
  ElIcon,
  ElAvatar,
  ElDropdown,
  ElDropdownMenu,
  ElDropdownItem,
  ElMessage,
  ElMessageBox
} from 'element-plus'
import {
  Monitor,
  VideoCamera,
  Bell,
  MapLocation,
  House,
  Fold,
  Expand,
  ArrowDown,
  User,
  Setting,
  SwitchButton
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// Navigation items
const navItems = [
  {
    index: 'ptz-control',
    title: '云台控制',
    icon: Monitor,
    path: '/ptz-control'
  },
  {
    index: 'video-list',
    title: '录像回放',
    icon: VideoCamera,
    path: '/video-list'
  },
  {
    index: 'alarms',
    title: '报警管理',
    icon: Bell,
    path: '/alarms'
  },
  {
    index: 'map',
    title: '电子地图',
    icon: MapLocation,
    path: '/map'
  }
]

// Active menu index
const activeIndex = ref(route.name?.toString() || 'ptz-control')

// Sidebar collapsed state
const sidebarCollapsed = ref(false)

// Handle menu select
const handleSelect = (index: string) => {
  const navItem = navItems.find(item => item.index === index)
  if (navItem) {
    router.push(navItem.path)
    activeIndex.value = index
  }
}

// User profile data
const userName = ref('管理员')
const userRole = ref('系统管理员')
const userAvatar = ref('https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png') // Default avatar
const userDropdownVisible = ref(false)
const isDynamicPositioned = ref(false)

// Ref for dropdown element
const dropdownRef = ref<HTMLElement>()

// Toggle sidebar collapse
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// Toggle user dropdown
const toggleUserDropdown = (event: Event) => {
  event.stopPropagation(); // Prevent event bubbling
  userDropdownVisible.value = !userDropdownVisible.value

  // Update dynamic positioning flag
  isDynamicPositioned.value = sidebarCollapsed.value && userDropdownVisible.value;

  // If sidebar is collapsed, we need to adjust the dropdown positioning after it renders
  if (userDropdownVisible.value && sidebarCollapsed.value) {
    // Position the dropdown to the right of the collapsed sidebar
    setTimeout(() => {
      const dropdown = document.querySelector('.user-dropdown') as HTMLElement;
      const sidebar = document.querySelector('.sidebar') as HTMLElement;

      if (dropdown && sidebar) {
        const rect = sidebar.getBoundingClientRect();
        dropdown.style.left = `${rect.right + 10}px`;
        // Position at the same vertical level as the user profile, which is near the bottom
        // Account for the height of the dropdown
        const dropdownHeight = dropdown.offsetHeight;
        dropdown.style.top = `${rect.bottom - 50}px`; // Approximate position of the user profile
        dropdown.style.position = 'fixed';
        dropdown.style.bottom = 'auto'; // Disable bottom positioning
      }
    }, 10); // Slightly delay to ensure element is rendered
  }
}

// Close dropdown when clicking anywhere else
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.user-profile') && !target.closest('.user-dropdown')) {
    userDropdownVisible.value = false;
  }
}

// Add event listener when component mounts and remove when unmounts
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
})

// Handle user commands
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      // Navigate to profile page
      router.push('/profile')
      break
    case 'settings':
      // Navigate to settings page
      router.push('/settings')
      break
    case 'logout':
      // Handle logout
      handleLogout()
      break
  }
  userDropdownVisible.value = false
}

// Handle logout
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // Clear authentication data (e.g., token)
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      // Show logout message
      ElMessage.success('已退出登录')

      // Redirect to login page
      router.push('/login')
    })
    .catch(() => { })
}
</script>

<template>
  <div class="layout-container">
    <!-- Sidebar Navigation -->
    <div class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="logo">
        <h2 v-show="!sidebarCollapsed">PHP-GB28181</h2>
        <h2 v-show="sidebarCollapsed">G</h2>
      </div>

      <div>
        <ElMenu :default-active="activeIndex" class="nav-menu" @select="handleSelect" router :unique-opened="true">
          <ElMenuItem v-for="item in navItems" :key="item.index" :index="item.index">
            <ElIcon>
              <component :is="item.icon" />
            </ElIcon>
            <span>{{ item.title }}</span>
          </ElMenuItem>
        </ElMenu>
      </div>

      <!-- Container for user profile and collapse button to push to bottom -->
      <div class="sidebar-footer">
        <!-- User profile section -->
        <el-dropdown placement="bottom-end" trigger="click" class="user-dropdown">
          <div class="user-profile">
            <div class="user-avatar">
              <ElAvatar :size="32" :src="userAvatar" />
            </div>
            <div class="user-info" v-show="!sidebarCollapsed">
              <div class="user-name">{{ userName }}</div>
              <div class="user-role">{{ userRole }}</div>
            </div>
            <ElIcon class="dropdown-icon" v-show="!sidebarCollapsed">
              <ArrowDown />
            </ElIcon>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="dropdown-menu">
              <el-dropdown-item>
                <div class="dropdown-item" @click="handleUserCommand('profile')">
                  <ElIcon>
                    <User />
                  </ElIcon>
                  <span>个人资料</span>
                </div>
              </el-dropdown-item>
              <el-dropdown-item>
                <div class="dropdown-item" @click="handleUserCommand('settings')">
                  <ElIcon>
                    <Setting />
                  </ElIcon>
                  <span>设置</span>
                </div>
              </el-dropdown-item>
              <el-divider />
              <el-dropdown-item>
                <div class="dropdown-item" @click="handleUserCommand('logout')">
                  <ElIcon>
                    <SwitchButton />
                  </ElIcon>
                  <span>退出登录</span>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

      </div> <!-- sidebar-footer -->
      <!-- Collapse/expand button -->
      <div class="collapse-btn" @click="toggleSidebar">
        <component :is="sidebarCollapsed ? Expand : Fold" :size="16" />
      </div>
    </div> <!-- sidebar -->

    <!-- Main Content Area -->
    <div class="main-content" :class="{ 'main-content-expanded': sidebarCollapsed }">
      <div class="content-wrapper">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.layout-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background-color: $bg-main;
}

.sidebar {
  width: 240px;
  background: $bg-panel;
  color: $text-main;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid $border-base;
  transition: all 0.3s ease;
  position: relative;
  height: 100vh;
}

.sidebar.collapsed {
  width: 44px;
}

.sidebar.collapsed .nav-menu {
  overflow: hidden !important;
}

.sidebar.collapsed .nav-menu .el-menu-item {
  padding-left: 10px !important;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-active;
  border-bottom: 1px solid $border-base;
  color: $text-main;
  transition: all 0.3s ease;
}

.logo h2 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
  color: $text-main;
  transition: all 0.3s ease;
}

.nav-menu {
  flex: 1;
  overflow: auto;
  border-right: none;
  background-color: $bg-panel;
}

.nav-menu :deep(.el-menu-item),
.nav-menu :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: $text-muted;
  background-color: $bg-panel;
  border-left: 3px solid transparent;
}

.nav-menu :deep(.el-menu-item):hover,
.nav-menu :deep(.el-sub-menu__title):hover {
  background-color: $bg-hover;
  border-left: 3px solid $primary;
}

.nav-menu :deep(.el-menu-item.is-active),
.nav-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  background-color: $bg-hover;
  color: $text-main;
  border-left: 3px solid $primary;
}

.collapse-btn {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 20;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 25%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.collapse-btn svg {
  color: #333;
}

/* Sidebar Footer */
.sidebar-footer {
  margin-top: auto;
  width: 100%;
  position: relative;
  padding-bottom: 10px;
}

/* User profile section */
.user-profile {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-top: 1px solid $border-base;
  transition: background-color 0.3s;
}

.sidebar.collapsed .user-profile {
  padding: 12px 0 0 4px;
}

.user-profile:hover {
  background-color: $bg-hover;
}

.user-avatar {
  margin-right: 12px;
}

.user-info {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: $text-main;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: $text-muted;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-icon {
  color: $text-muted;
}

.user-dropdown {
  display: block;
  width: 100%;
}

.dropdown-menu {
  background: $bg-panel;
  border: 1px solid $border-base;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  :deep(.el-dropdown-menu__item) {
    line-height: 12px;
    &:hover {
      background-color: $bg-hover;
    }
    &:focus {
      background-color: $bg-hover;
    }
  }
  :deep(.el-divider) {
    margin: 4px 0;
  }
}

.dropdown-item {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: $text-main;
  transition: background-color 0.2s;
}


.dropdown-divider {
  height: 1px;
  background: $border-base;
  margin: 4px 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: $bg-main;
  transition: all 0.3s ease;
}

.content-wrapper {
  flex: 1;
  overflow: auto;
  padding: 0;
}
</style>