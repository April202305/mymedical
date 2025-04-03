<template>
  <div class="manage-quiz-container">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="单题添加" name="single">
        <el-card class="quiz-form">
          <template #header>
            <div class="card-header">
              <h2>添加题目</h2>
            </div>
          </template>
          
          <el-form :model="quizForm" label-width="100px">
            <el-form-item label="题目类型">
              <el-select v-model="quizForm.type" placeholder="请选择题目类型">
                <el-option label="影像诊断" value="image" />
                <el-option label="文字题目" value="text" />
              </el-select>
            </el-form-item>

            <el-form-item label="题目">
              <el-input v-model="quizForm.question" type="textarea" :rows="3" placeholder="请输入题目内容" />
            </el-form-item>

            <el-form-item v-if="quizForm.type === 'image'" label="题目图片">
              <el-upload
                class="image-upload"
                action="#"
                :auto-upload="false"
                :show-file-list="true"
                :on-change="handleImageChange"
                accept="image/*"
              >
                <template #trigger>
                  <el-button type="primary">选择图片</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传 jpg/png 文件，且不超过 5MB
                  </div>
                </template>
              </el-upload>
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="题目图片预览" />
              </div>
            </el-form-item>
            
            <el-form-item 
              v-for="(option, index) in quizForm.options" 
              :key="index"
              :label="'选项 ' + String.fromCharCode(65 + index)"
            >
              <div class="option-input">
                <el-input v-model="quizForm.options[index]" placeholder="请输入选项内容" />
                <el-radio v-model="quizForm.correctAnswer" :label="index">正确答案</el-radio>
              </div>
            </el-form-item>

            <el-form-item label="解析">
              <el-input v-model="quizForm.explanation" type="textarea" :rows="3" placeholder="请输入题目解析" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit">添加题目</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="批量导入" name="batch">
        <el-card class="batch-import">
          <template #header>
            <div class="card-header">
              <h2>批量导入题目</h2>
            </div>
          </template>

          <div class="batch-content">
            <div class="template-download">
              <h3>1. 下载模板</h3>
              <el-button type="primary" @click="downloadTemplate">
                下载Excel模板
              </el-button>
              <p class="template-tip">请按照模板格式填写题目信息</p>
            </div>

            <div class="file-upload">
              <h3>2. 上传文件</h3>
              <el-upload
                class="excel-upload"
                action="#"
                :auto-upload="false"
                :show-file-list="true"
                :on-change="handleExcelChange"
                accept=".xlsx,.xls"
              >
                <template #trigger>
                  <el-button type="primary">选择Excel文件</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    只能上传 Excel 文件，且不超过 10MB
                  </div>
                </template>
              </el-upload>
            </div>

            <div class="image-upload-batch" v-if="hasExcelFile">
              <h3>3. 上传图片压缩包</h3>
              <el-upload
                class="zip-upload"
                action="#"
                :auto-upload="false"
                :show-file-list="true"
                :on-change="handleZipChange"
                accept=".zip"
              >
                <template #trigger>
                  <el-button type="primary">选择图片压缩包</el-button>
                </template>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传包含所有题目图片的ZIP压缩包，图片名称需要与Excel中的图片名称一致
                  </div>
                </template>
              </el-upload>
            </div>

            <el-button 
              type="success" 
              class="import-button"
              :disabled="!canImport"
              @click="handleBatchImport"
            >
              开始导入
            </el-button>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-card class="quiz-list">
      <template #header>
        <div class="card-header">
          <h2>题目列表</h2>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索题目..."
              class="search-input"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filterType" placeholder="题目类型" clearable>
              <el-option label="全部" value="" />
              <el-option label="影像诊断" value="image" />
              <el-option label="文字题目" value="text" />
            </el-select>
          </div>
        </div>
      </template>
      
      <el-table :data="filteredQuizList" style="width: 100%">
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.type === 'image' ? 'success' : 'info'">
              {{ scope.row.type === 'image' ? '影像诊断' : '文字题目' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="题目" show-overflow-tooltip />
        <el-table-column label="预览" width="100">
          <template #default="scope">
            <el-image
              v-if="scope.row.type === 'image' && scope.row.image"
              :src="scope.row.image"
              :preview-src-list="[scope.row.image]"
              fit="cover"
              class="table-image"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 编辑题目对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑题目"
      width="60%"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="题目类型">
          <el-tag>{{ editForm.type === 'image' ? '影像诊断' : '文字题目' }}</el-tag>
        </el-form-item>

        <el-form-item label="题目">
          <el-input v-model="editForm.question" type="textarea" :rows="3" />
        </el-form-item>

        <el-form-item v-if="editForm.type === 'image'" label="题目图片">
          <el-image
            v-if="editForm.image"
            :src="editForm.image"
            fit="contain"
            class="edit-image"
          />
          <el-upload
            class="image-upload"
            action="#"
            :auto-upload="false"
            :show-file-list="true"
            :on-change="handleEditImageChange"
            accept="image/*"
          >
            <el-button type="primary">更换图片</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item 
          v-for="(option, index) in editForm.options" 
          :key="index"
          :label="'选项 ' + String.fromCharCode(65 + index)"
        >
          <div class="option-input">
            <el-input v-model="editForm.options[index]" />
            <el-radio v-model="editForm.correctAnswer" :label="index">正确答案</el-radio>
          </div>
        </el-form-item>

        <el-form-item label="解析">
          <el-input v-model="editForm.explanation" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

export default {
  name: 'ManageQuiz',
  components: {
    Search
  },
  setup() {
    const activeTab = ref('single')
    const quizForm = ref({
      type: 'text',
      question: '',
      image: null,
      options: ['', '', '', ''],
      correctAnswer: null,
      explanation: ''
    })
    const imagePreview = ref('')
    const quizList = ref([])
    const searchQuery = ref('')
    const filterType = ref('')
    const editDialogVisible = ref(false)
    const editForm = ref({})
    const editIndex = ref(-1)
    const hasExcelFile = ref(false)
    const canImport = computed(() => hasExcelFile.value)

    // 过滤题目列表
    const filteredQuizList = computed(() => {
      return quizList.value.filter(quiz => {
        const matchesSearch = quiz.question.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesType = !filterType.value || quiz.type === filterType.value
        return matchesSearch && matchesType
      })
    })

    // 处理图片上传
    const handleImageChange = (file) => {
      const isImage = file.raw.type.startsWith('image/')
      const isLt5M = file.raw.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB！')
        return false
      }

      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target.result
        quizForm.value.image = e.target.result
      }
      reader.readAsDataURL(file.raw)
    }

    // 处理Excel文件上传
    const handleExcelChange = (file) => {
      const isExcel = file.raw.name.endsWith('.xlsx') || file.raw.name.endsWith('.xls')
      const isLt10M = file.raw.size / 1024 / 1024 < 10

      if (!isExcel) {
        ElMessage.error('只能上传Excel文件！')
        return false
      }
      if (!isLt10M) {
        ElMessage.error('文件大小不能超过 10MB！')
        return false
      }

      hasExcelFile.value = true
      // TODO: 处理Excel文件内容
    }

    // 处理ZIP文件上传
    const handleZipChange = (file) => {
      const isZip = file.raw.name.endsWith('.zip')
      const isLt50M = file.raw.size / 1024 / 1024 < 50

      if (!isZip) {
        ElMessage.error('只能上传ZIP文件！')
        return false
      }
      if (!isLt50M) {
        ElMessage.error('文件大小不能超过 50MB！')
        return false
      }

      // TODO: 处理ZIP文件内容
    }

    // 下载Excel模板
    const downloadTemplate = () => {
      // TODO: 实现模板下载功能
      ElMessage.success('模板下载功能待实现')
    }

    // 批量导入题目
    const handleBatchImport = () => {
      // TODO: 实现批量导入功能
      ElMessage.success('批量导入功能待实现')
    }

    const handleSubmit = () => {
      // 验证表单
      if (!quizForm.value.question.trim()) {
        ElMessage.warning('请输入题目内容')
        return
      }

      if (quizForm.value.type === 'image' && !quizForm.value.image) {
        ElMessage.warning('请上传题目图片')
        return
      }

      if (quizForm.value.options.some(opt => !opt.trim())) {
        ElMessage.warning('请填写所有选项')
        return
      }

      if (quizForm.value.correctAnswer === null) {
        ElMessage.warning('请选择正确答案')
        return
      }

      // 保存题目
      const newQuiz = {
        ...quizForm.value,
        options: [...quizForm.value.options]
      }

      // 获取现有题目
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      existingQuizzes.push(newQuiz)
      
      // 保存到本地存储
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes))
      
      // 更新列表
      quizList.value = existingQuizzes
      
      // 重置表单
      resetForm()
      
      ElMessage.success('题目添加成功')
    }

    const resetForm = () => {
      quizForm.value = {
        type: 'text',
        question: '',
        image: null,
        options: ['', '', '', ''],
        correctAnswer: null,
        explanation: ''
      }
      imagePreview.value = ''
    }

    const handleEdit = (row) => {
      editForm.value = { ...row }
      editIndex.value = quizList.value.indexOf(row)
      editDialogVisible.value = true
    }

    const handleSaveEdit = () => {
      if (editIndex.value > -1) {
        quizList.value[editIndex.value] = { ...editForm.value }
        localStorage.setItem('quizzes', JSON.stringify(quizList.value))
        editDialogVisible.value = false
        ElMessage.success('修改成功')
      }
    }

    const handleDelete = (index) => {
      quizList.value.splice(index, 1)
      localStorage.setItem('quizzes', JSON.stringify(quizList.value))
      ElMessage.success('题目删除成功')
    }

    const handleEditImageChange = (file) => {
      const isImage = file.raw.type.startsWith('image/')
      const isLt5M = file.raw.size / 1024 / 1024 < 5

      if (!isImage) {
        ElMessage.error('只能上传图片文件！')
        return false
      }
      if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB！')
        return false
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        editForm.value.image = e.target.result
      }
      reader.readAsDataURL(file.raw)
    }

    return {
      activeTab,
      quizForm,
      imagePreview,
      quizList,
      searchQuery,
      filterType,
      filteredQuizList,
      editDialogVisible,
      editForm,
      hasExcelFile,
      canImport,
      handleImageChange,
      handleExcelChange,
      handleZipChange,
      downloadTemplate,
      handleBatchImport,
      handleSubmit,
      resetForm,
      handleEdit,
      handleSaveEdit,
      handleDelete,
      handleEditImageChange
    }
  }
}
</script>

<style scoped>
.manage-quiz-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.quiz-form,
.batch-import {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 18px;
  color: #409EFF;
}

.option-input {
  display: flex;
  align-items: center;
  gap: 20px;
}

.option-input .el-input {
  flex: 1;
}

.el-radio {
  margin-right: 0;
}

.image-preview {
  margin-top: 10px;
  max-width: 300px;
}

.image-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-input {
  width: 200px;
}

.table-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
}

.edit-image {
  max-width: 300px;
  margin-bottom: 10px;
}

.batch-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.template-download,
.file-upload,
.image-upload-batch {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.template-tip {
  margin-top: 10px;
  color: #909399;
  font-size: 14px;
}

.import-button {
  align-self: flex-end;
  margin-top: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #606266;
  font-size: 16px;
}
</style> 