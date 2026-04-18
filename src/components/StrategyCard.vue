<script setup>
import Info from "@/components/icons/Info.vue";
import Download from "@/components/icons/Download.vue";

const props = defineProps({
  meta: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["show-detail", "download"]);

const showStrategyDetail = () => {
  if (props.meta?.id == null) return;
  emit("show-detail", props.meta.id);
};

const downloadStrategy = () => {
  if (props.meta?.id == null) return;
  emit("download", props.meta.id);
}

</script>

<template>
  <el-card class="strategy-card"
           body-style="display: flex; justify-content: space-between; align-items: center;">
    <div class="content">
      <h3>{{ meta.title }}</h3>
      <el-text line-clamp="2">{{ meta.description }}</el-text>
    </div>
    <div class="actions">
      <el-tooltip content="详细信息" placement="top">
        <el-button @click="showStrategyDetail()">
          <Info fill="var(--el-text-color-regular)"/>
        </el-button>
      </el-tooltip>
      <el-tooltip content="下载攻略" placement="top">
        <el-button @click="downloadStrategy()">
          <Download fill="var(--el-color-primary)"/>
        </el-button>
      </el-tooltip>
    </div>
  </el-card>
</template>

<style scoped>
.strategy-card {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  border-radius: 12px;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(124, 158, 245, 0.2);
  border-color: rgba(124, 158, 245, 0.4);
}

.actions {
  flex-shrink: 0;
  margin-left: 12px;
}

.actions button {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}
</style>