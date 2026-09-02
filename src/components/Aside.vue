<script setup lang="ts">
defineEmits<{
  (e: 'upload-btn-click'): void
}>()
</script>

<template>
  <div>
    <el-button type="primary" @click="$emit('upload-btn-click')">上传攻略</el-button>
  </div>
</template>

<style scoped>

</style>