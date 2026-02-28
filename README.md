

# 1. 引言

# 项目简介
团队协作平台是一个面向中小型团队的轻量级协作工具，旨在帮助团队成员高效管理项目、分配任务、发布公告以及进行实时交流。系统采用前后端分离架构，提供清晰直观的用户界面和完整的 RESTful API。

### 1.2 主要功能
用户认证：注册、登录、登出，基于 Session 的会话管理。

首页：支持背景图片自定义（随机/上传/选择），展示项目公告、项目列表、任务看板。

项目管理：创建、编辑、删除项目，邀请成员加入项目。

任务看板：对项目内的任务进行增删改查，支持拖拽更改状态，按优先级/成员筛选，按标题搜索。

数据图表：统计任务分布、项目进度、成员任务负载等可视化数据。

用户中心：查看当前用户信息、所有注册用户列表、系统健康状态。

评论系统：对项目或任务进行评论、回复、点赞、删除。


# 2. 技术栈

## 技术栈选型

#### 后端技术栈

|组件|技术|版本|选择理由|
|---|---|---|---|
|开发语言|Python|3.11+|开发效率高，生态丰富|
|Web框架|Flask|2.3.3|轻量灵活，适合API开发|
|CORS处理|Flask-CORS|4.0.0|解决跨域请求问题|
|环境管理|venv|-|项目环境隔离|
|包管理|pip|Latest|Python标准包管理|

#### 前端技术栈

|组件|技术|版本|选择理由|
|---|---|---|---|
|开发语言|JavaScript|ES6+|生态成熟，社区活跃|
|框架|React|18.x|组件化开发，性能优秀|
|HTTP客户端|Axios|1.x|Promise-based，易于使用|
|构建工具|Create React App|5.0+|零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动||构建工具|Create React App|5.0 |零配置，快速启动|
|包管理|npm|9.x+|Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理||包管理|npm|9.x |Node.js标准包管理|


#### 开发工具链![Uploading 登入界面.png…]()


|工具|版本|用途|配置状态|
|---|---|---|---|
|VS Code|Latest|代码编辑器|
|Git|2.43+|版本控制|
|GitHub|-|代码托管与协作|
|Git Bash|-|Windows终端环境|
|SSH Keys|ED25519|安全认证|


# 3. 系统架构
系统采用经典的前后端分离模式：

前端：React 应用，负责 UI 渲染和用户交互，通过 Axios 调用后端 API。

后端：Flask 应用，提供 RESTful API，处理业务逻辑，与 SQLite 数据库交互。

数据存储：SQLite 数据库，存储用户、项目、任务、评论等数据。

# 4. 项目结构

### 4.1 前端结构（React）
text   文本
team-collaboration-frontend/
├── public/                # 公共静态文件
├── src/
│   ├── components/         # React 组件│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──components/ # React│├──组件 /         # 反应组件│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #反应│├──组件/ #│├──components/ # React
│   │   ├── ProjectForm.js  # 项目表单组件
│   │   ├── TaskForm.js     # 任务表单组件
│   │   ├── ChartDashboard.js # 图表仪表板组件
│   │   └── ...             # 其他组件
│   ├── utils/              # 工具函数
│   │   └── imageUtils.js   # 随机图片工具
│   ├── Auth.js             # 登录/注册组件
│   ├── App.js              # 主应用组件，包含所有页面逻辑
│   ├── App.css             # 全局样式
│   └── index.js            # 入口文件
├── package.json            # 前端依赖配置
└── README.md               # 前端说明

### 4.2 后端结构（Flask）
text   文本
team-collaboration-backend/
├── instance/               # SQLite 数据库文件存放目录（自动生成）
├── app.py                  # Flask 主应用，包含所有模型和路由
├── init_db.py              # 数据库初始化脚本（可单独运行）
├── requirements.txt        # Python 依赖列表
└── README.md               # 后端说明

# 5. 功能模块详解

### 5.1 用户认证模块
注册：用户提供姓名、邮箱、密码，后端将密码加密后存储。

登录：验证邮箱和密码，成功后创建 Session，保持登录状态。

登出：销毁 Session，退出登录。

会话检查：每次页面刷新自动检查 /api/auth/me 恢复用户信息。

### 5.2 首页（Home）
背景图片控制：顶部大图支持随机、上传、从图库选择，图片数据存储在 src/images/ 目录。

公告栏：展示项目公告，支持发布、编辑、删除，优先级用颜色区分。

项目管理：

展示用户参与的所有项目卡片。

创建/编辑项目（项目名称、描述）。

删除项目（仅项目创建者可删除）。

点击卡片查看项目详情（成员列表、邀请成员）。

任务看板：

按状态列（待处理、进行中、审核中、已完成）展示任务。

支持搜索任务标题/描述，按优先级、成员筛选。

创建/编辑/删除任务（仅项目创建者可删除任务）。

拖拽任务卡片到不同列，自动更新任务状态。

### 5.3 用户中心
当前用户信息：显示头像（首字母）、姓名、邮箱，提供登出按钮。

用户列表：显示所有注册用户（简化信息），便于了解团队成员。

系统健康状态：展示后端连接状态、项目数量、在线用户数、任务总数，并提供刷新按钮和后端健康检查链接。

### 5.4 数据图表
图表仪表板：调用 ChartDashboard 组件，基于当前项目和任务数据生成：

任务状态分布图（柱状图/饼图）。

各优先级任务数量。

项目成员任务负载。

项目进度百分比。

数据洞察（如逾期任务数、完成任务占比等）。

### 5.5 评论模块
评论列表：按时间倒序展示顶级评论，每条评论可点赞、回复、删除（仅作者或管理员）。

回复功能：支持嵌套回复，回复同样可点赞、删除。

评论表单：发布新评论（需登录）。

### 5.6 其他功能
响应式设计：使用 CSS 媒体查询适配移动端和桌面端。

拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。拖拽交互：任务看板支持 HTML5 Drag & Drop。

# 6. 安装与部署指南
### 6.1 环境要求
Node.js 16+ 和 npm   Node.js 16  和 npm

Python 3.8+   Python 3.8

Git（可选，用于克隆仓库）

### 6.2 后端安装与运行
克隆或下载后端代码（假设已获取 app.py 和 requirements.txt）。

创建虚拟环境（推荐）：

bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate      # Windows
安装依赖：

bash
pip install -r requirements.txt
如果没有 requirements.txt，可手动安装：

bash
pip install flask flask-cors flask-sqlalchemy
初始化数据库：

bash
python init_db.py
或直接运行 app.py 自动初始化（第一次启动时）。

启动后端服务：

bash
python app.py
服务默认运行在 http://localhost:5000。

### 6.3 前端安装与运行
准备前端代码（包含 package.json 的目录）。

安装依赖：

bash
npm install
启动开发服务器：

bash
npm start
默认运行在 http://localhost:3000，会自动打开浏览器。

配置后端 API 地址（如果需要）：在 App.js 中检查 Axios 请求的 URL，默认使用 http://localhost:5000，若后端部署在其他地址，需修改。

### 6.4 访问应用
前端访问：http://localhost:3000

后端 API 基础路径：http://localhost:5000

# 7. API 参考文档
所有 API 返回 JSON 格式，需要登录的接口需携带 Session Cookie（由浏览器自动处理）。

### 7.1 认证相关
方法	路径	描述	请求体
POST	/api/auth/register	用户注册	{ "name": "张三", "email": "xxx@xx.com", "password": "123456" }
POST	/api/auth/login	用户登录	{ "email": "xxx@xx.com", "password": "123456" }
POST	/api/auth/logout	用户登出	无
GET	/api/auth/me	获取当前登录用户	无

### 7.2 用户管理
方法	路径	描述
GET	/api/users	获取所有用户列表
GET	/api/users/<int:id>	获取单个用户
POST	/api/users/add	添加用户（需管理员）
PUT	/api/users/update/<id>	更新用户信息
DEL	/api/users/delete/<id>	删除用户

### 7.3 项目管理
方法	路径	描述	请求体
GET	/api/projects	获取当前用户参与的所有项目	无
POST	/api/projects/create	创建项目	{ "name": "项目名", "description": "描述" }
PUT	/api/projects/update/<id>	更新项目（仅创建者）	{ "name": "", "description": "", "status": "" }
DEL	/api/projects/delete/<id>	删除项目（仅创建者）	无
POST	/api/projects/<id>/invite	邀请用户加入项目（仅创建者）	{ "email": "user@example.com" }
GET	/api/projects/<id>/members	获取项目成员列表	无

### 7.4 任务管理
方法	路径	描述	请求体
GET	/api/projects/<project_id>/tasks	获取项目内所有任务	无
POST	/api/projects/<project_id>/tasks/create	创建任务	{ "title": "", "description": "", "assignee_id": 1, "priority": "medium", "status": "todo", "due_date": "2025-12-31" }
PUT	/api/projects/<project_id>/tasks/update/<task_id>	更新任务	同上（可部分字段）
DEL	/api/projects/<project_id>/tasks/delete/<task_id>	删除任务（仅项目创建者）	无

### 7.5 评论管理
方法	路径	描述	请求体
GET	/api/comments	获取所有顶级评论	无
POST	/api/comments	发布评论/回复	{ "content": "内容", "parent_id": null }
POST	/api/comments/<id>/like	点赞评论	无
DEL	/api/comments/<id>	删除评论	无

### 7.6 健康检查与其他
方法	路径	描述
GET	/	根路径，返回欢迎信息
GET	/api/health	服务健康检查
GET	/api/db/init	初始化数据库（开发用）
POST	/api/db/reset	重置数据库（开发用）

# 8. 开发指南
### 8.1 添加新功能
前端：

在 App.js 中添加新的状态和函数。

若组件较大，可在 components/ 下新建组件并导入。

在 App.css 中添加相应样式。

后端：

在 app.py 中定义新的模型类（继承 db.Model）。

添加对应的 API 路由（使用 @app.route）。

在需要时更新数据库（使用 db.create_all() 或迁移工具）。

### 8.2 代码规范
前端：

使用 ES6+ 语法，组件命名采用 PascalCase。

状态管理优先使用 useState 和 useEffect。

CSS 类名采用连字符命名（如 task-board）。

后端：

遵循 PEP8 编码规范。

路由命名清晰，使用复数形式表示资源（如 /api/projects）。

异常处理应返回合适的 HTTP 状态码和错误信息。

### 8.3 调试技巧
前端：打开浏览器开发者工具（F12），查看 Console 输出和 Network 请求。

后端：Flask 运行在 debug 模式（debug=True），代码修改自动重启，错误信息会显示在页面/终端。

数据库：可使用 SQLite 浏览器（如 DB Browser for SQLite）查看 instance/app.db 内容。

# 9. 常见问题（FAQ）
### 9.1 数据库初始化失败
现象：运行 python app.py 时报错，提示数据库表不存在或列缺失。
解决：

确保 instance 目录存在且有写入权限。

运行 python init_db.py 手动创建表。

若已有旧数据库，可访问 POST /api/db/reset 重置（会清空所有数据）。

### 9.2 登录提示“邮箱或密码错误”
原因：

用户未注册。

密码错误。

数据库中用户没有 password_hash 字段（旧版本）。
解决：

检查用户是否存在。

默认密码为 123456（若用户从未设置密码）。

访问 /api/db/reset 重新初始化数据库（会清空数据）。

### 9.3 前端无法连接后端
现象：页面显示“后端连接失败”或请求超时。
检查：

后端服务是否运行（python app.py）。

端口是否冲突（默认 5000）。

浏览器控制台是否有 CORS 错误；后端已配置 CORS，一般不会出现。

若后端部署在非本机，需修改 App.js 中的 API 地址。

### 9.4 拖拽任务不更新状态
原因：拖拽功能需要 HTML5 Drag & Drop 支持，浏览器可能限制。
解决：

确保在任务卡片上正确设置了 draggable 属性。

检查后端 API 是否成功更新任务状态（看 Network 请求）。

### 9.5 图片上传不显示
原因：上传的图片过大或格式不支持。
解决：限制图片大小不超过 5MB，格式为常见图片格式（jpg、png、gif）。

### 更新记录

|版本|日期|更新内容|维护者|
|---|---|---|---|
|v1.0.0.0|初始版本，完整技术文档|YWXstrong|
|v1.0.0.1|目前还没找到网页图片的bug，暂时用文件予以代替|YWXstrong|
|v1.0.0.2|为后端Flask和前端React，css添加代码注释便于学习|YWXstrong|
|v1.0.0.3|添加了SQLlite数据库系统（下个版本用户注册登入系统的准备）|YWXstrong|
|v1.0.0.4|学习了代码的增添改删，具体移步GitHub（python.md）|YWXstrong|
|v1.0.0.4|增加了一个通过哈希函数制作的用户登入注册系统|YWXstrong|
|v1.0.0.5|优化了前端的网页显示，配置了一个的图片背景自定义|YWXstrong|
|v1.0.0.6|优化了前端的网页显示让网页看的更加正规|YWXstrong|
|v1.0.0.7|布局了一下简单的网页颜色，使颜色更加符合商业化|YWXstrong|
|v1.0.0.8|更新了一个新的项目管理模块，更加提升了协作效率（更新技术文档）|YWXstrong|
|v1.0.0.9|优化了网页端ui，消化吸收项目管理模块函数架构运行逻辑|YWXstrong|
|v1.0.1.0|学习解决了插件在Javastrip中的使用逻辑|YWXstrong|
|v1.0.1.1|系统学习css，js的编写，不会的学习Mdn官方文档|YWXstrong|
|v1.0.1.2|学习重构了网页的布局|YWXstrong|
|v1.0.1.3|更新了一个任务看板模块，集合项目管理，修复了一些项目管理和任务看板模块的显示冲突bug，后续继续细致学习细节中|YWXstrong|
|v1.0.1.4|优化了登录界面，让登入界面拥有一个一张自选图片背景，而不是纯颜色|YWXstrong|
|v1.0.1.5|把网页最前面的文本框改成了一个实现基础内容的公告栏|YWXstrong|
|v1.0.1.6|学习经典的版本回退(多重导航栏技术学习中)|YWXstrong|
|v1.0.1.7|导航栏模块（代码小重构）首页，用户中心，评论，登出|YWXstrong| 
|v1.0.1.8|图表直观显示任务看板&项目管理内容|YWXstrong| 
|v1.0.1.9|网页相关样式修改，更加符合整体配色&主题|YWXstrong| 

# 10. 结语
本团队协作平台提供了一套完整的前后端实现，适合作为学习项目或小型团队内部工具的基础。文档涵盖了从安装到二次开发的全流程，希望能帮助您快速上手。
如有任何问题，欢迎查阅代码注释或联系开发团队。
*文档版本：1.0 (2025-02-25)*


