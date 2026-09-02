<script setup lang="ts">
import { computed } from "vue";
import type { StrategyDetail } from "@/api/strategy";

const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    detail?: StrategyDetail;
  }>(),
  {
    modelValue: false,
    detail: () =>
      ({
        id: null,
        title: "",
        description: "",
        author: "",
        uploader: "",
        share_code: "",
        min_coins: 0,
        min_level: 0,
        mid_level: 0,
        on_field: "",
        off_field: "",
      }) as StrategyDetail,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "download", id: NonNullable<StrategyDetail["id"]>): void;
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const closeDialog = () => {
  dialogVisible.value = false;
};

const downloadDetail = () => {
  if (props.detail?.id == null) return;
  emit("download", props.detail.id);
};
</script>

<template>
  <el-dialog v-model="dialogVisible" title="攻略详情">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="title">{{ detail?.title ?? "" }}</el-descriptions-item>
      <el-descriptions-item label="description">{{ detail?.description ?? "" }}</el-descriptions-item>
      <el-descriptions-item label="author">{{ detail?.author ?? "" }}</el-descriptions-item>
      <el-descriptions-item label="uploader">{{ detail?.uploader ?? "" }}</el-descriptions-item>
      <el-descriptions-item label="share_code">{{ detail?.share_code ?? "" }}</el-descriptions-item>
      <el-descriptions-item label="min_coins">{{ detail?.min_coins ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="min_level">{{ detail?.min_level ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="mid_level">{{ detail?.mid_level ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="on_field">{{ detail?.on_field ?? "" }}</el-descriptions-item>
      <el-descriptions-item label="off_field">{{ detail?.off_field ?? "" }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
        <el-button type="primary" :disabled="detail?.id == null" @click="downloadDetail">下载</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style>
@media (max-width: 768px) {
  .el-dialog {
    --el-dialog-width: 80% !important;
  }
}
</style>

