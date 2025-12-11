# 项目管理系统（微小模型）
### 一、功能概述
项目管理模块实现了项目创建、编辑、删除、成员邀请和项目概览功能，为用户提供了一个完整的团队协作项目管理界面。

### 二、技术架构
text
前端 (React) ↔ 后端 (Flask/SQLAlchemy) ↔ 数据库 (SQLite)
       ↓                   ↓                     ↓
   组件/状态管理         API路由             数据持久化
### 三、核心实现机制
3.1 数据模型 (后端)
文件位置: app.py

核心类: Project 模型

python
class Project(db.Model):
    # 主要字段: id, name, description, owner_id, status
    # 关系: owner (用户), members (多对多关系)
关联表: project_members 表

存储项目与用户的关联关系

每个用户可以加入多个项目

每个项目可以有多个成员

3.2 API接口 (后端)
方法	端点	功能	权限要求
GET	/api/projects	获取用户的所有项目	已登录
POST	/api/projects/create	创建新项目	已登录
PUT	/api/projects/update/<id>	更新项目信息	项目所有者
DELETE	/api/projects/delete/<id>	删除项目	项目所有者
POST	/api/projects/<id>/invite	邀请成员加入项目	项目所有者
GET	/api/projects/<id>/members	获取项目成员列表	项目成员
3.3 前端组件 (React)
主组件文件: App.js
独立组件文件: src/components/ProjectForm.js

### 四、关键函数说明
4.1 后端关键函数
get_projects() - 获取用户项目

python
def get_projects():
    # 1. 从session获取用户ID
    # 2. 查询用户创建和参与的所有项目
    # 3. 返回项目列表（JSON格式）
create_project() - 创建项目

python
def create_project():
    # 1. 验证用户登录状态
    # 2. 接收前端提交的项目数据
    # 3. 创建新项目记录
    # 4. 将创建者自动添加为项目成员
    # 5. 返回创建成功的项目信息
update_project(project_id) - 更新项目

python
def update_project(project_id):
    # 1. 验证用户权限（必须是项目所有者）
    # 2. 更新项目信息
    # 3. 更新updated_at时间戳
4.2 前端关键函数
fetchProjects() - 获取项目列表

javascript
const fetchProjects = async () => {
  // 1. 发送GET请求到/api/projects
  // 2. 处理响应数据
  // 3. 更新projects状态
};
handleProjectSubmit(projectData) - 提交项目表单

javascript
const handleProjectSubmit = async (projectData) => {
  // 1. 根据editingProject状态决定调用创建或更新API
  // 2. 发送POST或PUT请求
  // 3. 更新本地项目列表状态
  // 4. 关闭表单
};
handleInviteMember() - 邀请成员

javascript
const handleInviteMember = async () => {
  // 1. 验证activeProjectId和inviteEmail
  // 2. 发送POST请求到邀请API
  // 3. 刷新项目成员列表
};
### 五、数据流通流程
5.1 项目列表获取流程
text
前端组件挂载 → useEffect触发 → fetchProjects()调用
    ↓
发送GET请求到 /api/projects
    ↓
后端验证session → 查询数据库 → 返回JSON数据
    ↓
前端接收数据 → setProjects()更新状态 → 重新渲染UI
5.2 项目创建流程
text
用户点击"创建项目" → 显示ProjectForm组件
    ↓
填写表单 → 点击提交 → handleProjectSubmit()触发
    ↓
发送POST请求到 /api/projects/create
    ↓
后端验证数据 → 创建数据库记录 → 返回新项目信息
    ↓
前端添加新项目到列表 → 更新UI显示
5.3 成员邀请流程
text
用户点击项目 → 显示项目概览 → 输入邮箱 → 点击"邀请"
    ↓
handleInviteMember()触发 → 发送POST请求
    ↓
后端验证权限 → 查找用户 → 添加关联记录
    ↓
前端刷新成员列表 → 显示新成员
### 六、代码运行流程
6.1 组件加载流程
text
App.js加载 → 检查登录状态 → 获取用户数据
    ↓
已登录 → 获取项目列表 → 渲染项目管理界面
    ↓
显示: 项目操作按钮 + 项目列表 + 项目概览面板
6.2 表单提交流程
text
显示ProjectForm组件 → 用户填写数据
    ↓
提交表单 → 调用父组件的handleProjectSubmit
    ↓
根据editingProject状态决定API端点
    ↓
发送请求 → 处理响应 → 更新状态 → 关闭表单
七、后续修改指南
7.1 添加新字段（如项目截止日期）
后端修改:

python
# 1. 在Project模型中添加字段
due_date = db.Column(db.DateTime)

# 2. 在to_dict()方法中返回该字段
'due_date': self.due_date.isoformat() if self.due_date else None

# 3. 在create_project和update_project中处理该字段
前端修改:

javascript
// 1. 在ProjectForm中添加日期选择器
<input type="date" value={formData.due_date} />

// 2. 更新formData状态
const [formData, setFormData] = useState({
  // ... 原有字段
  due_date: project?.due_date || ''
});

// 3. 在项目列表中显示截止日期
7.2 添加项目角色权限
后端修改:

python
# 1. 在project_members表中添加角色字段
db.Column('role', db.String(20), default='member')

# 2. 创建ProjectMember模型替代关联表
class ProjectMember(db.Model):
    __tablename__ = 'project_members'
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), primary_key=True)
    role = db.Column(db.String(20), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
7.3 添加项目任务功能
建议步骤:

创建Task模型（包含task_name, description, assignee_id, status等）

添加任务相关API（/api/projects/<id>/tasks）

创建前端Task组件

在项目概览中添加任务管理面板

7.4 优化性能
建议修改:

分页加载: 项目列表添加分页

缓存数据: 使用React Query或Redux缓存项目数据

懒加载: 项目成员列表点击时才加载

7.5 样式美化
建议修改:

创建独立的CSS文件管理样式

使用CSS模块化

添加动画效果（如项目创建成功提示）

### 八、常见问题排查
8.1 项目列表不显示
检查用户是否登录（session验证）

检查后端API是否返回正确数据

查看浏览器开发者工具Network标签

8.2 表单提交失败
检查必填字段是否完整

查看后端错误日志

验证用户权限（是否为项目所有者）

8.3 成员邀请无效
确认被邀请用户邮箱是否存在

检查用户是否已是项目成员

验证邀请者权限

### 九、扩展建议
实时通知: 添加WebSocket实现实时项目更新通知

文件上传: 为项目添加文件管理功能

项目模板: 支持从模板创建项目

统计报表: 添加项目进度统计和报表功能

### 十、总结
项目管理模块采用标准的CRUD模式实现，前后端分离架构清晰。通过RESTful API进行数据交互，React组件化开发便于维护和扩展。后续可根据需求逐步添加新功能，建议遵循"小步快跑"的原则，每次只添加一个核心功能并进行充分测试。