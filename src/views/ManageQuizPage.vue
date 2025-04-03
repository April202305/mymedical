<template>
  <div class="manage-quiz">
    <el-card class="mb-6">
      <el-row :gutter="16">
        <el-col :span="6">
          <el-statistic title="总题目数" :value="questions.length" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="单选题" :value="questions.filter(q => q.type === 'single').length" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="多选题" :value="questions.filter(q => q.type === 'multiple').length" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="判断题" :value="questions.filter(q => q.type === 'true-false').length" />
        </el-col>
      </el-row>
    </el-card>

    <div class="mb-4 flex justify-between items-center">
      <el-space>
        <el-button type="primary" @click="showAddModal = true">
          <el-icon><Plus /></el-icon>
          添加题目
        </el-button>
        <el-upload
          class="upload-demo"
          action="#"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleImport"
          accept=".csv,.xlsx,.xls"
        >
          <el-button>
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
        </el-upload>
        <el-button @click="downloadTemplate">
          <el-icon><Download /></el-icon>
          下载导入模板
        </el-button>
        <el-button 
          type="danger" 
          :disabled="selectedQuestions.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </el-space>
      <div v-if="selectedQuestions.length > 0" class="selected-count">
        已选择 {{ selectedQuestions.length }} 道题目
      </div>
        </div>

    <el-table 
      :data="questions" 
      style="width: 100%"
      @selection-change="selectedQuestions = $event"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="question" label="题目" />
      <el-table-column prop="type" label="题型">
        <template #default="{ row }">
          {{ typeMap[row.type] }}
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度">
        <template #default="{ row }">
          {{ difficultyMap[row.difficulty] }}
        </template>
      </el-table-column>
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <template v-if="row.images && row.images.length > 0">
            <img 
              :src="row.images[0]" 
              class="thumbnail"
              @click="handlePreviewImages(row.images)"
              @error="handleImageLoadError"
              alt="题目图片"
            />
          </template>
          <span v-else>无</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-space>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </el-space>
      </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑题目对话框 -->
    <el-dialog
      v-model="showAddModal"
      :title="editingQuestion ? '编辑题目' : '添加题目'"
      width="60%"
    >
      <el-form :model="questionForm" label-width="100px">
        <el-form-item label="题目类型">
          <el-select v-model="questionForm.type">
            <el-option label="单选题" value="single" />
            <el-option label="多选题" value="multiple" />
            <el-option label="判断题" value="true-false" />
            <el-option label="填空题" value="fill" />
            <el-option label="问答题" value="essay" />
          </el-select>
        </el-form-item>
        <el-form-item label="所属专业">
          <el-input v-model="questionForm.major" />
        </el-form-item>
        <el-form-item label="所属分支">
          <el-input v-model="questionForm.subMajor" />
        </el-form-item>
        <el-form-item label="题目内容">
          <el-input v-model="questionForm.question" type="textarea" />
        </el-form-item>

        <el-form-item label="题目图片">
          <el-upload
            class="question-img-uploader"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            :file-list="questionImagesFileList"
            :on-change="handleQuestionImageChange"
            :on-remove="handleQuestionImageRemove"
            multiple
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">题目图片将显示在题目文本下方</div>
        </el-form-item>

        <el-form-item label="选项" v-if="questionForm.type !== 'fill' && questionForm.type !== 'essay'">
          <div v-for="(option, index) in optionsList" :key="index" class="option-item">
            <el-input
              v-model="option.text"
              placeholder="选项内容"
              class="option-input"
            >
              <template #prefix>
                <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
              </template>
            </el-input>
            
            <el-upload
              class="option-img-uploader"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="(file) => handleOptionImageChange(file, index)"
            >
              <el-button v-if="!option.image" type="success" circle plain>
                <el-icon><Plus /></el-icon>
              </el-button>
              <el-image 
                v-else 
                :src="option.image" 
                fit="cover"
                class="option-thumbnail"
              />
            </el-upload>
            
            <el-button
              v-if="index > 1" 
              type="danger"
              circle
              @click="removeOption(index)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          
          <el-button type="primary" plain class="mt-2" @click="addOption">
            <el-icon><Plus /></el-icon>
            添加选项
          </el-button>
        </el-form-item>

        <el-form-item label="正确答案">
          <el-checkbox-group 
            v-model="selectedAnswers"
            v-if="questionForm.type === 'multiple'"
          >
            <el-checkbox 
              v-for="(_, index) in optionsList" 
              :key="index" 
              :label="String.fromCharCode(65 + index)"
            >
              {{ String.fromCharCode(65 + index) }}
            </el-checkbox>
          </el-checkbox-group>
          
          <el-radio-group 
            v-model="selectedAnswer"
            v-else-if="questionForm.type === 'single'"
          >
            <el-radio
              v-for="(_, index) in optionsList" 
              :key="index"
              :label="String.fromCharCode(65 + index)"
            >
              {{ String.fromCharCode(65 + index) }}
            </el-radio>
          </el-radio-group>
          
          <el-radio-group 
            v-model="selectedAnswer"
            v-else-if="questionForm.type === 'true-false'"
          >
            <el-radio label="true">正确</el-radio>
            <el-radio label="false">错误</el-radio>
          </el-radio-group>
          
          <el-input 
            v-else
            v-model="questionForm.answer" 
            :placeholder="questionForm.type === 'fill' ? '填空题答案' : '问答题参考答案'"
            :type="questionForm.type === 'essay' ? 'textarea' : 'text'"
          />
        </el-form-item>

        <el-form-item label="解析说明">
          <el-input v-model="questionForm.explanation" type="textarea" />
        </el-form-item>

        <el-form-item label="难度系数">
          <el-select v-model="questionForm.difficulty">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-input
            v-model="questionForm.tags"
            type="textarea"
            placeholder="使用 | 分隔多个标签"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddModal = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- 图片预览 -->
    <el-dialog v-model="showImagePreview" title="图片预览" width="70%">
      <div class="image-preview-container">
        <el-carousel :autoplay="false" indicator-position="outside" height="500px">
          <el-carousel-item v-for="(image, index) in previewImages" :key="index">
          <el-image
              :src="image" 
            fit="contain"
              class="preview-image"
            />
          </el-carousel-item>
        </el-carousel>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Upload, Download, Delete } from '@element-plus/icons-vue'
import { 
  getQuestions, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  batchImportQuestions,
  batchDeleteQuestions
} from '../services/quiz.js'
import { uploadImage } from '../services/upload.js'

const questions = ref([])
const showAddModal = ref(false)
const editingQuestion = ref(null)
const selectedQuestions = ref([])
const loading = ref(false)
const questionForm = ref({
  type: 'single',
  question: '',
  major: '',
  subMajor: '',
  images: [],
  options: [],
  answer: '',
  explanation: '',
  difficulty: 'medium',
  tags: ''
})

const questionImagesFileList = ref([])
const optionsList = ref([
  { text: '', image: '' },
  { text: '', image: '' }
])
const selectedAnswer = ref('')
const selectedAnswers = ref([])

const showImagePreview = ref(false)
const previewImages = ref([])

const typeMap = {
  'single': '单选题',
  'multiple': '多选题',
  'true-false': '判断题',
  'fill': '填空题',
  'essay': '问答题'
}

const difficultyMap = {
  'easy': '简单',
  'medium': '中等',
  'hard': '困难'
}

// 监听题型变化，重置选项和答案
watch(() => questionForm.value.type, (newType) => {
  if (newType === 'single' || newType === 'multiple') {
    if (optionsList.value.length < 2) {
      optionsList.value = [
        { text: '', image: '' },
        { text: '', image: '' }
      ]
    }
  } else if (newType === 'true-false') {
    optionsList.value = [
      { text: '正确', image: '' },
      { text: '错误', image: '' }
    ]
  } else if (newType === 'fill' || newType === 'essay') {
    // 填空题和问答题不需要选项
    optionsList.value = []
  }
  
  selectedAnswer.value = ''
  selectedAnswers.value = []
})

// 获取题目列表
const fetchQuestions = async () => {
  try {
    const response = await getQuestions()
    console.log('从服务器获取的题目数据:', response)
    if (response.data && Array.isArray(response.data)) {
      questions.value = response.data.map(q => ({
        ...q,
        optionImages: q.optionImages || [], // 确保optionImages存在
        _id: q._id || q.id, // 确保_id存在
        id: q._id || q.id  // 确保id存在
      }))
      console.log('处理后的题目数据:', questions.value)
    } else if (response.success && Array.isArray(response.data)) {
      questions.value = response.data.map(q => ({
        ...q,
        optionImages: q.optionImages || [], // 确保optionImages存在
        _id: q._id || q.id, // 确保_id存在
        id: q._id || q.id  // 确保id存在
      }))
      console.log('处理后的题目数据:', questions.value)
    } else {
      console.error('获取到的题目数据格式不正确:', response)
      ElMessage.warning('获取题目数据格式不正确')
    }
  } catch (error) {
    console.error('获取题目列表错误详情:', error)
    ElMessage.error('获取题目列表失败：' + (error.response?.data?.message || error.message))
  }
}

// 添加选项
const addOption = () => {
  if (optionsList.value.length < 6) {
    optionsList.value.push({ text: '', image: '' })
  } else {
    ElMessage.warning('最多只能添加6个选项')
  }
}

// 删除选项
const removeOption = (index) => {
  if (optionsList.value.length > 2) {
    optionsList.value.splice(index, 1)
    
    // 更新答案
    if (questionForm.value.type === 'single') {
      if (selectedAnswer.value === String.fromCharCode(65 + index)) {
        selectedAnswer.value = ''
      } else if (selectedAnswer.value > String.fromCharCode(65 + index)) {
        selectedAnswer.value = String.fromCharCode(selectedAnswer.value.charCodeAt(0) - 1)
      }
    } else if (questionForm.value.type === 'multiple') {
      selectedAnswers.value = selectedAnswers.value.filter(a => {
        if (a === String.fromCharCode(65 + index)) return false
        if (a > String.fromCharCode(65 + index)) {
          return String.fromCharCode(a.charCodeAt(0) - 1)
        }
        return a
      })
    }
  } else {
    ElMessage.warning('至少需要保留2个选项')
  }
}

// 处理题目图片上传
const handleQuestionImageChange = async (file) => {
  try {
    if (!file.url && file.raw) {  // 确保只处理原始文件
      // 如果是编辑模式，使用现有题目的ID
      const quizId = editingQuestion.value?._id || editingQuestion.value?.id;
      
      console.log('开始上传图片，文件大小:', file.raw.size);
      console.log('关联题目ID:', quizId);
      
      const response = await uploadImage(file.raw, quizId);
      console.log('图片上传响应:', response);
      
  if (response.success) {
        // 使用服务器返回的URL，这将是新的GridFS格式
        const serverUrl = response.data.url;
        console.log('服务器返回的图片URL:', serverUrl);
        
        // 检查文件是否已存在
        const exists = questionImagesFileList.value.some(f => f.uid === file.uid);
        if (!exists) {
          questionImagesFileList.value.push({
            uid: file.uid,
            name: file.name,
            status: 'success',
            url: serverUrl,  // GridFS URL格式: /api/image/[fileId]
            fileId: response.data.id, // 保存文件ID便于后续操作
            quizId: response.data.quizId,
            raw: null  // 不再保留原始文件引用
          });
        }
  } else {
        ElMessage.error('图片上传失败：' + response.message);
      }
    } else if (file.url) {
      // 已有URL的文件，直接添加到列表
      console.log('使用已有URL的图片:', file.url);
      const exists = questionImagesFileList.value.some(f => f.uid === file.uid);
      if (!exists) {
        questionImagesFileList.value.push({
          uid: file.uid,
          name: file.name || '图片',
          status: 'success',
          url: file.url
        });
      }
    }
  } catch (error) {
    console.error('图片上传错误:', error);
    ElMessage.error('图片上传失败：' + error.message);
  }
}

// 处理题目图片移除
const handleQuestionImageRemove = (file) => {
  const index = questionImagesFileList.value.findIndex(f => f.uid === file.uid)
  if (index !== -1) {
    questionImagesFileList.value.splice(index, 1)
  }
}

// 处理选项图片上传
const handleOptionImageChange = async (file, optionIndex) => {
  try {
    if (!file.url && file.raw) {
      // 如果是编辑模式，使用现有题目的ID
      const quizId = editingQuestion.value?._id || editingQuestion.value?.id;
      
      console.log('开始上传选项图片，索引:', optionIndex, '文件大小:', file.raw.size);
      console.log('关联题目ID:', quizId);
      
      const response = await uploadImage(file.raw, quizId);
      console.log('选项图片上传响应:', response);
      
      if (response.success) {
        const serverUrl = response.data.url;
        console.log('服务器返回的选项图片URL:', serverUrl);
        
        // 保存图片URL和文件引用
        optionsList.value[optionIndex].image = serverUrl;
        optionsList.value[optionIndex].fileId = response.data.id; // 保存文件ID
        optionsList.value[optionIndex].quizId = response.data.quizId;
        optionsList.value[optionIndex].imageFile = null; // 不再保留原始文件引用
      } else {
        ElMessage.error('选项图片上传失败：' + response.message);
      }
    } else if (file.url) {
      console.log('使用已有URL的选项图片:', file.url);
      optionsList.value[optionIndex].image = file.url;
    }
  } catch (error) {
    console.error('选项图片上传错误:', error);
    ElMessage.error('选项图片上传失败：' + error.message);
  }
}

// 处理图片预览
const handlePreviewImages = (images) => {
  previewImages.value = images
  showImagePreview.value = true
}

// 解析 CSV 文件
const parseCSV = (text) => {
  try {
    const lines = text.split('\n')
    if (lines.length < 2) {
      throw new Error('CSV 文件格式错误，至少需要一个标题行和一个数据行')
    }
    
    // 获取标题行，处理可能的 BOM 标记
    let headersLine = lines[0]
    if (headersLine.charCodeAt(0) === 0xFEFF) {
      headersLine = headersLine.substring(1)
    }
    const headers = headersLine.split(',').map(header => header.trim())
    
    // 查找必要的列索引
    const majorIndex = headers.findIndex(h => h === '所属专业')
    const subMajorIndex = headers.findIndex(h => h === '所属专业分支')
    const difficultyIndex = headers.findIndex(h => h === '难度系数')
    const typeIndex = headers.findIndex(h => h === '题目类型')
    const contentIndex = headers.findIndex(h => h === '题目内容')
    const optionAIndex = headers.findIndex(h => h === '选项A')
    const optionBIndex = headers.findIndex(h => h === '选项B')
    const optionCIndex = headers.findIndex(h => h === '选项C')
    const optionDIndex = headers.findIndex(h => h === '选项D')
    const answerIndex = headers.findIndex(h => h === '正确答案')
    const explanationIndex = headers.findIndex(h => h === '解析说明')
    const tagsIndex = headers.findIndex(h => h === '标签')
    
    console.log('CSV 标题行:', headers)
    console.log('列索引:', { typeIndex, contentIndex, answerIndex })
    
    if (typeIndex === -1 || contentIndex === -1 || answerIndex === -1) {
      throw new Error('CSV 文件必须包含题目类型、题目内容和正确答案列，请检查标题行格式')
    }
    
    // 解析数据行
    const data = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue // 跳过空行
      
      // 处理引号中的逗号
      let row = lines[i]
      let inQuotes = false
      let processedValues = []
      let currentValue = ''
      
      for (let j = 0; j < row.length; j++) {
        const char = row[j]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          processedValues.push(currentValue.trim())
          currentValue = ''
        } else {
          currentValue += char
        }
      }
      processedValues.push(currentValue.trim())
      
      // 确保有足够的列
      while (processedValues.length < headers.length) {
        processedValues.push('')
      }
      
      const questionType = processedValues[typeIndex].toLowerCase()
      const questionContent = processedValues[contentIndex]
      const answer = processedValues[answerIndex]
      
      // 处理难度
      let difficulty = 'medium'
      if (difficultyIndex !== -1) {
        const diffValue = processedValues[difficultyIndex]
        if (diffValue === '1') difficulty = 'easy'
        else if (diffValue === '2') difficulty = 'medium'
        else if (diffValue === '3') difficulty = 'hard'
      }
      
      // 处理选项
      const options = []
      if (optionAIndex !== -1 && processedValues[optionAIndex]) 
        options.push(processedValues[optionAIndex])
      if (optionBIndex !== -1 && processedValues[optionBIndex]) 
        options.push(processedValues[optionBIndex])
      if (optionCIndex !== -1 && processedValues[optionCIndex]) 
        options.push(processedValues[optionCIndex])
      if (optionDIndex !== -1 && processedValues[optionDIndex]) 
        options.push(processedValues[optionDIndex])
      
      // 确定题型
      let type = 'fill' // 默认为填空
      if (questionType.includes('单选')) type = 'single'
      else if (questionType.includes('多选')) type = 'multiple'
      else if (questionType.includes('判断')) type = 'true-false'
      else if (questionType.includes('问答')) type = 'essay'
      
      // 处理答案格式
      let processedAnswer = answer
      if (type === 'true-false') {
        processedAnswer = answer === '对' || answer === '正确' ? 'true' : 'false'
      }
      
      // 验证必填字段
      if (!questionContent) {
        throw new Error(`第 ${i + 1} 行: 题目内容为必填项`)
      }
      
      // 处理标签
      const tags = []
      if (majorIndex !== -1 && processedValues[majorIndex])
        tags.push(processedValues[majorIndex])
      if (subMajorIndex !== -1 && processedValues[subMajorIndex])
        tags.push(processedValues[subMajorIndex])
      if (tagsIndex !== -1 && processedValues[tagsIndex])
        tags.push(...processedValues[tagsIndex].split('|'))
      
      data.push({
        type,
        question: questionContent,
        options,
        optionImages: [],
        answer: processedAnswer,
        explanation: explanationIndex !== -1 ? processedValues[explanationIndex] || '' : '',
        difficulty,
        tags: tags.filter(Boolean)
      })
    }
    
    if (data.length === 0) {
      throw new Error('CSV 文件中没有有效的题目数据')
    }
    
    console.log('解析的题目数据:', data)
    return data
  } catch (error) {
    console.error('CSV 解析错误:', error)
    throw error
  }
}

// 处理导入
const handleImport = async (file) => {
  try {
    console.log('选择的文件:', file)
    const fileName = file.name || ''
    const fileType = file.raw?.type || ''
    
    // 检查文件类型 - 支持CSV和Excel
    const isCSV = fileType === 'text/csv' || fileName.toLowerCase().endsWith('.csv')
    const isExcel = fileType === 'application/vnd.ms-excel' || 
                  fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  fileName.toLowerCase().endsWith('.xlsx') || 
                  fileName.toLowerCase().endsWith('.xls')
    
    if (!isCSV && !isExcel) {
      ElMessage.error(`只能上传 CSV 或 Excel 文件！当前文件类型: ${fileType}`)
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const text = e.target.result
        console.log('读取的文件内容长度:', text.length)
        
        if (!text || text.length === 0) {
          ElMessage.error('文件为空')
          return
        }
        
        // 显示导入中提示
        const loadingMsg = ElMessage({
          type: 'info',
          message: '导入中，请稍候...',
          duration: 0
        })
        
        try {
          const importedQuestions = parseCSV(text)
          
          if (importedQuestions.length === 0) {
            loadingMsg.close()
            ElMessage.warning('没有找到有效的题目数据')
            return
          }
          
          // 批量添加题目
          const response = await batchImportQuestions(importedQuestions)
          
          // 关闭导入提示
          loadingMsg.close()

          if (response.success && response.data) {
            // 添加新导入的题目到列表中
            const newQuestions = response.data.map(q => ({
              ...q,
              _id: q._id,
              id: q._id,
              optionImages: q.optionImages || []
            }));
            questions.value.push(...newQuestions);
            ElMessage.success(`成功导入 ${newQuestions.length} 道题目`);
    } else {
            throw new Error(response.message || '导入失败');
          }
        } catch (error) {
          // 关闭导入提示
          loadingMsg.close()
          ElMessage.error('导入失败：' + (error.response?.data?.message || error.message))
          console.error('导入错误详情:', error)
        }
      } catch (error) {
        ElMessage.error('解析文件失败：' + error.message)
        console.error('解析错误详情:', error)
      }
    }
    
    reader.onerror = (error) => {
      ElMessage.error('读取文件失败：' + error)
      console.error('文件读取错误:', error)
    }
    
    reader.readAsText(file.raw)
  } catch (error) {
    ElMessage.error('文件处理失败：' + error.message)
    console.error('文件处理错误详情:', error)
  }
}

// 处理表单提交
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // 准备数据
    const formData = {
      type: questionForm.value.type,
      question: questionForm.value.question,
      explanation: questionForm.value.explanation,
      difficulty: questionForm.value.difficulty
    };
    
    // 处理标签 - 专业和分支作为前两个标签
    const tagsList = []
    if (questionForm.value.major) tagsList.push(questionForm.value.major)
    if (questionForm.value.subMajor) tagsList.push(questionForm.value.subMajor)
    if (questionForm.value.tags) {
      tagsList.push(...questionForm.value.tags.split('|').filter(Boolean))
    }
    formData.tags = tagsList;
    
    // 处理答案根据题型
    if (questionForm.value.type === 'single') {
      formData.options = optionsList.value.map(o => o.text);
      formData.answer = selectedAnswer.value;
    } else if (questionForm.value.type === 'multiple') {
      formData.options = optionsList.value.map(o => o.text);
      formData.answer = selectedAnswers.value.join(',');
    } else if (questionForm.value.type === 'true-false') {
      formData.answer = selectedAnswer.value;
    } else if (questionForm.value.type === 'fill' || questionForm.value.type === 'essay') {
      formData.answer = questionForm.value.answer;
    }
    
    let response;
    let newQuestionId;
    
    // 根据是否编辑模式确定处理方式
    if (editingQuestion.value) {
      // 更新题目
      const questionId = editingQuestion.value._id || editingQuestion.value.id;
      console.log('正在更新题目:', questionId);
      if (!questionId) {
        throw new Error('题目ID不存在，无法更新');
      }
      
      // 收集现有图片
      formData.images = questionImagesFileList.value
        .filter(file => file.status === 'success' || file.url)
        .map(file => file.url);
      
      // 收集选项图片
      formData.optionImages = optionsList.value
        .map(option => option.image || '');
      
      response = await updateQuestion(questionId, formData);
      
      if (response.success) {
        // 找到并更新本地列表中的题目
        const index = questions.value.findIndex(q => 
          (q._id && q._id === questionId) || (q.id && q.id === questionId)
        );
        if (index !== -1) {
          // 确保包含_id和id
          const updatedQuestion = {
            ...response.data,
            _id: response.data._id || questionId,
            id: response.data.id || questionId
          };
          questions.value[index] = updatedQuestion;
        }
        ElMessage.success('题目更新成功');
      } else {
        throw new Error(response.message || '更新失败');
      }
    } else {
      // 先处理必要的文本数据，创建题目获取ID
      // 暂时不包含图片信息
      response = await createQuestion(formData);
      
      if (!response.success) {
        throw new Error(response.message || '创建题目失败');
      }
      
      // 获取新创建的题目ID
      newQuestionId = response.data._id || response.data.id;
      console.log('新创建的题目ID:', newQuestionId);
      
      // 如果有图片需要上传，现在再上传并关联
      if (questionImagesFileList.value.length > 0 || optionsList.value.some(o => o.image)) {
        // 重新上传题目图片并关联ID
        const imagePromises = questionImagesFileList.value
          .filter(file => file.status === 'success' && !file.quizId && file.raw)
          .map(async file => {
            try {
              const uploadResponse = await uploadImage(file.raw, newQuestionId);
              return uploadResponse.success ? uploadResponse.data.url : file.url;
            } catch (error) {
              console.error('重新上传图片错误:', error);
              return file.url;
            }
          });
        
        // 重新上传选项图片并关联ID
        const optionImagesPromises = optionsList.value
          .filter(option => option.image && !option.quizId && option.imageFile)
          .map(async (option, index) => {
            try {
              const uploadResponse = await uploadImage(option.imageFile, newQuestionId);
              optionsList.value[index].image = uploadResponse.success ? uploadResponse.data.url : option.image;
              return uploadResponse.success ? uploadResponse.data.url : option.image;
            } catch (error) {
              console.error('重新上传选项图片错误:', error);
              return option.image;
            }
          });
        
        // 等待所有图片上传完成
        await Promise.all([...imagePromises, ...optionImagesPromises]);
        
        // 更新题目，添加图片信息
        const imageUpdateData = {
          images: questionImagesFileList.value
            .filter(file => file.status === 'success' || file.url)
            .map(file => file.url),
          optionImages: optionsList.value.map(option => option.image || '')
        };
        
        // 更新题目的图片信息
        await updateQuestion(newQuestionId, imageUpdateData);
      }
      
      // 添加新创建的题目到列表
      const newQuestion = {
        ...response.data,
        _id: newQuestionId,
        id: newQuestionId
      };
      
      questions.value.unshift(newQuestion);
      ElMessage.success('题目添加成功');
    }
    
    showAddModal.value = false;
    resetForm();
  } catch (error) {
    console.error('表单提交错误:', error);
    ElMessage.error('提交失败: ' + (error.message || error));
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  questionForm.value = {
    type: 'single',
    question: '',
    major: '',
    subMajor: '',
    answer: '',
    explanation: '',
    difficulty: 'medium',
    tags: ''
  }
  questionImagesFileList.value = []
  optionsList.value = [
    { text: '', image: '' },
    { text: '', image: '' }
  ]
  selectedAnswer.value = ''
  selectedAnswers.value = []
}

// 添加下载示例文件功能
const downloadTemplate = () => {
  const csvContent = `试题编ID,所属专业,所属专业分支,难度系数,题目类型,题目内容,选项A,选项B,选项C,选项D,正确答案,解析说明,标签
123456,医学,内科,1,单选题,这是一道单选题的题目,正确选项,错误选项1,错误选项2,错误选项3,A,这是解析内容,常见病
234567,医学,外科,2,多选题,这是一道多选题,正确选项1,正确选项2,错误选项1,错误选项2,AB,注意有多个正确答案,手术
345678,医学,病理学,3,判断题,这是一道判断题。以下说法是否正确?,,,,,对,请注意题干表述,基础医学
456789,医学,急诊医学,2,填空题,这是一道填空题。请简述___的处理流程,,,,,急救流程,填写关键词即可,急救知识
567890,医学,影像学,1,问答题,描述所示的异常情况,,,,,肺部感染的特征性表现,关注关键区域,临床诊断`
  
  // 创建Blob对象
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  
  // 创建下载链接
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  // 设置下载属性
  link.setAttribute('href', url)
  link.setAttribute('download', '题库导入模板.csv')
  
  // 添加到文档并触发点击
  document.body.appendChild(link)
  link.click()
  
  // 清理
  setTimeout(() => {
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, 100)
}

// 处理图片加载错误
const handleImageLoadError = (e) => {
  const imgSrc = e.target?.src || '';
  console.error('图片加载失败:', imgSrc);
  // 输出完整的错误对象
  console.log('错误事件对象:', e);
  
  // 检查是否是旧的文件系统URL
  if (imgSrc.includes('/uploads/')) {
    console.warn('检测到旧的文件系统URL格式，图片可能已迁移到GridFS');
  }
  
  // 使用默认图片替换
  if (e.target) {
    // 使用内联base64图片替代，避免再次加载失败
    e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAABmJLR0QA/wD/AP+gvaeTAAAA4klEQVR4nO3aQQqDMBBAUff3sN6hh7ClkILQMZV5b58kkGTxJykAAAAAAAAAAJztah5/r8d5PJvnA0mQmCAxyX+Ist7Z85/3H/3hJc/7PB+2RnVGyNrFTJL1YvZMpYIsZYwPQTLvMc97TCVISJCYIFF3I+Lftt6jvmfcLGC1NWs7Qra+12tnQpsjQTJNkJAgMUFigsQEiQkSEyQmSEyQmCAxQWKCxASJCRITJCZITJCYIDFBYoLEBIkJEhMkJkhMkJggMUFigsQEid0NufrbWr/L+lKQmCAxQWKCxASJCRITJAYAAAAAAABw3gtn3x6FYzND5QAAAABJRU5ErkJggg=='
  }
}

// 批量删除题目
const handleBatchDelete = async () => {
  try {
    if (selectedQuestions.value.length === 0) {
      ElMessage.warning('请先选择要删除的题目')
      return
    }

    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    const ids = selectedQuestions.value.map(q => q._id || q.id)
    const response = await batchDeleteQuestions(ids)

    if (response.success) {
      questions.value = questions.value.filter(q => !ids.includes(q._id || q.id))
      selectedQuestions.value = []
      ElMessage.success(response.message || '批量删除成功')
    } else {
      throw new Error(response.message || '批量删除失败')
    }
  } catch (error) {
    if (error.toString().includes('cancel')) return
    console.error('批量删除错误:', error)
    ElMessage.error('批量删除失败：' + (error.response?.data?.message || error.message))
  }
}

// 设置表单答案
const setFormAnswer = (answer) => {
  if (questionForm.value.type === 'single') {
    selectedAnswer.value = answer
  } else if (questionForm.value.type === 'multiple') {
    selectedAnswers.value = answer.split(',')
  } else if (questionForm.value.type === 'true-false') {
    selectedAnswer.value = answer
  } else if (questionForm.value.type === 'fill' || questionForm.value.type === 'essay') {
    questionForm.value.answer = answer
  }
}

// 编辑题目
const handleEdit = (row) => {
  editingQuestion.value = row
  
  // 设置选项列表
  optionsList.value = []
  if (row.options && row.options.length > 0) {
    row.options.forEach((option, index) => {
      optionsList.value.push({
        text: option,
        image: row.optionImages && row.optionImages[index] ? row.optionImages[index] : ''
      })
    })
  } else if (row.type === 'true-false') {
    optionsList.value = [
      { text: '正确', image: '' },
      { text: '错误', image: '' }
    ]
  } else {
    optionsList.value = [
      { text: '', image: '' },
      { text: '', image: '' }
    ]
  }
  
  // 设置题目图片
  questionImagesFileList.value = []
  if (row.images && row.images.length > 0) {
    row.images.forEach((img, index) => {
      questionImagesFileList.value.push({
        uid: `-${index + 1}`,
        name: `image-${index + 1}.jpg`,
        status: 'success',
        url: img
      })
    })
  }
  
  // 提取专业和分支信息
  let major = ''
  let subMajor = ''
  if (row.tags && row.tags.length > 0) {
    major = row.tags[0] || ''
    subMajor = row.tags[1] || ''
  }
  
  // 设置表单数据
  questionForm.value = {
    type: row.type,
    question: row.question,
    major,
    subMajor,
    answer: row.answer,
    explanation: row.explanation || '',
    difficulty: row.difficulty || 'medium',
    tags: row.tags && row.tags.length > 2 ? row.tags.slice(2).join('|') : ''
  }
  
  // 设置答案选择状态
  setFormAnswer(row.answer)
  
  showAddModal.value = true
}

// 删除题目
const handleDelete = async (row) => {
  try {
    console.log('删除题目:', row);
    // MongoDB用_id作为主键，而不是id
    const questionId = row._id || row.id;
    if (!questionId) {
      ElMessage.error('题目ID不存在');
      console.error('缺少题目ID:', row);
      return;
    }

    const response = await deleteQuestion(questionId);
    if (response.success) {
      questions.value = questions.value.filter(q => {
        const currentId = q._id || q.id;
        return currentId !== questionId;
      });
      ElMessage.success('删除成功');
    } else {
      throw new Error(response.message || '删除失败');
    }
  } catch (error) {
    console.error('删除错误:', error);
    ElMessage.error('删除失败：' + (error.response?.data?.message || error.message));
  }
}

onMounted(() => {
  fetchQuestions()
})
</script>

<style scoped>
.manage-quiz {
  padding: 20px;
}

.mb-6 {
  margin-bottom: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

.mt-2 {
  margin-top: 8px;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  cursor: pointer;
  border-radius: 4px;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.option-input {
  flex: 1;
}

.option-label {
  font-weight: bold;
  margin-right: 5px;
}

.option-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.image-preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.selected-count {
  color: #409EFF;
  font-size: 14px;
}
</style> 