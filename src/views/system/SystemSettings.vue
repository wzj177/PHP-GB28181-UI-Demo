<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElTabs, ElTabPane, ElForm, ElFormItem, ElInput, ElSwitch, ElInputNumber, ElButton, ElMessage, ElSelect, ElOption } from 'element-plus'
import { systemApi } from '@/api/systemApi'

const activeTab = ref('site')
const loading = ref(false)
const saving = ref(false)

// Site settings
const siteForm = ref({
  site_name: '',
  site_url: '',
  logo_url: '',
  favicon_url: '',
  copyright: '',
  language: 'zh-CN',
  timezone: 'Asia/Shanghai'
})

// Security settings
const securityForm = ref({
  enable_https: false,
  session_timeout: 30,
  max_login_attempts: 5,
  lockout_duration: 15,
  enable_captcha: false,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_lowercase: true,
  password_require_numbers: true,
  password_require_specialchars: true,
  enable_two_factor: false,
  allowed_ip_ranges: '',
  blocked_ip_ranges: ''
})

// Upload settings
const uploadForm = ref({
  max_file_size: 100,
  allowed_file_types: '.jpg,.jpeg,.png,.gif,.mp4,.avi,.mkv',
  upload_path: '/uploads',
  enable_auto_cleanup: false,
  cleanup_days: 30,
  max_concurrent_uploads: 5,
  enable_thumbnail: true,
  thumbnail_quality: 80
})

// Storage settings
const storageForm = ref({
  storage_type: 'local',
  local_path: '/data/storage',
  enable_s3: false,
  s3_bucket: '',
  s3_region: '',
  s3_access_key: '',
  s3_secret_key: '',
  s3_endpoint: '',
  enable_oss: false,
  oss_bucket: '',
  oss_region: '',
  oss_access_key: '',
  oss_secret_key: '',
  oss_endpoint: '',
  disk_warning_threshold: 80,
  disk_critical_threshold: 90
})

const languageOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' }
]

const storageTypeOptions = [
  { label: '本地存储', value: 'local' },
  { label: 'S3兼容', value: 's3' },
  { label: '阿里云OSS', value: 'oss' }
]

// Load settings
const loadSettings = async () => {
  loading.value = true
  try {
    const response = await systemApi.getSettings()

    if (response?.data) {
      const data = response.data
      siteForm.value = { ...siteForm.value, ...data.site }
      securityForm.value = { ...securityForm.value, ...data.security }
      uploadForm.value = { ...uploadForm.value, ...data.upload }
      storageForm.value = { ...storageForm.value, ...data.storage }
    }
  } catch (error: any) {
    console.error('Failed to load settings:', error)
    ElMessage.error(error.message || '加载设置失败')
  } finally {
    loading.value = false
  }
}

// Save settings
const saveSettings = async (type: string) => {
  saving.value = true
  try {
    const data: any = {}

    switch (type) {
      case 'site':
        data.site = siteForm.value
        break
      case 'security':
        data.security = securityForm.value
        break
      case 'upload':
        data.upload = uploadForm.value
        break
      case 'storage':
        data.storage = storageForm.value
        break
    }

    await systemApi.saveSettings(data)
    ElMessage.success('保存成功')
  } catch (error: any) {
    console.error('Failed to save settings:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// Reset to defaults
const resetDefaults = async (type: string) => {
  try {
    await systemApi.resetSettings(type)
    await loadSettings()
    ElMessage.success('已重置为默认值')
  } catch (error: any) {
    console.error('Failed to reset settings:', error)
    ElMessage.error(error.message || '重置失败')
  }
}

onMounted(() => {
  loadSettings()
})
</script>

<template>
  <div class="system-settings-container">
    <div class="page-header">
      <h2>系统设置</h2>
    </div>

    <div class="stats-content">
      <ElCard class="stats-card full-width">
        <ElTabs v-model="activeTab">
          <!-- 站点配置 -->
          <ElTabPane label="站点配置" name="site">
            <ElForm :model="siteForm" label-width="120px" style="max-width: 600px">
              <ElFormItem label="站点名称">
                <ElInput v-model="siteForm.site_name" placeholder="请输入站点名称" />
              </ElFormItem>

              <ElFormItem label="站点URL">
                <ElInput v-model="siteForm.site_url" placeholder="https://example.com" />
              </ElFormItem>

              <ElFormItem label="LOGO URL">
                <ElInput v-model="siteForm.logo_url" placeholder="/assets/logo.png" />
              </ElFormItem>

              <ElFormItem label="图标 URL">
                <ElInput v-model="siteForm.favicon_url" placeholder="/favicon.ico" />
              </ElFormItem>

              <ElFormItem label="版权信息">
                <ElInput v-model="siteForm.copyright" type="textarea" :rows="2" placeholder="© 2024 Your Company" />
              </ElFormItem>

              <ElFormItem label="语言">
                <ElSelect v-model="siteForm.language" style="width: 200px">
                  <ElOption v-for="opt in languageOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="时区">
                <ElInput v-model="siteForm.timezone" placeholder="Asia/Shanghai" />
              </ElFormItem>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveSettings('site')">保存</ElButton>
                <ElButton @click="resetDefaults('site')">重置</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- 安全设置 -->
          <ElTabPane label="安全设置" name="security">
            <ElForm :model="securityForm" label-width="180px" style="max-width: 700px">
              <ElFormItem label="启用HTTPS">
                <ElSwitch v-model="securityForm.enable_https" />
              </ElFormItem>

              <ElFormItem label="会话超时(分钟)">
                <ElInputNumber v-model="securityForm.session_timeout" :min="5" :max="480" />
              </ElFormItem>

              <ElFormItem label="最大登录尝试次数">
                <ElInputNumber v-model="securityForm.max_login_attempts" :min="3" :max="10" />
              </ElFormItem>

              <ElFormItem label="锁定时长(分钟)">
                <ElInputNumber v-model="securityForm.lockout_duration" :min="5" :max="120" />
              </ElFormItem>

              <ElFormItem label="启用验证码">
                <ElSwitch v-model="securityForm.enable_captcha" />
              </ElFormItem>

              <ElFormItem label="密码最小长度">
                <ElInputNumber v-model="securityForm.password_min_length" :min="6" :max="32" />
              </ElFormItem>

              <ElFormItem label="要求大写字母">
                <ElSwitch v-model="securityForm.password_require_uppercase" />
              </ElFormItem>

              <ElFormItem label="要求小写字母">
                <ElSwitch v-model="securityForm.password_require_lowercase" />
              </ElFormItem>

              <ElFormItem label="要求数字">
                <ElSwitch v-model="securityForm.password_require_numbers" />
              </ElFormItem>

              <ElFormItem label="要求特殊字符">
                <ElSwitch v-model="securityForm.password_require_specialchars" />
              </ElFormItem>

              <ElFormItem label="启用双因素认证">
                <ElSwitch v-model="securityForm.enable_two_factor" />
              </ElFormItem>

              <ElFormItem label="允许的IP范围">
                <ElInput v-model="securityForm.allowed_ip_ranges" type="textarea" :rows="2" placeholder="192.168.1.0/24,10.0.0.0/8" />
              </ElFormItem>

              <ElFormItem label="阻止的IP范围">
                <ElInput v-model="securityForm.blocked_ip_ranges" type="textarea" :rows="2" placeholder="每行一个IP或IP段" />
              </ElFormItem>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveSettings('security')">保存</ElButton>
                <ElButton @click="resetDefaults('security')">重置</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- 上传设置 -->
          <ElTabPane label="上传设置" name="upload">
            <ElForm :model="uploadForm" label-width="150px" style="max-width: 600px">
              <ElFormItem label="最大文件大小(MB)">
                <ElInputNumber v-model="uploadForm.max_file_size" :min="1" :max="1000" />
              </ElFormItem>

              <ElFormItem label="允许的文件类型">
                <ElInput v-model="uploadForm.allowed_file_types" placeholder=".jpg,.png,.mp4" />
              </ElFormItem>

              <ElFormItem label="上传路径">
                <ElInput v-model="uploadForm.upload_path" placeholder="/uploads" />
              </ElFormItem>

              <ElFormItem label="自动清理过期文件">
                <ElSwitch v-model="uploadForm.enable_auto_cleanup" />
              </ElFormItem>

              <ElFormItem label="清理天数">
                <ElInputNumber v-model="uploadForm.cleanup_days" :min="1" :max="365" :disabled="!uploadForm.enable_auto_cleanup" />
              </ElFormItem>

              <ElFormItem label="最大并发上传数">
                <ElInputNumber v-model="uploadForm.max_concurrent_uploads" :min="1" :max="20" />
              </ElFormItem>

              <ElFormItem label="生成缩略图">
                <ElSwitch v-model="uploadForm.enable_thumbnail" />
              </ElFormItem>

              <ElFormItem label="缩略图质量">
                <ElInputNumber v-model="uploadForm.thumbnail_quality" :min="10" :max="100" :disabled="!uploadForm.enable_thumbnail" />
              </ElFormItem>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveSettings('upload')">保存</ElButton>
                <ElButton @click="resetDefaults('upload')">重置</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- 存储设置 -->
          <ElTabPane label="存储设置" name="storage">
            <ElForm :model="storageForm" label-width="150px" style="max-width: 700px">
              <ElFormItem label="存储类型">
                <ElSelect v-model="storageForm.storage_type" style="width: 200px">
                  <ElOption v-for="opt in storageTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
                </ElSelect>
              </ElFormItem>

              <ElFormItem label="本地存储路径">
                <ElInput v-model="storageForm.local_path" placeholder="/data/storage" />
              </ElFormItem>

              <ElFormItem label="磁盘警告阈值(%)">
                <ElInputNumber v-model="storageForm.disk_warning_threshold" :min="50" :max="99" />
              </ElFormItem>

              <ElFormItem label="磁盘严重阈值(%)">
                <ElInputNumber v-model="storageForm.disk_critical_threshold" :min="50" :max="99" />
              </ElFormItem>

              <el-divider>S3兼容存储</el-divider>

              <ElFormItem label="启用S3">
                <ElSwitch v-model="storageForm.enable_s3" />
              </ElFormItem>

              <template v-if="storageForm.enable_s3">
                <ElFormItem label="Bucket">
                  <ElInput v-model="storageForm.s3_bucket" />
                </ElFormItem>

                <ElFormItem label="Region">
                  <ElInput v-model="storageForm.s3_region" placeholder="us-east-1" />
                </ElFormItem>

                <ElFormItem label="Access Key">
                  <ElInput v-model="storageForm.s3_access_key" type="password" show-password />
                </ElFormItem>

                <ElFormItem label="Secret Key">
                  <ElInput v-model="storageForm.s3_secret_key" type="password" show-password />
                </ElFormItem>

                <ElFormItem label="Endpoint">
                  <ElInput v-model="storageForm.s3_endpoint" placeholder="https://s3.amazonaws.com" />
                </ElFormItem>
              </template>

              <el-divider>阿里云OSS</el-divider>

              <ElFormItem label="启用OSS">
                <ElSwitch v-model="storageForm.enable_oss" />
              </ElFormItem>

              <template v-if="storageForm.enable_oss">
                <ElFormItem label="Bucket">
                  <ElInput v-model="storageForm.oss_bucket" />
                </ElFormItem>

                <ElFormItem label="Region">
                  <ElInput v-model="storageForm.oss_region" placeholder="oss-cn-hangzhou" />
                </ElFormItem>

                <ElFormItem label="Access Key">
                  <ElInput v-model="storageForm.oss_access_key" type="password" show-password />
                </ElFormItem>

                <ElFormItem label="Secret Key">
                  <ElInput v-model="storageForm.oss_secret_key" type="password" show-password />
                </ElFormItem>

                <ElFormItem label="Endpoint">
                  <ElInput v-model="storageForm.oss_endpoint" placeholder="https://oss-cn-hangzhou.aliyuncs.com" />
                </ElFormItem>
              </template>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveSettings('storage')">保存</ElButton>
                <ElButton @click="resetDefaults('storage')">重置</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>
        </ElTabs>
      </ElCard>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/variables.scss' as *;

.system-settings-container {
  padding: 20px;
  background: var(--bg-hover);
  min-height: 100%;

  .page-header {
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
        padding: 24px;
      }
    }
  }
}
</style>
