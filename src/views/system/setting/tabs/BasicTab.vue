<template>
  <el-form
    ref="formRef"
    v-loading="loading"
    :model="formData"
    :rules="rules"
    label-width="200px"
    class="setting-form"
  >
    <el-form-item label="平台名称：" prop="site_name">
      <el-input v-model="formData.site_name" maxlength="64" />
    </el-form-item>
    <el-form-item label="平台地址：" prop="site_url">
      <el-input v-model="formData.site_url" />
      <div class="el-upload__tip">以"http://"或"https://"开头</div>
    </el-form-item>
    <el-form-item label="平台logo：" prop="site_logo">
      <!-- TODO: Add attachment selector component -->
      <el-input v-model="formData.site_logo" placeholder="Logo URL" />
      <div class="el-upload__tip">请上传jpg、jpeg、png格式的图片。logo 建议尺寸32×32px。图片大小建议不超过2MB</div>
    </el-form-item>
    <el-form-item label="icp备案号：" prop="icp">
      <el-input v-model="formData.icp" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">保存</el-button>
      <el-button @click="resetForm">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance, FormRules } from 'element-plus'
import { systemApi, type BasicSetting } from '@/api/systemApi'

const formRef = ref<FormInstance>()
const loading = ref(false)

const defaultForm: BasicSetting = {
  site_name: '',
  site_url: '',
  site_logo: '',
  icp: '',
  favicon: ''
}

const formData = reactive<BasicSetting>({ ...defaultForm })

const rules: FormRules = {
  site_url: [
    { type: 'url', message: '平台url参数格式错误', trigger: 'blur' }
  ]
}

const initDataSource = async () => {
  loading.value = true
  try {
    const result = await systemApi.getSetting('basic')
    if (result) {
      Object.assign(formData, result)
    }
  } catch (error) {
    console.error('Failed to load basic setting:', error)
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (valid) {
      try {
        await systemApi.setBasic(formData)
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('Failed to save basic setting:', error)
      }
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
}

defineExpose({
  initDataSource
})
</script>

<style lang="scss" scoped>
.setting-form {
  max-width: 600px;
}
</style>
