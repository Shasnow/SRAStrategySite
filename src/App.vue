<script setup>
import {createStrategy, getStrategies, getStrategyDetail} from "@/api/strategy.js";
import {ElMessage} from "element-plus";
import {onMounted, ref} from "vue";

const strategyMetas = ref([]);
const strategyDetail = ref({
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
const uploadLoading = ref(false);
const uploadFileName = ref("");

const loadStrategies = async () => {
  try {
    const res = await getStrategies();
    strategyMetas.value = res?.data;
  } catch (err) {
    strategyMetas.value = [];
    console.error("Failed to fetch strategies:", err);
  }
};

const readFileText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsText(file, "utf-8");
    });

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

const beforeJsonUpload = (file) => {
  const isJson = file.type === "application/json" || file.name.toLowerCase().endsWith(".json");
  if (!isJson) {
    ElMessage.error("请上传 JSON 文件");
  }
  return isJson;
};

const handleJsonFileChange = async (uploadFile) => {
  const file = uploadFile?.raw;
  if (!file) return;

  uploadFileName.value = file.name;
  uploadLoading.value = true;

  try {
    const text = await readFileText(file);
    const parsed = JSON.parse(text);
    await createStrategy(parsed);
    ElMessage.success("上传成功");
    uploadDialogVisible.value = false;
    uploadFileName.value = "";
    await loadStrategies();
  } catch (err) {
    console.error("Failed to upload strategy:", err);
    ElMessage.error(err instanceof SyntaxError ? "JSON 格式不正确" : "上传失败");
  } finally {
    uploadLoading.value = false;
  }
};

const closeUploadDialog = () => {
  uploadDialogVisible.value = false;
  uploadFileName.value = "";
};

onMounted(() => {
  loadStrategies();
});
</script>

<template>
  <div>
    <el-container>
      <el-header>
        <h1>StarRailAssistant 攻略站</h1>
      </el-header>
      <el-container>
        <el-main>
          <template v-if="strategyMetas.length > 0">
            <el-space direction="vertical" fill>
              <el-card v-for="meta in strategyMetas" :key="meta.id">
                <h3>{{ meta.title }}</h3>
                <el-text line-clamp="2">{{ meta.description }}</el-text>
                <div>
                  <el-button @click="showStrategyDetail(meta.id)">详情</el-button>
                  <el-button @click="downloadStrategy(meta.id)">下载</el-button>
                </div>
              </el-card>
            </el-space>
          </template>
          <el-card v-else>
            <p>No strategies available.</p>
          </el-card>
          <el-dialog v-model="strategyDetailVisible" title="攻略详情">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="title">{{ strategyDetail.title }}</el-descriptions-item>
              <el-descriptions-item label="description">{{ strategyDetail.description }}</el-descriptions-item>
              <el-descriptions-item label="author">{{ strategyDetail.author }}</el-descriptions-item>
              <el-descriptions-item label="uploader">{{ strategyDetail.uploader }}</el-descriptions-item>
              <el-descriptions-item label="share_code">{{ strategyDetail.share_code }}</el-descriptions-item>
              <el-descriptions-item label="min_coins">{{ strategyDetail.min_coins }}</el-descriptions-item>
              <el-descriptions-item label="min_level">{{ strategyDetail.min_level }}</el-descriptions-item>
              <el-descriptions-item label="mid_level">{{ strategyDetail.mid_level }}</el-descriptions-item>
              <el-descriptions-item label="on_field">{{ strategyDetail.on_field }}</el-descriptions-item>
              <el-descriptions-item label="off_field">{{ strategyDetail.off_field }}</el-descriptions-item>
            </el-descriptions>
            <template #footer>
              <span class="dialog-footer">
            <el-button @click="strategyDetailVisible = false">关闭</el-button>
            <el-button type="primary" @click="downloadStrategy(strategyDetail.id)">下载</el-button>
              </span>
            </template>
          </el-dialog>
          <el-dialog v-model="uploadDialogVisible" title="上传攻略">
            <el-upload
                :auto-upload="false"
                :before-upload="beforeJsonUpload"
                :show-file-list="false"
                accept=".json,application/json"
                action="#"
                drag
                @change="handleJsonFileChange"
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">将 JSON 文件拖到此处，或 <em>点击选择</em></div>
            </el-upload>

            <p v-if="uploadFileName">已选择：{{ uploadFileName }}</p>
            <p>上传后需联系管理员审核，才能公开可见</p>
            <template #footer>
              <span class="dialog-footer">
                <el-button :disabled="uploadLoading" @click="closeUploadDialog">取消</el-button>
              </span>
            </template>
          </el-dialog>
        </el-main>
        <el-aside>
          <el-button @click="uploadDialogVisible = true">上传</el-button>
        </el-aside>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped>

</style>
