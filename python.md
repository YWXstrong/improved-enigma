
# 技术选型基于<团队协作模型基于Flask+React+SQLite的联合开发>

**决策者**: YWXstrong (w162675761@qq.com)

# ## 📖 文档目录

- 项目概述

- 增删查改细则&注意事项
    
- 各模块简单介绍&运行逻辑，调取数据由来

- 使用教学

- 常用代码，注意事项


### 简介

团队协作模型是一个现代化全栈应用，旨在通过实际项目开发学习全栈技术栈的完整流程。本文档基于上述项目的基本内容细节进行说明补充

### 模块添加&代码修改
- 0.注意拼音与中文的切换!即使python代码补全功能很强大。

- 1.代码一般添加到函数引用code之下：
   加在这之后（一般在）：
function App() {
  //定义组件的状态（之后的代码第一块就在这里面改）
  const [message, setMessage] = useState('');   //储存后端返回的消息
  const [users, setUsers] = useState([]);       //储存用户列表数据
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值

- 2.简单的不需要串联的代码只需要动 APP.JS 和 APP.css 这两个文件即可
js具体的功能写好之后。后面要跟上JSX代码的书写，让函数能在web上显示出来。
//加载状态渲染
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>正在努力加载中QAQ.....</h1>
        </header>
      </div>
    );
  } //这一块就是JSX的代码，看具体内容，你具体想放在哪个位置就需要找对应的JSX所在的代码位置

  - 3.css文件的添加一般都是在文本的最末尾

  - 4.后端：
   记住这个基本原则：如果功能需要与数据库交互、需要业务逻辑处理、或需要与其他系统集成，那么就需要修改后端。如果只是界面展示或用户交互，可以只修改前端。（还在学习中QAQ）

## 用户登入注册模块
- 1.运用的算法和原理
####  密码哈希算法：

- **工作原理**：
  1. 生成随机盐值（salt）
  2. 将密码和盐值组合
  3. 使用哈希函数（如 SHA-256）进行多次迭代（默认 260,000 次）
  4. 生成固定长度的密钥/哈希值

特性
- **抗暴力破解**：多次迭代使破解时间成本极高
- **抗彩虹表攻击**：每个密码使用不同的盐值
- **不可逆性**：无法从哈希值反推原始密码

#### 在代码中的应用
```python
# werkzeug 内部实现（简化版）
def generate_password_hash(password):
    salt = os.urandom(16)  # 生成随机盐
    iterations = 260000    # 迭代次数
    hash_value = pbkdf2_hmac('sha256', password.encode(), salt, iterations)
    return f'pbkdf2:sha256:{iterations}${salt.hex()}${hash_value.hex()}'
```

### Session 管理机制

#### 工作原理
1. **服务器端存储**：Session 数据存储在服务器内存或数据库中
2. **客户端标识**：通过加密的 cookie（session ID）标识用户
3. **安全性**：Cookie 使用 `SECRET_KEY` 签名，防止篡改

#### 流程示例
```
用户登录
  ↓
服务器验证密码
  ↓
创建 session，存储 user_id
  ↓
返回加密的 session cookie 给客户端
  ↓
后续请求自动携带 cookie
  ↓
服务器通过 cookie 识别用户身份
```

###  数据库迁移策略

#### 问题
SQLite 不支持直接修改表结构（如添加 NOT NULL 列），需要特殊处理。

#### 解决方案
1. **检测阶段**：使用 `PRAGMA table_info` 检查列是否存在
2. **迁移阶段**：
   - 如果列不存在，使用 `ALTER TABLE` 添加列（允许 NULL）
   - 如果迁移失败，删除表重建（开发环境）
3. **数据更新**：为现有用户设置默认密码

#### 代码实现
```python
# 检查列是否存在
result = db.session.execute(db.text("PRAGMA table_info(users)"))
columns = [row[1] for row in result.fetchall()]

if 'password_hash' not in columns:
    # 添加列
    db.session.execute(db.text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
    db.session.commit()
```

## 安全考虑

### 5.1 密码安全
-  密码使用 PBKDF2 加密存储
-  密码不会以明文形式传输或存储
-  密码验证失败时返回通用错误信息（防止用户枚举）

### 5.2 Session 安全
-  使用 `SECRET_KEY` 签名 session cookie
-  支持 CORS credentials（`supports_credentials=True`）
-  登出时清除所有 session 数据

### 5.3 输入验证
- 前端：HTML5 表单验证（required, minLength, type="email"）
- 后端：检查必要字段是否存在
- 邮箱唯一性检查

## 六、测试账号

系统初始化时会创建以下测试账号（默认密码：`123456`）：
- 邮箱：`zhangsan@example.com`
- 邮箱：`lisi@example.com`
- 邮箱：`w162675761@qq.com`


## 七、技术栈总结

- **后端**：Flask + SQLAlchemy + werkzeug
- **前端**：React + axios
- **数据库**：SQLite
- **加密算法**：PBKDF2 (通过 werkzeug)
- **会话管理**：Flask Session

## 项目管理模块细则

### 功能概述
项目管理模块实现了项目创建、编辑、删除、成员邀请和项目概览功能，为用户提供了一个完整的团队协作项目管理界面。

### 项目列表获取流程
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

### 项目管理模块代码运行流程
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
 



