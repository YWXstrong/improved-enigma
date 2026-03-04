# 团队协作平台 (Team Collaboration Platform)
## 项目简介
团队协作平台是一个集项目、任务、公告、评论和数据分析于一体的团队管理工具。后端采用 Flask + SQLAlchemy，前端使用 React，提供完整的用户认证、项目协作、任务看板、公告发布、评论互动以及可视化数据图表功能，帮助团队高效协作。

# 技术栈
后端
语言框架：Python 3.9+ / Flask 2.3

数据库：SQLite（开发环境），可扩展至 MySQL/PostgreSQL

ORM：Flask-SQLAlchemy 3.0

认证与会话：Werkzeug 密码加密，Flask session 管理

跨域：Flask-CORS

# 前端
核心库：React 18 + Hooks

HTTP 客户端：Axios

路由：无（单页应用内通过状态管理页面切换）

样式：原生 CSS（模块化设计）

# 开发与部署
版本控制：Git

环境变量：.env（可自行扩展）

包管理：pip（后端）、npm / yarn（前端）

# 功能特性
1. 用户认证：注册、登录、登出，会话保持

2. 用户管理：查看用户列表，更新用户信息

3. 项目管理：创建/编辑/删除项目，邀请成员，查看成员列表

4. 任务看板：支持拖拽更新状态，按优先级/成员筛选，搜索任务

5. 公告栏：发布/编辑/删除公告，按优先级标记

6. 评论系统：发表/回复/点赞/删除评论（支持嵌套回复）

7. 数据图表：任务分布、项目进度、优先级统计等可视化

8. 健康检查：后端服务状态、数据库连接、系统信息

# 快速开始
环境要求
Python 3.9+

Node.js 16+

npm 或 yarn

## 安装步骤
1. 克隆仓库
bash
git clone https://github.com/your-username/team-collaboration-platform.git
cd team-collaboration-platform
2. 后端设置
bash
cd backend
pip install -r requirements.txt
如无 requirements.txt，手动安装依赖：

bash
pip install flask flask-cors flask-sqlalchemy werkzeug
3. 数据库初始化
bash
python app.py   # 首次运行会自动创建数据库和示例数据
或单独执行初始化脚本：

bash
python init_db.py
4. 前端设置
bash
cd frontend
npm install
5. 运行
后端：python app.py（默认监听 http://localhost:5000）

前端：npm start（默认监听 http://localhost:3000）

访问 http://localhost:3000 即可使用。

项目结构
text
team-collaboration-platform/
├── backend/                     # 后端代码
│   ├── app.py                   # Flask 主应用，包含所有API和模型定义
│   ├── init_db.py                # 独立数据库初始化脚本
│   └── instance/                 # SQLite 数据库文件存放目录
│       └── app.db
├── frontend/                     # 前端代码
│   ├── public/
│   ├── src/
│   │   ├── components/           # 子组件
│   │   │   ├── ProjectForm.js    # 项目表单
│   │   │   └── TaskForm.js       # 任务表单
│   │   ├── utils/
│   │   │   └── imageUtils.js     # 图片工具（随机图片）
│   │   ├── images/               # 静态图片资源
│   │   ├── App.js                # 主应用组件
│   │   ├── App.css               # 全局样式
│   │   ├── Auth.js               # 登录/注册组件
│   │   ├── Auth.css              # 认证样式
│   │   └── index.js              # 入口文件
│   ├── package.json
│   └── README.md
└── README.md                     # 项目总文档（即本文档）

# 数据库设计
主要模型
User（用户）
字段	类型	说明
id	Integer	主键
name	String(100)	姓名
email	String(120)	邮箱（唯一）
password_hash	String(255)	加密密码
created_at	DateTime	创建时间
updated_at	DateTime	更新时间
Project（项目）
字段	类型	说明
id	Integer	主键
name	String(200)	项目名称
description	Text	描述
owner_id	Integer(FK)	创建者ID
status	String(20)	状态（active/completed/archived）
created_at	DateTime	创建时间
updated_at	DateTime	更新时间
Task（任务）
字段	类型	说明
id	Integer	主键
title	String(200)	任务标题
description	Text	描述
project_id	Integer(FK)	所属项目ID
assignee_id	Integer(FK)	负责人ID
priority	String(20)	low/medium/high/urgent
status	String(20)	todo/in_progress/review/done
due_date	DateTime	截止日期
created_at	DateTime	创建时间
updated_at	DateTime	更新时间
Comment（评论）
字段	类型	说明
id	Integer	主键
content	Text	评论内容
user_id	Integer(FK)	评论者ID
parent_id	Integer(FK)	父评论ID（用于回复）
likes	Integer	点赞数
created_at	DateTime	创建时间
updated_at	DateTime	更新时间
关联表

project_members：项目与用户的多对多关系（包含 joined_at 字段）

关系图（简化）
text
User 1──< owns >──* Project
User *──< members >──* Project
Project 1──< contains >──* Task
Task *──< assigned to >──1 User
User 1──< writes >──* Comment
Comment *──< replies to >──1 Comment
API 文档
所有 API 前缀为 http://localhost:5000/api。需要登录的接口请在请求中携带 Cookie（withCredentials: true）。

认证相关
方法	端点	描述	请求体	响应
POST	/auth/register	注册	{name, email, password}	用户信息 + 会话
POST	/auth/login	登录	{email, password}	用户信息 + 会话
POST	/auth/logout	登出	-	成功消息
GET	/auth/me	获取当前登录用户	-	用户信息 / 401
用户管理
方法	端点	描述	权限
GET	/users	获取所有用户	登录
GET	/users/<id>	获取单个用户	登录
POST	/users/add	添加用户	管理员（暂未严格校验）
PUT	/users/update/<id>	更新用户	本人或管理员
DELETE	/users/delete/<id>	删除用户	本人或管理员
项目管理
方法	端点	描述	权限
GET	/projects	获取当前用户参与的所有项目	登录
POST	/projects/create	创建项目	登录
PUT	/projects/update/<id>	更新项目	项目所有者
DELETE	/projects/delete/<id>	删除项目	项目所有者
POST	/projects/<id>/invite	邀请成员	项目所有者
GET	/projects/<id>/members	获取项目成员	登录且为成员
任务管理
方法	端点	描述	权限
GET	/projects/<pid>/tasks	获取项目所有任务	项目成员
POST	/projects/<pid>/tasks/create	创建任务	项目成员
PUT	/projects/<pid>/tasks/update/<tid>	更新任务	项目成员
DELETE	/projects/<pid>/tasks/delete/<tid>	删除任务	项目所有者
评论系统
方法	端点	描述	权限
GET	/comments	获取所有顶级评论	登录
POST	/comments	发表评论	登录
POST	/comments/<id>/like	点赞评论	登录
DELETE	/comments/<id>	删除评论	本人或管理员
系统与健康
方法	端点	描述
GET	/	欢迎信息 + 数据库状态
GET	/api/health	健康检查（含数据库连接）
GET	/api/db/init	初始化数据库（开发用）
POST	/api/db/reset	重置数据库（开发用）
## 前端组件说明
App.js：主组件，管理全局状态（用户、项目、任务、评论等）和页面导航。

Auth.js：登录/注册表单，处理用户认证。

ProjectForm.js：创建/编辑项目的表单组件。

TaskForm.js：创建/编辑任务的表单组件。

ChartDashboard.js：数据图表仪表板，基于任务和项目数据渲染可视化图表（柱状图、环形图等）。

utils/imageUtils.js：提供随机图片获取函数，用于首页背景图。

## 页面路由（状态驱动）
通过 activePage 状态控制渲染哪个页面：

home：首页（公告栏 + 项目管理 + 任务看板）

user：用户中心（个人信息、用户列表、系统状态）

charts：数据图表

comments：评论区

贡献指南
欢迎贡献代码或提出建议！

Fork 本仓库

创建功能分支：git checkout -b feature/your-feature

提交更改：git commit -m 'Add some feature'

推送到分支：git push origin feature/your-feature

提交 Pull Request

请确保代码风格符合项目规范，并编写必要的注释。

许可证
MIT License

## 常见问题
Q: 首次运行后端时数据库初始化失败怎么办？
A: 确保 instance 文件夹可写，或手动运行 python init_db.py。

Q: 前端无法连接后端 API？
A: 检查后端是否运行在 5000 端口，且前端 Axios 配置了正确的 baseURL（代码中已写死 localhost:5000，可改为环境变量）。

Q: 如何修改默认密码？
A: 在 app.py 的 init_db() 函数中修改默认密码 '123456' 为你需要的值。

更新日志

版本	日期	更新内容	维护者
v1.0.0.0	初始版本，完整技术文档	YWXstrong	
v1.0.0.1	目前还没找到网页图片的bug，暂时用文件予以代替	YWXstrong	
v1.0.0.2	为后端Flask和前端React，css添加代码注释便于学习	YWXstrong	
v1.0.0.3	添加了SQLlite数据库系统（下个版本用户注册登入系统的准备）	YWXstrong	
v1.0.0.4	学习了代码的增添改删，具体移步GitHub（python.md）	YWXstrong	
v1.0.0.4	增加了一个通过哈希函数制作的用户登入注册系统	YWXstrong	
v1.0.0.5	优化了前端的网页显示，配置了一个的图片背景自定义	YWXstrong	
v1.0.0.6	优化了前端的网页显示让网页看的更加正规	YWXstrong	
v1.0.0.7	布局了一下简单的网页颜色，使颜色更加符合商业化	YWXstrong	
v1.0.0.8	更新了一个新的项目管理模块，更加提升了协作效率（更新技术文档）	YWXstrong	
v1.0.0.9	优化了网页端ui，消化吸收项目管理模块函数架构运行逻辑	YWXstrong	
v1.0.1.0	学习解决了插件在Javastrip中的使用逻辑	YWXstrong	
v1.0.1.1	系统学习css，js的编写，不会的学习Mdn官方文档	YWXstrong	
v1.0.1.2	学习重构了网页的布局	YWXstrong	
v1.0.1.3	更新了一个任务看板模块，集合项目管理，修复了一些项目管理和任务看板模块的显示冲突bug，后续继续细致学习细节中	YWXstrong	
v1.0.1.4	优化了登录界面，让登入界面拥有一个一张自选图片背景，而不是纯颜色	YWXstrong	
v1.0.1.5	把网页最前面的文本框改成了一个实现基础内容的公告栏	YWXstrong	
v1.0.1.6	学习经典的版本回退(多重导航栏技术学习中)	YWXstrong	
v1.0.1.7	导航栏模块（代码小重构）首页，用户中心，评论，登出	YWXstrong	
v1.0.1.8	图表直观显示任务看板&项目管理内容	YWXstrong	
v1.0.1.9	网页相关样式修改，更加符合整体配色&主题	YWXstrong	