<script setup>
import {getStrategies, getStrategyDetail} from "@/api/strategy.js";
import {onMounted, ref} from "vue";
import Header from "@/components/Header.vue";
import Aside from "@/components/Aside.vue";
import StrategyDetailModel from "@/components/StrategyDetailModel.vue";
import UploadStrategyDialog from "@/components/UploadStrategyDialog.vue";
import StrategyCard from "@/components/StrategyCard.vue";

const strategyMetas = ref([]);
const strategyDetail = ref({
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

const downloadJsonFile = (data, fileName) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
};

const showStrategyDetail = async (id) => {
  try {
    const res = await getStrategyDetail(id);
    strategyDetail.value = res.data;
    strategyDetail.value.id = id;
    strategyDetailVisible.value = true;
  } catch (err) {
    console.error("Failed to fetch strategy detail:", err);
  }
};

const downloadStrategy = async (id) => {
  try {
    const res = await getStrategyDetail(id);
    const strategy = res.data;
    downloadJsonFile(strategy, `SRAstrategy_${strategy.title ?? id}.json`);
  } catch (err) {
    console.error("Failed to download strategy:", err);
  }
};

onMounted(() => {
  loadStrategies();
});
</script>

<template>
  <div>
    <el-container>
      <el-header height="fit-content">
        <Header />
      </el-header>
      <el-container>
        <el-main>
          <template v-if="strategyMetas.length > 0">
            <el-space direction="vertical" fill>
              <StrategyCard v-for="meta in strategyMetas"
                            :key="meta.id"
                            :meta="meta"
                            @show-detail="showStrategyDetail"
                            @download="downloadStrategy" />
            </el-space>
          </template>
          <el-card v-else>
            <p>No strategies available.</p>
          </el-card>
          <StrategyDetailModel
              v-model="strategyDetailVisible"
              :detail="strategyDetail"
              @download="downloadStrategy"
          />
          <UploadStrategyDialog v-model="uploadDialogVisible" />
        </el-main>
        <el-aside class="aside">
          <Aside @upload-btn-click="uploadDialogVisible = true" />
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>
.aside {
  padding: 20px;
}
@media (max-width: 768px) {
  .aside {
    display: none;
  }
}
</style>
