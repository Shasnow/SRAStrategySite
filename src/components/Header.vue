<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import MoonStars from "@/components/icons/MoonStars.vue";
import Sun from "@/components/icons/Sun.vue";
import { useAuthStore } from "@/stores/auth";

const isDark = useDark()
const toggleDark = useToggle(isDark);

const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);
const { login, logout } = authStore;

const emit = defineEmits<{
  (e: "show-my-strategies"): void;
}>();

const onUserCommand = (command: string) => {
  if (command === "logout") {
    logout();
    ElMessage.success("已退出登录");
  }
};

</script>

<template>
  <div class="container">
    <h1>StarRailAssistant 攻略站</h1>
    <div class="actions">
      <el-switch v-model="isDark" @change="toggleDark"
                 size="large"
                 :active-action-icon="MoonStars"
                 :inactive-action-icon="Sun"/>
      <el-button v-if="isAuthenticated" @click="emit('show-my-strategies')">
        我的攻略
      </el-button>
      <el-dropdown v-if="isAuthenticated && user" @command="onUserCommand">
        <span class="user-info">
          <el-avatar :size="28" :src="user.avatar_url" />
          <span class="user-name">{{ user.name || user.login }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <el-button v-else size="large" @click="login">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/>
        </svg>
        GitHub 登录
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color);
}

.container h1 {
  color: var(--el-color-primary);
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  outline: none;
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
