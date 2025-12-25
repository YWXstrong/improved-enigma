## 模块概述

任务看板模块是一个基于看板方法的任务管理系统，集成在团队协作平台中。该模块提供了完整的任务管理功能，包括创建、编辑、删除、分配、搜索、筛选和状态拖拽等功能。

## 技术架构

### 前端技术栈

- **React 18** - 前端框架
    
- **React Hooks** - 状态管理
    
- **Axios** - HTTP请求库
    
- **CSS3** - 样式设计
    

### 后端技术栈

- **Flask** - Python后端框架
    
- **SQLAlchemy** - ORM数据库操作
    
- **SQLite** - 数据库
    

## 核心功能模块

### 1. 任务创建与编辑

**功能描述**：用户可创建新任务，包含标题、描述、优先级、截止日期、分配给成员等信息。

**关键组件**：

- `TaskForm` - 任务表单组件
    
- `handleTaskSubmit` - 任务提交处理函数
    

**主要逻辑**：

- 使用受控表单组件收集用户输入
    
- 表单验证确保必填字段完整
    
- 根据编辑/创建模式调用不同API端点
    

### 2. 任务状态管理

**功能描述**：通过拖拽方式改变任务状态（待处理→进行中→审核中→已完成）。

**关键状态**：

javascript

const taskStatusColumns = [
  { id: 'todo', title: '待处理', color: '#FF6B6B' },
  { id: 'in_progress', title: '进行中', color: '#4ECDC4' },
  { id: 'review', title: '审核中', color: '#FFD166' },
  { id: 'done', title: '已完成', color: '#06D6A0' }
];

**拖拽逻辑**：

- `handleDragStart` - 记录被拖拽的任务
    
- `handleDragOver` - 防止默认拖拽行为
    
- `handleDrop` - 在目标状态列放下时更新任务状态
    

### 3. 任务分配系统

**功能描述**：将任务分配给项目成员，支持未分配状态。

**实现逻辑**：

- 从项目成员列表中获取可分配用户
    
- 使用下拉选择框进行任务分配
    
- 前端显示分配者头像和姓名
    

### 4. 任务筛选与搜索

**功能描述**：提供多维度的任务筛选和搜索功能。

**筛选维度**：

- **优先级筛选**：低、中、高、紧急
    
- **分配者筛选**：按项目成员筛选
    
- **关键词搜索**：标题和描述全文搜索
    

**关键函数**：

javascript

const getFilteredTasks = () => {
  return tasks.filter(task => {
    // 搜索筛选
    const matchesSearch = task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(taskSearchTerm.toLowerCase());
    
    // 优先级筛选
    const matchesPriority = taskFilterPriority === 'all' || task.priority === taskFilterPriority;
    
    // 分配者筛选
    const matchesAssignee = taskFilterAssignee === 'all' || task.assignee_id === parseInt(taskFilterAssignee);
    
    return matchesSearch && matchesPriority && matchesAssignee;
  });
};

## 数据模型

### 前端状态管理

javascript

// 任务列表状态
const [tasks, setTasks] = useState([]);

// 表单状态
const [showTaskForm, setShowTaskForm] = useState(false);
const [editingTask, setEditingTask] = useState(null);

// 筛选状态
const [taskSearchTerm, setTaskSearchTerm] = useState('');
const [taskFilterPriority, setTaskFilterPriority] = useState('all');
const [taskFilterAssignee, setTaskFilterAssignee] = useState('all');

// 拖拽状态
const [draggedTask, setDraggedTask] = useState(null);

### 后端数据模型

python

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    assignee_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    priority = db.Column(db.String(20), default='medium')  # low, medium, high, urgent
    status = db.Column(db.String(20), default='todo')  # todo, in_progress, review, done
    due_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

## API接口设计

### 1. 获取项目任务列表

text

GET /api/projects/{project_id}/tasks

- 返回指定项目的所有任务
    
- 需要用户登录和项目访问权限
    

### 2. 创建任务

text

POST /api/projects/{project_id}/tasks/create

- 创建新任务
    
- 必需字段：title
    
- 可选字段：description, assignee_id, priority, status, due_date
    

### 3. 更新任务

text

PUT /api/projects/{project_id}/tasks/update/{task_id}

- 更新任务信息
    
- 支持部分更新
    
- 需要任务创建者权限
    

### 4. 删除任务

text

DELETE /api/projects/{project_id}/tasks/delete/{task_id}

- 删除指定任务
    
- 需要项目创建者权限
    

## 核心函数说明

### 前端函数

1. **fetchTasks(projectId)**
    
    - 功能：获取指定项目的任务列表
        
    - 参数：projectId - 项目ID
        
    - 调用：`/api/projects/{project_id}/tasks`
        
2. **handleTaskSubmit(taskData)**
    
    - 功能：提交任务表单（创建/更新）
        
    - 逻辑：根据editingTask判断是创建还是更新操作
        
    - 调用：创建→POST，更新→PUT
        
3. **handleDragStart(task)**
    
    - 功能：开始拖拽任务
        
    - 参数：task - 被拖拽的任务对象
        
4. **handleDrop(status)**
    
    - 功能：在目标状态列放下任务
        
    - 参数：status - 目标状态
        
    - 逻辑：发送更新请求修改任务状态
        
5. **getFilteredTasks()**
    
    - 功能：获取筛选后的任务列表
        
    - 逻辑：应用所有筛选条件过滤任务
        

### 后端函数

1. **get_project_tasks(project_id)**
    
    - 功能：获取项目任务列表
        
    - 权限检查：用户必须是项目成员
        
2. **create_task(project_id)**
    
    - 功能：创建新任务
        
    - 权限检查：用户必须是项目成员
        
3. **update_task(project_id, task_id)**
    
    - 功能：更新任务信息
        
    - 权限检查：用户必须是项目成员
        
4. **delete_task(project_id, task_id)**
    
    - 功能：删除任务
        
    - 权限检查：用户必须是项目创建者
        

## 模块集成

### 与项目管理模块的集成

1. **依赖关系**：任务看板依赖于选中的项目（activeProjectId）
    
2. **数据同步**：选择项目时自动获取该项目的任务列表
    
3. **权限继承**：任务操作权限基于项目成员身份
    

### 状态管理流程

text

用户操作 → 前端状态更新 → API调用 → 后端处理 → 数据库更新 → 前端刷新

## 用户体验设计

### 1. 看板视图

- 四列状态展示：待处理、进行中、审核中、已完成
    
- 每列显示任务数量和状态标识颜色
    
- 支持拖拽改变状态
    

### 2. 任务卡片设计

- 优先级颜色标识
    
- 分配者信息显示
    
- 截止日期提醒
    
- 快速编辑/删除操作
    

### 3. 响应式设计

- 桌面端：四列并排显示
    
- 平板端：两列并排
    
- 手机端：单列垂直排列
    

## 安全考虑

1. **权限验证**：所有API端点都验证用户登录状态和项目权限
    
2. **数据归属**：任务必须属于某个项目，用户必须是项目成员才能操作
    
3. **输入验证**：前后端都进行输入验证
    
4. **防跨站请求伪造**：使用Flask的session管理和CORS配置
    

## 性能优化

1. **懒加载**：任务列表按需加载
    
2. **本地筛选**：筛选和搜索在前端进行，减少API调用
    
3. **状态缓存**：任务状态变更后更新本地状态，减少重渲染
    
4. **CSS优化**：使用CSS Grid实现高性能布局
    

## 扩展性考虑

### 未来可添加功能

1. **子任务系统**：支持任务分解为子任务
    
2. **任务评论**：任务讨论和反馈
    
3. **文件附件**：任务相关文件上传
    
4. **任务提醒**：截止日期提醒功能
    
5. **数据导出**：任务列表导出为CSV/PDF
    
6. **任务模板**：快速创建常用任务模板
    

### 架构扩展

1. **实时协作**：WebSocket实现实时任务更新
    
2. **移动应用**：React Native移动端适配
    
3. **数据备份**：定时任务数据备份
    
4. **分析报表**：任务完成情况统计分析
    

## 部署要求

### 环境依赖

- Node.js 14+（前端）
    
- Python 3.8+（后端）
    
- SQLite 3（数据库）
    

### 启动步骤

1. 启动后端：`python app.py`
    
2. 启动前端：`npm start`
    
3. 访问应用：`http://localhost:3000`
    

## 测试数据

系统初始化时自动创建示例任务：

1. 设计登录页面（待处理，高优先级）
    
2. 后端API开发（进行中，中优先级）
    
3. 数据库设计（审核中，紧急优先级）
    
4. 测试用例编写（已完成，低优先级）
    

## 故障排除

### 常见问题

1. **任务不显示**：检查是否选中项目，确认项目有任务数据
    
2. **拖拽无效**：检查控制台是否有API错误，确认用户权限
    
3. **筛选不工作**：检查筛选条件是否正确设置
    
4. **样式异常**：清除浏览器缓存，检查CSS是否正确加载
    

### 调试建议

1. 使用浏览器开发者工具查看网络请求
    
2. 检查控制台错误信息
    
3. 验证后端API是否正常运行
    
4. 确认数据库连接和表结构正确