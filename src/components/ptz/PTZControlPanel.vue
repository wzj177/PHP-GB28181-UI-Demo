<template>
  <div class="page">
    <div class="grid">
      <!-- 主控制 -->
      <div class="panel">
        <h3>方向控制</h3>
        <div class="ptz-main">
          <div class="pad">
            <div
              class="dir up"
              @mousedown="startPtzCommand('up')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ▲
            </div>
            <div
              class="dir down"
              @mousedown="startPtzCommand('down')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ▼
            </div>
            <div
              class="dir left"
              @mousedown="startPtzCommand('left')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ◀
            </div>
            <div
              class="dir right"
              @mousedown="startPtzCommand('right')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ▶
            </div>
            <div
              class="dir upleft"
              @mousedown="startPtzCommand('upleft')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ↖
            </div>
            <div
              class="dir upright"
              @mousedown="startPtzCommand('upright')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ↗
            </div>
            <div
              class="dir downleft"
              @mousedown="startPtzCommand('downleft')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ↙
            </div>
            <div
              class="dir downright"
              @mousedown="startPtzCommand('downright')"
              @mouseup="stopPtzCommand()"
              @mouseleave="stopPtzCommand()"
            >
              ↘
            </div>
            <div class="center">PTZ</div>
          </div>

          <div class="controls">
            <div class="row">
              <span class="label">速度</span>
              <ElSlider v-model="speed" :min="1" :max="10" :step="1" show-stops />
            </div>

            <div class="btn-group">
              <ElButton
                @mousedown="startZoomCommand('tele')"
                @mouseup="stopZoomCommand()"
                size="small"
              >
                变倍 +
              </ElButton>
              <ElButton
                @mousedown="startZoomCommand('wide')"
                @mouseup="stopZoomCommand()"
                size="small"
              >
                变倍 −
              </ElButton>
              <ElButton @click="focusCommand('auto')" size="small">
                自动对焦
              </ElButton>
              <ElButton
                @mousedown="startFocusCommand('far')"
                @mouseup="stopFocusCommand()"
                size="small"
              >
                远焦
              </ElButton>
              <ElButton
                @mousedown="startFocusCommand('near')"
                @mouseup="stopFocusCommand()"
                size="small"
              >
                近焦
              </ElButton>
              <ElButton @click="irisCommand('open')" size="small">
                光圈
              </ElButton>
            </div>

            <div class="voice-speak">
              <h3 style="margin-top: 16px">语音对讲</h3>
              <div class="talk">
                <ElButton
                  type="primary"
                  :disabled="isTalkActive"
                  @click="startTalk()"
                >
                  开始对讲
                </ElButton>
                <ElButton
                  :disabled="!isTalkActive"
                  @click="stopTalk()"
                >
                  停止
                </ElButton>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 预置位 -->
      <div class="panel">
        <h3>预置位（1–255）</h3>
        <div class="preset-list" id="presetList">
          <div v-for="i in 255" :key="i" class="preset">
            <span>{{
              presetNames[i] ? i + " · " + presetNames[i] : i + " · 未设置"
            }}</span>
            <div>
              <ElButton @click="gotoPreset(i)" size="small" type="primary">调用</ElButton>
              <ElButton @click="setPreset(i)" size="small">设置</ElButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 巡航 -->
    <div class="panel" style="width: 100%; margin-top: 16px;">
      <ElRow>
        <ElCol :span="12">
          <h3 style="margin-top: 0;">巡航（Cruise）</h3>
          <div class="controls">
            <div class="row">
              <span class="label">巡航号</span>
              <ElSelect v-model="cruiseId" @change="loadCruisePoints()" size="small">
                <ElOption value="1" label="巡航 1" />
                <ElOption value="2" label="巡航 2" />
                <ElOption value="3" label="巡航 3" />
              </ElSelect>
            </div>

            <div class="row">
              <span class="label">停留(s)</span>
              <ElInputNumber
                v-model.number="cruiseStay"
                :min="1"
                :max="60"
                size="small"
              />
            </div>

            <div class="row">
              <span class="label">速度</span>
              <ElInputNumber
                v-model.number="cruiseSpeed"
                :min="1"
                :max="8"
                size="small"
              />
            </div>

            <div class="btn-group">
              <ElButton @click="addToCruise()" type="primary">加入巡航</ElButton>
              <ElButton @click="startCruise()" type="success">开始巡航</ElButton>
              <ElButton @click="stopCruise()" type="danger">停止巡航</ElButton>
            </div>
          </div>
        </ElCol>
        <ElCol :span="12">
          <div style="margin-top: 0;">
            <h3>巡航点列表</h3>
            <div class="preset-list" id="cruisePointList">
              <div
                v-for="(point, index) in cruisePoints"
                :key="index"
                class="preset"
              >
                <span>预置位 {{ point }} - 位置 {{ index + 1 }}</span>
                <ElButton @click="removeFromCruise(index)" size="small" type="danger">移除</ElButton>
              </div>
            </div>
          </div>
        </ElCol>
      </ElRow>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps } from "vue";
import {
  ElSlider,
  ElButton,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElRow,
  ElCol,
  ElMessage
} from 'element-plus';

// Define props for component communication
interface Props {
  channelId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  channelId: "",
});

// State variables
const speed = ref(5);
const presetNames = reactive({
  1: "大门入口",
  2: "停车场",
  5: "走廊",
});
const cruiseId = ref("1");
const cruiseStay = ref(5);
const cruiseSpeed = ref(4);
const cruisePoints = ref<number[]>([]);
const isTalkActive = ref(false);

// PTZ control functions
const startPtzCommand = (direction: string) => {
  ElMessage.info(`开始 ${direction} 方向 PTZ 控制`);
  console.log(
    `START_PTZ_${direction.toUpperCase()}`,
    speed.value,
    props.channelId
  );
  // Send PTZ command to backend/api
};

const stopPtzCommand = () => {
  ElMessage.info("停止 PTZ 控制");
  console.log("STOP_PTZ_COMMAND", props.channelId);
  // Send stop command to backend/api
};

const startZoomCommand = (zoomDirection: string) => {
  ElMessage.info(`开始变倍 ${zoomDirection}`);
  console.log(`START_ZOOM_${zoomDirection.toUpperCase()}`, props.channelId);
  // Send zoom command to backend/api
};

const stopZoomCommand = () => {
  ElMessage.info("停止变倍");
  console.log("STOP_ZOOM_COMMAND", props.channelId);
  // Send stop zoom command to backend/api
};

const focusCommand = (focusType: string) => {
  ElMessage.info(`${focusType} 对焦`);
  console.log(`FOCUS_${focusType.toUpperCase()}`, props.channelId);
  // Send focus command to backend/api
};

const startFocusCommand = (focusDirection: string) => {
  ElMessage.info(`开始 ${focusDirection} 对焦`);
  console.log(`START_FOCUS_${focusDirection.toUpperCase()}`, props.channelId);
  // Send focus command to backend/api
};

const stopFocusCommand = () => {
  ElMessage.info("停止对焦");
  console.log("STOP_FOCUS_COMMAND", props.channelId);
  // Send stop focus command to backend/api
};

const irisCommand = (irisType: string) => {
  ElMessage.info(`光圈 ${irisType}`);
  console.log(`IRIS_${irisType.toUpperCase()}`, props.channelId);
  // Send iris command to backend/api
};

// Preset functions
const gotoPreset = (id: number) => {
  ElMessage.info(`调用预置位 ${id}`);
  console.log("GOTO_PRESET", id, props.channelId);
  // Send GB28181 call preset command
};

const setPreset = (id: number) => {
  ElMessage.info(`设置预置位 ${id}`);
  console.log("SET_PRESET", id, props.channelId);
  // Send GB28181 set preset command
};

// Cruise functions
const loadCruisePoints = () => {
  ElMessage.info("加载巡航点");
  console.log("LOAD_CRUISE_POINTS", cruiseId.value, props.channelId);
  // Load saved cruise points from backend
};

const addToCruise = (id: number = 1) => {
  // Simple implementation - in reality, this would add the current preset
  // For now we'll just simulate adding presets to the cruise
  const nextPreset = (cruisePoints.value.length + 1) % 255;
  cruisePoints.value.push(nextPreset || 1);
  ElMessage.success(`添加预置位 ${nextPreset} 到巡航`);
  console.log("ADD_TO_CRUISE", nextPreset, props.channelId);
};

const startCruise = () => {
  ElMessage.success("开始巡航");
  console.log("START_CRUISE", {
    id: cruiseId.value,
    stay: cruiseStay.value,
    speed: cruiseSpeed.value,
    points: cruisePoints.value,
    channelId: props.channelId,
  });
  // Send start cruise command to backend
};

const stopCruise = () => {
  ElMessage.warning("停止巡航");
  console.log("STOP_CRUISE", props.channelId);
  // Send stop cruise command to backend
};

const removeFromCruise = (index: number) => {
  const removedPreset = cruisePoints.value[index];
  cruisePoints.value.splice(index, 1);
  ElMessage.warning(`移除巡航点: 预置位 ${removedPreset}`);
};

// Talk functions
const startTalk = () => {
  isTalkActive.value = true;
  ElMessage.success("开始对讲");
  console.log("START_TALK", props.channelId);
  // Start audio streaming
};

const stopTalk = () => {
  isTalkActive.value = false;
  ElMessage.info("停止对讲");
  console.log("STOP_TALK", props.channelId);
  // Stop audio streaming
};
</script>

<style lang="scss" scoped>
@use '@/styles/variables.scss' as *;
@use '@/styles/mixins.scss' as *;

.page {
  padding: $spacing-md;
  background: linear-gradient(180deg, $bg-main, $bg-panel);
  color: $text-main;
}

.title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.grid {
  @extend .responsive-grid;
}

.panel {
  @include panel;

  h3 {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #c7d2fe;
  }
}

/* ================= PTZ 主控 ================= */
.ptz-main {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 20px;
  align-items: center;
}

.pad {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle at center, $bg-main, #020617);
  border: 1px solid $border-base;
  position: relative;
}

.dir {
  position: absolute;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #020617;
  border: 1px solid $border-base;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  cursor: pointer;
  transition: 0.15s;

  &:hover {
    color: $primary;
    border-color: $primary;
  }
}

.up {
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
}
.down {
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
}
.left {
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
}
.right {
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
}

.upleft {
  top: 40px;
  left: 40px;
}
.upright {
  top: 40px;
  right: 40px;
}
.downleft {
  bottom: 40px;
  left: 40px;
}
.downright {
  bottom: 40px;
  right: 40px;
}

.center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #020617;
  border: 1px solid $border-base;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: $text-muted;
}

/* ================= 参数区 ================= */
.controls {
  display: grid;
  gap: 14px;
}

.row {
  @extend .form-row;
}

.label {
  @extend .form-label;
}

/* Override Element Plus styles to match dark theme */
:deep(.el-slider) {
  flex: 1;
}

:deep(.el-slider__runway) {
  background-color: $border-light;
  height: 6px;
  border-radius: 3px;
}

:deep(.el-slider__bar) {
  background-color: $primary;
  height: 6px;
  border-radius: 3px;
}

:deep(.el-slider__button) {
  width: 16px;
  height: 16px;
  border: 2px solid $primary;
}

:deep(.el-input-number) {
  flex: 1;
}

:deep(.el-input__wrapper) {
  background-color: #020617 !important;
  border: 1px solid $border-base !important;
  box-shadow: none !important;
  color: $text-main;
}

:deep(.el-input__inner) {
  color: $text-main;
}

:deep(.el-select .el-input__wrapper) {
  background-color: #020617 !important;
  border: 1px solid $border-base !important;
  box-shadow: none !important;
  color: $text-main;
}

:deep(.el-popper) {
  background-color: #020617;
  border: 1px solid $border-base;
  color: $text-main;
}

:deep(.el-select-dropdown__item) {
  color: $text-main;
  background-color: #020617;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: $border-light;
}

.btn-group {
  @extend .btn-group;
}

.talk {
  display: flex;
  gap: 12px;
  margin-top: 12px;

  :deep(.el-button) {
    flex: 1;
  }
}

/* ================= 预置位 ================= */
.preset-list {
  @extend .preset-list;
}

.preset {
  @extend .preset-item;

  :deep(.el-button) {
    height: 28px;
    padding: 0 10px;
    font-size: 12px;
  }
}
</style>