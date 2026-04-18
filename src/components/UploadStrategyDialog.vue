<script setup>
import {computed, ref} from "vue";
import {ElMessage} from "element-plus";
import {createStrategy} from "@/api/strategy.js";

const uploadLoading = ref(false);
const uploadFileName = ref("");

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

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
    dialogVisible.value = false;
    uploadFileName.value = "";
  } catch (err) {
    console.error("Failed to upload strategy:", err);
    ElMessage.error(err instanceof SyntaxError ? "JSON 格式不正确" : "上传失败");
  } finally {
    uploadLoading.value = false;
  }
};

const readFileText = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsText(file, "utf-8");
    });

const closeUploadDialog = () => {
  dialogVisible.value = false;
  uploadFileName.value = "";
};
</script>

<template>
  <el-dialog v-model="dialogVisible" title="上传攻略">
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
</template>

