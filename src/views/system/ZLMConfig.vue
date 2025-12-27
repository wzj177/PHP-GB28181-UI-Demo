<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElForm, ElFormItem, ElInput, ElSwitch, ElInputNumber, ElButton, ElMessage, ElTabPane, ElTabs, ElAlert } from 'element-plus'
import { systemApi } from '@/api/systemApi'

const loading = ref(false)
const saving = ref(false)
const restarting = ref(false)

// API settings
const apiForm = ref({
  secret: '',
  timeout: 10
})

// FFmpeg settings
const ffmpegForm = ref({
  bin: '/usr/bin/ffmpeg',
  cmd: '',
  snap: ''
})

// Hook settings
const hookForm = ref({
  alive_interval: 10.0,
  enable: false,
  on_flow_report: '',
  on_http_access: '',
  on_play: '',
  on_publish: '',
  on_record_mp4: '',
  on_record_ts: '',
  on_rtp_server_timeout: '',
  on_rtsp_auth: '',
  on_rtsp_realm: '',
  on_send_rtp_stopped: '',
  on_server_exited: '',
  on_server_keepalive: '',
  on_server_started: '',
  on_shell_login: '',
  on_stream_changed: '',
  on_stream_none_reader: '',
  on_stream_not_found: ''
})

// Load config
const loadConfig = async () => {
  loading.value = true
  try {
    const response = await systemApi.getZLMConfig()

    if (response?.data) {
      const data = response.data
      apiForm.value = { ...apiForm.value, ...data.api }
      ffmpegForm.value = { ...ffmpegForm.value, ...data.ffmpeg }
      hookForm.value = { ...hookForm.value, ...data.hook }
    }
  } catch (error: any) {
    console.error('Failed to load ZLM config:', error)
    ElMessage.error(error.message || '加载配置失败')
  } finally {
    loading.value = false
  }
}

// Save config
const saveConfig = async () => {
  saving.value = true
  try {
    const data = {
      api: apiForm.value,
      ffmpeg: ffmpegForm.value,
      hook: hookForm.value
    }

    await systemApi.saveZLMConfig(data)
    ElMessage.success('保存成功')
  } catch (error: any) {
    console.error('Failed to save ZLM config:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    saving.value = false
  }
}

// Restart ZLM
const restartZLM = async () => {
  restarting.value = true
  try {
    await systemApi.restartZLM()
    ElMessage.success('ZLM服务正在重启...')
  } catch (error: any) {
    console.error('Failed to restart ZLM:', error)
    ElMessage.error(error.message || '重启失败')
  } finally {
    restarting.value = false
  }
}

// Reset to defaults
const resetDefaults = async () => {
  try {
    await systemApi.resetZLMConfig()
    await loadConfig()
    ElMessage.success('已重置为默认配置')
  } catch (error: any) {
    console.error('Failed to reset config:', error)
    ElMessage.error(error.message || '重置失败')
  }
}

onMounted(() => {
  loadConfig()
})
</script>

<template>
  <div class="zlm-config-container">
    <div class="page-header">
      <h2>ZLMediaKit 配置</h2>
      <div class="header-actions">
        <ElButton :loading="restarting" type="danger" @click="restartZLM">重启服务</ElButton>
      </div>
    </div>

    <div class="stats-content">
      <ElCard class="stats-card full-width">
        <ElAlert
          title="修改配置后需要重启ZLM服务才能生效"
          type="warning"
          :closable="false"
          style="margin-bottom: 20px"
        />

        <ElTabs>
          <!-- API 配置 -->
          <ElTabPane label="API配置" name="api">
            <ElForm :model="apiForm" label-width="150px" style="max-width: 600px">
              <ElFormItem label="API密钥" required>
                <ElInput v-model="apiForm.secret" type="password" show-password placeholder="请输入API密钥" />
                <div class="form-tip">用于API请求鉴权，请妥善保管</div>
              </ElFormItem>

              <ElFormItem label="超时时间(秒)">
                <ElInputNumber v-model="apiForm.timeout" :min="1" :max="300" />
                <div class="form-tip">API请求超时时间</div>
              </ElFormItem>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveConfig">保存</ElButton>
                <ElButton @click="resetDefaults">重置默认</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- FFmpeg 配置 -->
          <ElTabPane label="FFmpeg配置" name="ffmpeg">
            <ElForm :model="ffmpegForm" label-width="200px" style="max-width: 700px">
              <ElFormItem label="FFmpeg路径" required>
                <ElInput v-model="ffmpegForm.bin" placeholder="/usr/bin/ffmpeg" />
                <div class="form-tip">FFmpeg可执行文件的完整路径</div>
              </ElFormItem>

              <ElFormItem label="推拉流命令模板">
                <ElInput v-model="ffmpegForm.cmd" type="textarea" :rows="4" placeholder="%s:%s -i %s -c:v copy -c:a copy -f flv rtmp://%s/%s/%s" />
                <div class="form-tip">
                  支持的占位符: %s (流ID), %v (虚拟主机), %app (应用名), %stream (流名)
                </div>
              </ElFormItem>

              <ElFormItem label="截图命令模板">
                <ElInput v-model="ffmpegForm.snap" type="textarea" :rows="4" placeholder="%s -i %s -frames:v 1 -f image2pipe -" />
                <div class="form-tip">用于截图的FFmpeg命令模板</div>
              </ElFormItem>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveConfig">保存</ElButton>
                <ElButton @click="resetDefaults">重置默认</ElButton>
              </ElFormItem>
            </ElForm>
          </ElTabPane>

          <!-- Hook 配置 -->
          <ElTabPane label="Hook配置" name="hook">
            <ElForm :model="hookForm" label-width="200px" style="max-width: 700px">
              <ElFormItem label="启用Hook">
                <ElSwitch v-model="hookForm.enable" />
                <div class="form-tip">启用后可通过HTTP回调处理事件</div>
              </ElFormItem>

              <ElFormItem label="心跳间隔(秒)">
                <ElInputNumber v-model="hookForm.alive_interval" :min="1" :max="300" :step="0.1" :precision="1" :disabled="!hookForm.enable" />
                <div class="form-tip">发送心跳通知的间隔时间</div>
              </ElFormItem>

              <el-divider />

              <ElFormItem label="on_flow_report">
                <ElInput v-model="hookForm.on_flow_report" placeholder="http://your-server.com/hook/on_flow_report" :disabled="!hookForm.enable" />
                <div class="form-tip">流量统计上报</div>
              </ElFormItem>

              <ElFormItem label="on_http_access">
                <ElInput v-model="hookForm.on_http_access" placeholder="http://your-server.com/hook/on_http_access" :disabled="!hookForm.enable" />
                <div class="form-tip">HTTP访问鉴权</div>
              </ElFormItem>

              <ElFormItem label="on_play">
                <ElInput v-model="hookForm.on_play" placeholder="http://your-server.com/hook/on_play" :disabled="!hookForm.enable" />
                <div class="form-tip">播放触发</div>
              </ElFormItem>

              <ElFormItem label="on_publish">
                <ElInput v-model="hookForm.on_publish" placeholder="http://your-server.com/hook/on_publish" :disabled="!hookForm.enable" />
                <div class="form-tip">推流触发</div>
              </ElFormItem>

              <ElFormItem label="on_record_mp4">
                <ElInput v-model="hookForm.on_record_mp4" placeholder="http://your-server.com/hook/on_record_mp4" :disabled="!hookForm.enable" />
                <div class="form-tip">MP4录制完成</div>
              </ElFormItem>

              <ElFormItem label="on_record_ts">
                <ElInput v-model="hookForm.on_record_ts" placeholder="http://your-server.com/hook/on_record_ts" :disabled="!hookForm.enable" />
                <div class="form-tip">TS录制完成</div>
              </ElFormItem>

              <ElFormItem label="on_rtp_server_timeout">
                <ElInput v-model="hookForm.on_rtp_server_timeout" placeholder="http://your-server.com/hook/on_rtp_server_timeout" :disabled="!hookForm.enable" />
                <div class="form-tip">RTP服务器超时</div>
              </ElFormItem>

              <ElFormItem label="on_rtsp_auth">
                <ElInput v-model="hookForm.on_rtsp_auth" placeholder="http://your-server.com/hook/on_rtsp_auth" :disabled="!hookForm.enable" />
                <div class="form-tip">RTSP认证</div>
              </ElFormItem>

              <ElFormItem label="on_rtsp_realm">
                <ElInput v-model="hookForm.on_rtsp_realm" placeholder="RTSP认证领域" :disabled="!hookForm.enable" />
              </ElFormItem>

              <ElFormItem label="on_send_rtp_stopped">
                <ElInput v-model="hookForm.on_send_rtp_stopped" placeholder="http://your-server.com/hook/on_send_rtp_stopped" :disabled="!hookForm.enable" />
                <div class="form-tip">发送RTP停止</div>
              </ElFormItem>

              <ElFormItem label="on_server_exited">
                <ElInput v-model="hookForm.on_server_exited" placeholder="http://your-server.com/hook/on_server_exited" :disabled="!hookForm.enable" />
                <div class="form-tip">服务器退出</div>
              </ElFormItem>

              <ElFormItem label="on_server_keepalive">
                <ElInput v-model="hookForm.on_server_keepalive" placeholder="http://your-server.com/hook/on_server_keepalive" :disabled="!hookForm.enable" />
                <div class="form-tip">服务器心跳</div>
              </ElFormItem>

              <ElFormItem label="on_server_started">
                <ElInput v-model="hookForm.on_server_started" placeholder="http://your-server.com/hook/on_server_started" :disabled="!hookForm.enable" />
                <div class="form-tip">服务器启动</div>
              </ElFormItem>

              <ElFormItem label="on_shell_login">
                <ElInput v-model="hookForm.on_shell_login" placeholder="http://your-server.com/hook/on_shell_login" :disabled="!hookForm.enable" />
                <div class="form-tip">Shell登录</div>
              </ElFormItem>

              <ElFormItem label="on_stream_changed">
                <ElInput v-model="hookForm.on_stream_changed" placeholder="http://your-server.com/hook/on_stream_changed" :disabled="!hookForm.enable" />
                <div class="form-tip">流变化</div>
              </ElFormItem>

              <ElFormItem label="on_stream_none_reader">
                <ElInput v-model="hookForm.on_stream_none_reader" placeholder="http://your-server.com/hook/on_stream_none_reader" :disabled="!hookForm.enable" />
                <div class="form-tip">流无人观看</div>
              </ElFormItem>

              <ElFormItem label="on_stream_not_found">
                <ElInput v-model="hookForm.on_stream_not_found" placeholder="http://your-server.com/hook/on_stream_not_found" :disabled="!hookForm.enable" />
                <div class="form-tip">流未找到</div>
              </ElFormItem>

              <ElFormItem>
                <ElButton type="primary" :loading="saving" @click="saveConfig">保存</ElButton>
                <ElButton @click="resetDefaults">重置默认</ElButton>
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

.zlm-config-container {
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
        padding: 24px;
      }
    }
  }

  .form-tip {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 4px;
  }

  .el-divider {
    margin: 24px 0;
  }
}
</style>
