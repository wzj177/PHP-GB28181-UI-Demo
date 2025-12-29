# 前端 API 配置文档

本文档描述前端项目的 API 配置和路由映射关系。

---

## 1. 环境配置

### .env 文件配置
```bash
VITE_MOCK_ENABLED=false
VITE_APP_TITLE=PHP-GB28181
VITE_AMAP_KEY=YOUR_AMAP_KEY_HERE
VITE_API_BASE_URL=/api
```

### Vite Proxy 配置

**文件**: `vite.config.ts`

```typescript
server: {
  port: 3230,
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8886',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '')
    }
  }
}
```

**请求流程**:
1. 前端请求: `/api/admin/auth/login`
2. Vite Proxy 重写为: `/admin/auth/login`
3. 转发到后端: `http://127.0.0.1:8886/admin/auth/login`

---

## 2. API 模块映射

### 2.1 认证模块 (authApi)

**文件**: `src/api/authApi.ts`

| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 登录 | `POST /admin/auth/login` | `/api/admin/auth/login` |
| 退出 | `POST /admin/auth/logout` | `/api/admin/auth/logout` |
| 验证码 | `GET /admin/auth/captcha` | `/api/admin/auth/captcha` |

### 2.2 GB28181 设备管理 (gb28181Api)

**文件**: `src/api/gb28181Api.ts`

| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 设备列表 | `GET /admin/gb28181/devices` | `/api/admin/gb28181/devices` |
| 设备详情 | `GET /admin/gb28181/devices/{id}` | `/api/admin/gb28181/devices/{id}` |
| 删除设备 | `DELETE /admin/gb28181/devices/{id}` | `/api/admin/gb28181/devices/{id}` |
| 查询目录 | `POST /admin/gb28181/devices/{id}/catalog` | `/api/admin/gb28181/devices/{id}/catalog` |
| 通道列表 | `GET /admin/gb28181/channels/{deviceId}` | `/api/admin/gb28181/channels/{deviceId}` |
| PTZ 控制 | `POST /admin/gb28181/ptz` | `/api/admin/gb28181/ptz` |
| 开始直播 | `POST /admin/gb28181/streams/start-live` | `/api/admin/gb28181/streams/start-live` |
| 停止直播 | `POST /admin/gb28181/streams/stop-live` | `/api/admin/gb28181/streams/stop-live` |
| 播放地址 | `GET /admin/gb28181/streams/play-urls` | `/api/admin/gb28181/streams/play-urls` |
| 录像列表 | `GET /admin/gb28181/recordings` | `/api/admin/gb28181/recordings` |
| 开始录像 | `POST /admin/gb28181/recordings/start-record` | `/api/admin/gb28181/recordings/start-record` |
| 停止录像 | `POST /admin/gb28181/recordings/stop-record` | `/api/admin/gb28181/recordings/stop-record` |
| 抓拍快照 | `POST /admin/gb28181/recordings/snapshot` | `/api/admin/gb28181/recordings/snapshot` |

### 2.3 告警管理 (alarmApi)

**文件**: `src/api/alarmApi.ts`

| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 告警列表 | `GET /admin/gb28181/alarms` | `/api/admin/gb28181/alarms` |
| 告警详情 | `GET /admin/gb28181/alarms/{id}` | `/api/admin/gb28181/alarms/{id}` |
| 更新告警 | `PUT /admin/gb28181/alarms/{id}` | `/api/admin/gb28181/alarms/{id}` |

### 2.4 系统管理 (systemApi)

**文件**: `src/api/systemApi.ts`

#### 系统设置
| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 获取配置 | `GET /admin/setting/view/{key}` | `/api/admin/setting/view/{key}` |
| 保存基础配置 | `POST /admin/setting/basic` | `/api/admin/setting/basic` |
| 保存附件配置 | `POST /admin/setting/attachment` | `/api/admin/setting/attachment` |
| 保存安全配置 | `POST /admin/setting/auth` | `/api/admin/setting/auth` |
| 保存存储配置 | `POST /admin/setting/storage` | `/api/admin/setting/storage` |
| 保存CDN配置 | `POST /admin/setting/cdn` | `/api/admin/setting/cdn` |
| 保存邮件配置 | `POST /admin/setting/mail` | `/api/admin/setting/mail` |
| 保存VIP配置 | `POST /admin/setting/vip` | `/api/admin/setting/vip` |
| 保存IP名单 | `POST /admin/setting/ip-check-list` | `/api/admin/setting/ip-check-list` |
| 附件选项 | `GET /admin/setting/attachment/options` | `/api/admin/setting/attachment/options` |

#### 系统日志
| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 日志列表 | `GET /admin/system/log` | `/api/admin/system/log` |
| 日志详情 | `GET /admin/system/log/{id}` | `/api/admin/system/log/{id}` |
| 批量删除 | `POST /admin/system/log/btch-dlt` | `/api/admin/system/log/btch-dlt` |
| 模块选项 | `GET /admin/system/log/modules` | `/api/admin/system/log/modules` |
| 操作选项 | `GET /admin/system/log/actions/{module}` | `/api/admin/system/log/actions/{module}` |
| 导出日志 | `GET /admin/system/logs/export` | `/api/admin/system/logs/export` |

#### 系统监控
| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 系统统计 | `GET /admin/system/stats` | `/api/admin/system/stats` |
| 设备统计 | `GET /admin/system/device-stats` | `/api/admin/system/device-stats` |
| ZLM统计 | `GET /admin/system/zlm-stats` | `/api/admin/system/zlm-stats` |
| CPU使用 | `GET /admin/system/cpu-usage` | `/api/admin/system/cpu-usage` |
| 内存使用 | `GET /admin/system/memory-usage` | `/api/admin/system/memory-usage` |
| 网络统计 | `GET /admin/system/network-stats` | `/api/admin/system/network-stats` |
| 磁盘统计 | `GET /admin/system/disk-stats` | `/api/admin/system/disk-stats` |
| 测试邮件 | `POST /admin/system/test-mail` | `/api/admin/system/test-mail` |

### 2.5 系统监控 (monitorApi)

**文件**: `src/api/monitorApi.ts`

| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 系统统计 | `GET /admin/system/stats` | `/api/admin/system/stats` |
| 设备统计 | `GET /admin/system/device-stats` | `/api/admin/system/device-stats` |
| ZLM统计 | `GET /admin/system/zlm-stats` | `/api/admin/system/zlm-stats` |
| CPU使用 | `GET /admin/system/cpu-usage` | `/api/admin/system/cpu-usage` |
| 内存使用 | `GET /admin/system/memory-usage` | `/api/admin/system/memory-usage` |
| 网络统计 | `GET /admin/system/network-stats` | `/api/admin/system/network-stats` |
| 磁盘统计 | `GET /admin/system/disk-stats` | `/api/admin/system/disk-stats` |

### 2.6 电子地图 (mapApi)

**文件**: `src/api/mapApi.ts`

| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 设备位置 | `GET /admin/gb28181/map/devices` | `/api/admin/gb28181/map/devices` |
| 更新位置 | `PUT /admin/gb28181/map/devices/{id}/position` | `/api/admin/gb28181/map/devices/{id}/position` |

### 2.7 权限管理 (permissionApi)

**文件**: `src/api/permissionApi.ts`

| 功能 | 前端请求 | 后端路由 |
|------|----------|----------|
| 用户列表 | `GET /admin/permission/users` | `/api/admin/permission/users` |
| 创建用户 | `POST /admin/permission/users` | `/api/admin/permission/users` |
| 角色列表 | `GET /admin/permission/roles` | `/api/admin/permission/roles` |
| 菜单列表 | `GET /admin/permission/menus` | `/api/admin/permission/menus` |

---

## 3. HTTP 客户端配置

**文件**: `src/utils/request.ts`

### 请求拦截器
- 自动添加 JWT Token
- 请求取消队列管理
- 支持公开请求 (X-Public header)

### 响应拦截器
- 自动续签 (从响应头获取新 Token)
- 统一错误处理
- 401 自动跳转登录

### 请求示例
```typescript
import request from '@/utils/request'

// GET 请求
request.get('/admin/gb28181/devices', { params: { page: 1 } })

// POST 请求
request.post('/admin/setting/basic', { site_name: 'GB28181' })

// PUT 请求
request.put(`/admin/gb28181/alarms/${id}`, { status: 'handled' })

// DELETE 请求
request.delete(`/admin/gb28181/devices/${id}`)
```

---

## 4. 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2024-12-29 | 更新所有 API 路由为 `/api/admin/...` 前缀 |
| 2024-12-29 | 创建系统设置页面 (Vue3 + TypeScript) |
