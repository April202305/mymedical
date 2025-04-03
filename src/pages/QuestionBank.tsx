import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Upload,
  Card,
  Row,
  Col,
  Statistic
} from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

interface Question {
  id: string;
  type: 'single' | 'multiple' | 'true-false' | 'fill';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
}

const QuestionBank: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取题目列表
  const fetchQuestions = async () => {
    try {
      // 这里应该调用后端 API 获取题目列表
      // 暂时使用模拟数据
      const mockQuestions: Question[] = [
        {
          id: '1',
          type: 'single',
          question: '示例题目',
          options: ['A', 'B', 'C', 'D'],
          answer: 'A',
          explanation: '示例解析',
          difficulty: 'medium',
          tags: ['示例标签']
        }
      ];
      setQuestions(mockQuestions);
    } catch (error) {
      message.error('获取题目列表失败：' + error.message);
    }
  };

  // 添加题目
  const addQuestion = async (question: Omit<Question, 'id'>) => {
    try {
      // 这里应该调用后端 API 添加题目
      // 暂时使用模拟数据
      const newQuestion: Question = {
        ...question,
        id: Date.now().toString()
      };
      setQuestions(prev => [...prev, newQuestion]);
    } catch (error) {
      message.error('添加题目失败：' + error.message);
      throw error;
    }
  };

  // 组件加载时获取题目列表
  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleImport = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // @ts-ignore
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);

          const questions = jsonData.map((row: any) => {
            // 验证题型
            const type = row['题型'];
            if (!['single', 'multiple', 'true-false', 'fill'].includes(type)) {
              throw new Error(`无效的题型: ${type}`);
            }

            // 验证必填字段
            if (!row['题目'] || !row['答案']) {
              throw new Error('题目和答案为必填项');
            }

            return {
              type: type as Question['type'],
              question: row['题目'],
              options: row['选项'] ? row['选项'].split('|') : [],
              answer: row['答案'],
              explanation: row['解析'] || '',
              difficulty: (row['难度'] || 'medium') as Question['difficulty'],
              tags: row['标签'] ? row['标签'].split('|') : []
            };
          });

          // 批量添加题目
          for (const question of questions) {
            await addQuestion(question);
          }

          message.success(`成功导入 ${questions.length} 道题目`);
          fetchQuestions();
        } catch (error) {
          message.error('导入失败：' + error.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      message.error('文件读取失败：' + error.message);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel';
      if (!isExcel) {
        message.error('只能上传 Excel 文件！');
        return false;
      }
      handleImport(file);
      return false;
    },
    showUploadList: false,
  };

  return (
    <div className="p-6">
      <Card className="mb-6">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic title="总题目数" value={questions.length} />
          </Col>
          <Col span={6}>
            <Statistic title="单选题" value={questions.filter(q => q.type === 'single').length} />
          </Col>
          <Col span={6}>
            <Statistic title="多选题" value={questions.filter(q => q.type === 'multiple').length} />
          </Col>
          <Col span={6}>
            <Statistic title="判断题" value={questions.filter(q => q.type === 'true-false').length} />
          </Col>
        </Row>
      </Card>

      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Button type="primary" onClick={() => setModalVisible(true)} icon={<PlusOutlined />}>
            添加题目
          </Button>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>批量导入</Button>
          </Upload>
          <Button icon={<DownloadOutlined />}>导出题库</Button>
        </Space>
      </div>

      <Table
        dataSource={questions}
        columns={[
          {
            title: '题目',
            dataIndex: 'question',
            key: 'question',
          },
          {
            title: '题型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
              const typeMap = {
                'single': '单选题',
                'multiple': '多选题',
                'true-false': '判断题',
                'fill': '填空题'
              };
              return typeMap[type] || type;
            }
          },
          {
            title: '难度',
            dataIndex: 'difficulty',
            key: 'difficulty',
            render: (difficulty: string) => {
              const difficultyMap = {
                'easy': '简单',
                'medium': '中等',
                'hard': '困难'
              };
              return difficultyMap[difficulty] || difficulty;
            }
          },
          {
            title: '操作',
            key: 'action',
            render: (_, record) => (
              <Space>
                <Button type="link">编辑</Button>
                <Button type="link" danger>删除</Button>
              </Space>
            ),
          },
        ]}
        rowKey="id"
      />
    </div>
  );
};

export default QuestionBank; 