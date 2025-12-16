<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const modules = [
  { 
    title: '云台控制', 
    description: '设备控制、云台操作、预置位管理', 
    icon: '🔍',
    path: '/ptz-control'
  },
  { 
    title: '录像回放', 
    description: '视频检索、时间轴播放、录像下载', 
    icon: '📼',
    path: '/video-playback'
  },
  { 
    title: '报警管理', 
    description: '报警列表、通知处理、状态变更', 
    icon: '🚨',
    path: '/alarms'
  },
  { 
    title: '电子地图', 
    description: '设备定位、在线状态、地图播放', 
    icon: '🗺️',
    path: '/map'
  }
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div class="home">
    <h1 class="title">PHP-GB28181</h1>
    <p class="subtitle">安防监控系统演示平台</p>
    
    <div class="modules-grid">
      <div 
        v-for="module in modules" 
        :key="module.path"
        class="module-card"
        @click="() => navigateTo(module.path)"
      >
        <div class="icon">{{ module.icon }}</div>
        <h3>{{ module.title }}</h3>
        <p>{{ module.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 2.5rem;
  text-align: center;
  margin-bottom: 1rem;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.2rem;
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.module-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 1px solid #eee;
}

.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
  text-align: center;
}

p {
  color: #666;
  text-align: center;
  line-height: 1.6;
}
</style>