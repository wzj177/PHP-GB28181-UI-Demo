<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElInput, ElButton, ElCard, ElMessage, ElContainer, ElHeader, ElMain } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)

// Mock login function
const handleLogin = async () => {
  if (!username.value || !password.value) {
    ElMessage.error('请输入用户名和密码')
    return
  }

  loading.value = true
  
  try {
    // Mock API call to get token
    // In a real app, this would call the real API
    const mockLoginApi = (user: string, pass: string) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simple validation - in real app, this would be server-side
          if (user === 'admin' && pass === '123456') {
            resolve({
              token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              expiresIn: 3600 // 1 hour
            })
          } else {
            reject(new Error('Invalid credentials'))
          }
        }, 800) // Simulate network delay
      })
    }
    
    const response: any = await mockLoginApi(username.value, password.value)
    
    // Store token in cookie
    document.cookie = `token=${response.token}; path=/; max-age=${response.expiresIn}`
    
    // Show success message
    ElMessage.success('登录成功')
    
    // Redirect to dashboard
    router.push('/ptz-control')
  } catch (error) {
    console.error('Login failed:', error)
    ElMessage.error('用户名或密码错误')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <!-- Animated background elements -->
    <div class="background-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="square square-1"></div>
      <div class="triangle triangle-1"></div>
    </div>

    <!-- Login card -->
    <div class="login-card">
      <ElCard class="card">
        <template #header>
          <div class="card-header">
            <div class="logo">
              <div class="logo-inner">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L2 12L5 12L5 18L19 18L19 12L22 12L12 3Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="14" r="2" fill="white"/>
                </svg>
              </div>
            </div>
            <div class="platform-info">
              <h1>PHP-GB28181</h1>
              <h2>视频平台</h2>
            </div>
          </div>
        </template>
        
        <div class="login-form">
          <div class="input-group">
            <ElInput
              v-model="username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              size="large"
              autocomplete="off"
              @keyup.enter="handleLogin"
            />
          </div>
          
          <div class="input-group">
            <ElInput
              v-model="password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
              show-password
              autocomplete="current-password"
              @keyup.enter="handleLogin"
            />
          </div>
          
          <ElButton
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%; margin-top: 10px;"
          >
            登录
          </ElButton>
          
          <div class="footer-text">
            <p>欢迎使用我们的视频监控平台</p>
          </div>
        </div>
      </ElCard>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, $bg-main 0%, $bg-panel 100%);
  position: relative;
  overflow: hidden;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* Animated background elements */
.background-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  animation-duration: 15s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-direction: alternate;
}

.circle-1 {
  width: 150px;
  height: 150px;
  top: 10%;
  left: 10%;
  animation: float1;
}

.circle-2 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  right: 10%;
  animation: float2;
}

.circle-3 {
  width: 80px;
  height: 80px;
  top: 40%;
  right: 20%;
  animation: float3;
}

.square {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: rgba($primary, 0.15);
  animation: rotate 20s linear infinite;
  top: 60%;
  left: 20%;
  animation-duration: 25s;
}

.triangle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-bottom: 40px solid rgba($primary, 0.15);
  animation: bounce 10s ease-in-out infinite;
  top: 30%;
  right: 30%;
}

@keyframes float1 {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(20px, 20px) rotate(180deg); }
  100% { transform: translate(0, 0) rotate(360deg); }
}

@keyframes float2 {
  0% { transform: translate(0, 0); }
  50% { transform: translate(-20px, -20px); }
  100% { transform: translate(0, 0); }
}

@keyframes float3 {
  0% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(-10px, 15px) rotate(90deg); }
  100% { transform: translate(0, 0) rotate(180deg); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-30px); }
}

.login-card {
  width: 400px;
  z-index: 10;
  backdrop-filter: blur(10px);
  animation: slideIn 0.6s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid $border-base;
  background: rgba($bg-panel, 0.9);
}

.card :deep(.el-card__header) {
  background: linear-gradient(135deg, $primary 0%, $primary-hover 100%);
  text-align: center;
  padding: 30px 20px 20px;
  position: relative;
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  margin-bottom: 15px;
}

.logo-inner {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba($primary, 0.15);
  border: 2px solid rgba($primary, 0.3);
  transition: all 0.3s ease;
}

.logo-inner:hover {
  transform: scale(1.1);
  background: rgba($primary, 0.25);
}

.platform-info h1 {
  margin: 0;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.platform-info h2 {
  margin: 5px 0 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2rem;
  font-weight: 400;
  letter-spacing: 1px;
}

.login-form {
  padding: 30px;
}

.input-group {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 12px;
  border: 1px solid $border-base !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background-color: $bg-panel !important;
  color: $text-main;
}

:deep(.el-input__inner:focus) {
  border-color: $primary;
  box-shadow: 0 0 0 3px rgba($primary, 0.1);
}

:deep(.el-button) {
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, $primary 0%, $primary-hover 100%);
  border: none;
}

:deep(.el-button):hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba($primary, 0.3);
}

:deep(.el-button):active {
  transform: translateY(0);
}

:deep(.el-button:disabled) {
  opacity: 0.6;
  transform: none;
}

.footer-text {
  text-align: center;
  margin-top: 20px;
  color: $text-muted;
  font-size: 0.9rem;
}

.footer-text p {
  margin: 0;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-card {
    width: calc(100% - 40px);
    margin: 0 20px;
  }
  
  .card :deep(.el-card__header) {
    padding: 20px 15px 15px;
  }
  
  .platform-info h1 {
    font-size: 1.5rem;
  }
  
  .platform-info h2 {
    font-size: 1rem;
  }
  
  .login-form {
    padding: 20px;
  }
}
</style>