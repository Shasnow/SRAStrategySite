<script setup>
import { useDark, useToggle } from "@vueuse/core";
import MoonStars from "@/components/icons/MoonStars.vue";
import Sun from "@/components/icons/Sun.vue";

const isDark = useDark()
const toggleDark = useToggle(isDark);

</script>

<template>
  <div class="container">
    <h1>StarRailAssistant 攻略站</h1>
    <el-switch v-model="isDark" @change="toggleDark"
               size="large"
               :active-action-icon="MoonStars"
               :inactive-action-icon="Sun"/>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
}
</style>