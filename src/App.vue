<script setup lang="ts">
import {getStrategies, getStrategiesByUploader, getStrategyDetail} from "@/api/strategy";
import type {StrategyDetail, StrategyMeta} from "@/api/strategy";
import {computed, onMounted, ref} from "vue";
import {storeToRefs} from "pinia";
import {ElLoading, ElMessage, ElMessageBox} from 'element-plus'
import {useAuthStore} from "@/stores/auth";
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";
import StrategyDetailModel from "@/components/StrategyDetailModel.vue";
import UploadStrategyDialog from "@/components/UploadStrategyDialog.vue";
import StrategyCard from "@/components/StrategyCard.vue";

const authStore = useAuthStore();
const {isAuthenticated, authLoading} = storeToRefs(authStore);
const {login, handleOAuthCallback} = authStore;

const strategyMetas = ref<StrategyMeta[]>([]);
const strategyDetail = ref<StrategyDetail>({
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
});
const strategyDetailVisible = ref(false);
const uploadDialogVisible = ref(false);

const loadStrategies = async () => {
  try {
    const res = await getStrategies();
    strategyMetas.value = Array.isArray(res?.data) ? res.data : [];
  } catch (err) {
    strategyMetas.value = [];
    console.error("Failed to fetch strategies:", err);
  }
};

/** “我的攻略”视图分页大小 */
const MY_PAGE_SIZE = 10;
const currentView = ref<"all" | "mine">("all");
const myStrategies = ref<StrategyMeta[]>([]);
const myTotal = ref(0);
const myPage = ref(1);
const myLoading = ref(false);

const currentUploader = computed(
    () => authStore.user?.name || authStore.user?.login || ""
);

const loadMyStrategies = async (page = 1) => {
  const uploader = currentUploader.value;
  if (!uploader) return;
  myLoading.value = true;
  try {
    const res = await getStrategiesByUploader({
      uploader,
      page,
      pageSize: MY_PAGE_SIZE,
    });
    const data = res?.data;
    if (data && Array.isArray(data.records)) {
      myStrategies.value = data.records;
      myTotal.value = Number(data.total) || data.records.length;
    } else {
      myStrategies.value = [];
      myTotal.value = 0;
    }
    myPage.value = page;
  } catch (err) {
    myStrategies.value = [];
    myTotal.value = 0;
    console.error("Failed to fetch my strategies:", err);
  } finally {
    myLoading.value = false;
  }
};

const showMyStrategies = () => {
  currentView.value = "mine";
  loadMyStrategies(1);
};

const backToAllStrategies = () => {
  currentView.value = "all";
};

const downloadJsonFile = (data: unknown, fileName: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const showStrategyDetail = async (id: StrategyMeta["id"]) => {
  const loading = ElLoading.service({text: "Loading"})
  try {
    const res = await getStrategyDetail(id);
    strategyDetail.value = {...res.data, id};
    strategyDetailVisible.value = true;
  } catch (err) {
    console.error("Failed to fetch strategy detail:", err);
  } finally {
    loading.close();
  }
};

const downloadStrategy = async (id: StrategyMeta["id"]) => {
  try {
    ElMessage.info("正在下载攻略...");
    const res = await getStrategyDetail(id);
    const strategy = res.data;
    downloadJsonFile(strategy, `SRAstrategy_${strategy.title ?? id}.json`);
    ElMessage.success("攻略下载成功！");
  } catch (err) {
    console.error("Failed to download strategy:", err);
    ElMessage.error("攻略下载失败！")
  }
};

/** 未登录时拦截上传操作，引导至 GitHub 授权登录 */
const openUploadDialog = async () => {
  if (!isAuthenticated.value) {
    try {
      await ElMessageBox.confirm(
          "上传攻略需要 GitHub 登录授权，是否前往登录？",
          "需要登录",
          {
            confirmButtonText: "GitHub 登录",
            cancelButtonText: "取消",
            type: "warning",
          }
      );
    } catch {
      return;
    }
    login();
    return;
  }
  uploadDialogVisible.value = true;
};

/** 页面带 code/state/error 回调参数时，说明是 GitHub 授权回调 */
const handleCallbackIfPresent = async () => {
  const query = new URLSearchParams(window.location.search);
  if (!query.get("code") && !query.get("error")) return;
  const result = await handleOAuthCallback();
  if (result.ok) {
    ElMessage.success("登录成功");
  } else if (result.message) {
    ElMessage.error(result.message);
  }
};

onMounted(() => {
  loadStrategies();
  handleCallbackIfPresent();
});
</script>

<template>
  <div v-loading="authLoading" element-loading-text="正在完成 GitHub 登录...">
    <el-container>
      <el-header height="fit-content">
        <Header @show-my-strategies="showMyStrategies" />
      </el-header>
      <el-container>
        <el-main>
          <template v-if="currentView === 'all'">
            <el-space direction="vertical" fill v-if="strategyMetas.length > 0">
              <StrategyCard v-for="meta in strategyMetas"
                            :key="meta.id"
                            :meta="meta"
                            @show-detail="showStrategyDetail"
                            @download="downloadStrategy" />
            </el-space>
            <el-card v-else>
              <p>No strategies available.</p>
            </el-card>
          </template>
          <template v-else>
            <div class="my-strategies-header">
              <el-button @click="backToAllStrategies">返回全部攻略</el-button>
              <h3>我的攻略</h3>
            </div>
            <div v-loading="myLoading">
              <el-space direction="vertical" fill v-if="myStrategies.length > 0">
                <StrategyCard v-for="meta in myStrategies"
                              :key="meta.id"
                              :meta="meta"
                              @show-detail="showStrategyDetail"
                              @download="downloadStrategy" />
              </el-space>
              <el-card v-else>
                <p>您还没有上传过攻略。</p>
              </el-card>
              <el-pagination
                  v-if="myTotal > MY_PAGE_SIZE"
                  class="my-strategies-pagination"
                  v-model:current-page="myPage"
                  :page-size="MY_PAGE_SIZE"
                  :total="myTotal"
                  layout="prev, pager, next, total"
                  @current-change="loadMyStrategies"
              />
            </div>
          </template>
          <StrategyDetailModel
              v-model="strategyDetailVisible"
              :detail="strategyDetail"
              @download="downloadStrategy"/>
          <UploadStrategyDialog v-model="uploadDialogVisible" />
        </el-main>
        <el-aside class="aside">
          <Aside @upload-btn-click="openUploadDialog" />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.aside {
  padding: 20px;
}

.my-strategies-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.my-strategies-header h3 {
  margin: 0;
}

.my-strategies-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .aside {
    display: none;
  }
}
</style>
