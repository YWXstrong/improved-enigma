# 团队协作平台 (Team Collaboration Platform)
## 1. 项目概述
### 1.1 项目名称
团队协作平台 (Team Collaboration Platform)
### 1.2 项目简介
**推荐优先观看演示视频！！！**
【[全栈项目演示] 基于React+Flask的企业级协作平台（含架构设计与性能优化实录）】
👉 **https://www.bilibili.com/video/BV1xZAhzREF3/?share_source=copy_web&vd_source=ceaf6abe8833277a67532e1d8cf02e75**

团队协作平台是一个集项目、任务、公告、评论和数据分析于一体的团队管理工具。后端采用 Flask + SQLAlchemy，前端使用 React，提供完整的用户认证、项目协作、任务看板、公告发布、评论互动以及可视化数据图表功能，帮助团队高效协作。
### 1.3 技术栈
| 分类 | 技术/框架 | 版本 |
|------|-----------|------|
| 后端 | Python | 3.9+ |
| 后端 | Flask | 2.3 |
| 后端 | Flask-SQLAlchemy | 3.0 |
| 后端 | Flask-CORS | - |
| 后端 | Werkzeug | - |
| 后端 | SQLite | 开发环境（可扩展至MySQL/PostgreSQL） |
| 前端 | React | 18 |
| 前端 | Axios | - |
| 前端 | CSS（模块化） | - |
| 开发部署 | Git | - |
| 开发部署 | pip | 后端包管理 |
| 开发部署 | npm/yarn | 前端包管理 |

## 2. 环境准备
### 2.1 硬件要求
- 处理器：Intel i3 及以上/AMD 同等性能处理器
- 内存：4GB RAM 及以上（推荐8GB）
- 磁盘空间：至少10GB 可用空间

### 2.2 软件要求
| 软件 | 版本要求 | 下载地址 |
|------|----------|----------|
| Python | ≥ 3.9 | https://www.python.org/downloads/ |
| Node.js | ≥ 16 | https://nodejs.org/ |
| npm | ≥ 8.x | 随Node.js自带 |
| yarn | ≥ 1.22.x | https://yarnpkg.com/ |
| Git | ≥ 2.30.x | https://git-scm.com/ |

### 2.3 环境变量配置（可选）
> 项目支持通过`.env`文件配置环境变量（如数据库连接地址、服务端口等），后端根目录下创建`.env`文件可自定义以下配置：
> - `FLASK_APP`：Flask应用入口（默认app.py）
> - `FLASK_ENV`：运行环境（development/production）
> - `DATABASE_URI`：数据库连接地址（默认SQLite: sqlite:///instance/app.db）
> - `FLASK_PORT`：后端服务端口（默认5000）

## 3. 项目部署与运行
### 3.1 代码拉取
```bash
# 克隆代码仓库
git clone https://github.com/your-username/team-collaboration-platform.git
# 进入项目目录
cd team-collaboration-platform
```

### 3.2 依赖安装
#### 3.2.1 后端依赖安装
```bash
# 进入后端目录
cd backend
# 通过requirements.txt安装（推荐）
pip install -r requirements.txt
# 若无requirements.txt，手动安装核心依赖
pip install flask flask-cors flask-sqlalchemy werkzeug
```

#### 3.2.2 前端依赖安装
```bash
# 进入前端目录
cd frontend
# 使用npm安装
npm install
# 或使用yarn安装
yarn install
```

### 3.3 配置文件修改
> 1. 后端：如需修改数据库类型（如切换至MySQL），修改`app.py`中`SQLALCHEMY_DATABASE_URI`配置；
> 2. 前端：如需修改后端API地址，修改Axios请求的`baseURL`（默认`http://localhost:5000/api`）；
> 3. 环境变量：后端可通过`.env`文件自定义端口、数据库地址等，前端可在`.env`中配置`REACT_APP_API_BASE_URL`覆盖默认API地址。

### 3.4 数据库初始化
```bash
# 进入后端目录
cd backend
# 方式1：运行主应用自动初始化（首次运行创建数据库和示例数据）
python app.py
# 方式2：单独执行初始化脚本
python init_db.py
```

### 3.5 项目运行
#### 3.5.1 开发环境运行
```bash
# 后端运行（默认监听 http://localhost:5000）
cd backend
python app.py

# 前端运行（默认监听 http://localhost:3000）
cd frontend
npm start
# 或使用yarn
yarn start
```
> 访问 http://localhost:3000 即可使用平台。

#### 3.5.2 生产环境构建&运行
```bash
# 前端构建生产包
cd frontend
npm run build
# 构建产物输出到frontend/build目录，可通过Nginx/Apache部署

# 后端生产环境运行（推荐使用Gunicorn）
cd backend
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 4. 核心功能模块说明
### 4.1 模块1：用户认证模块
#### 4.1.1 功能描述
负责用户的注册、登录、登出、会话保持，以及当前登录用户信息获取，是所有需权限操作的基础模块。
#### 4.1.2 核心代码示例（后端）
```python
# app.py 登录接口示例
from flask import Flask, request, jsonify, session
from werkzeug.security import check_password_hash
from models import User

app = Flask(__name__)
app.secret_key = 'your-secret-key'  # 生产环境请替换为随机密钥

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Invalid email or password'}), 401
    
    # 会话保持
    session['user_id'] = user.id
    return jsonify({
        'id': user.id,
        'name': user.name,
        'email': user.email,
        'message': 'Login successful'
    })
```
#### 4.1.3 接口说明
| 接口地址 | 请求方式 | 请求参数 | 返回参数 | 说明 |
|----------|----------|----------|----------|------|
| `/api/auth/register` | POST | `{name:string, email:string, password:string}` | 用户信息 + 会话 | 用户注册 |
| `/api/auth/login` | POST | `{email:string, password:string}` | 用户信息 + 会话 | 用户登录 |
| `/api/auth/logout` | POST | - | `{message: string}` | 用户登出 |
| `/api/auth/me` | GET | - | 用户信息 / 401 | 获取当前登录用户 |

### 4.2 模块2：项目管理模块
#### 4.2.1 功能描述
支持项目的创建、编辑、删除，邀请成员加入项目，查看项目成员列表，是任务管理的上层组织模块。
#### 4.2.2 核心代码示例（后端）
```python
# app.py 创建项目接口示例
@app.route('/api/projects/create', methods=['POST'])
def create_project():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    new_project = Project(
        name=data.get('name'),
        description=data.get('description', ''),
        owner_id=session['user_id'],
        status='active'
    )
    db.session.add(new_project)
    db.session.commit()
    
    # 自动将创建者加入项目成员
    project_member = ProjectMember(project_id=new_project.id, user_id=session['user_id'])
    db.session.add(project_member)
    db.session.commit()
    
    return jsonify({'id': new_project.id, 'name': new_project.name, 'message': 'Project created'}), 201
```
#### 4.2.3 接口说明
| 接口地址 | 请求方式 | 权限 | 说明 |
|----------|----------|------|------|
| `/api/projects` | GET | 登录 | 获取当前用户参与的所有项目 |
| `/api/projects/create` | POST | 登录 | 创建项目 |
| `/api/projects/update/<id>` | PUT | 项目所有者 | 更新项目 |
| `/api/projects/delete/<id>` | DELETE | 项目所有者 | 删除项目 |
| `/api/projects/<id>/invite` | POST | 项目所有者 | 邀请成员 |
| `/api/projects/<id>/members` | GET | 登录且为成员 | 获取项目成员 |

### 4.3 模块3：任务看板模块
#### 4.3.1 功能描述
支持任务的创建、编辑、删除，拖拽更新任务状态，按优先级/成员筛选任务，搜索任务，关联至指定项目。
#### 4.3.2 接口说明
| 接口地址 | 请求方式 | 权限 | 说明 |
|----------|----------|------|------|
| `/api/projects/<pid>/tasks` | GET | 项目成员 | 获取项目所有任务 |
| `/api/projects/<pid>/tasks/create` | POST | 项目成员 | 创建任务 |
| `/api/projects/<pid>/tasks/update/<tid>` | PUT | 项目成员 | 更新任务（含状态/优先级） |
| `/api/projects/<pid>/tasks/delete/<tid>` | DELETE | 项目所有者 | 删除任务 |

### 4.4 模块4：评论系统模块
#### 4.4.1 功能描述
支持发表顶级评论、嵌套回复评论，点赞评论，删除评论，是团队互动沟通的核心模块。
#### 4.4.2 接口说明
| 接口地址 | 请求方式 | 权限 | 说明 |
|----------|----------|------|------|
| `/api/comments` | GET | 登录 | 获取所有顶级评论 |
| `/api/comments` | POST | 登录 | 发表评论 |
| `/api/comments/<id>/like` | POST | 登录 | 点赞评论 |
| `/api/comments/<id>` | DELETE | 本人或管理员 | 删除评论 |

### 4.5 模块5：数据可视化模块
#### 4.5.1 功能描述
基于项目和任务数据，生成任务分布、项目进度、优先级统计等可视化图表（柱状图、环形图等），帮助团队掌握协作状态。
#### 4.5.2 核心组件说明（前端）
```javascript
// src/components/ChartDashboard.js 核心逻辑示例
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';

const ChartDashboard = () => {
  const [taskData, setTaskData] = useState({});
  
  useEffect(() => {
    // 获取任务优先级统计数据
    axios.get('/api/projects/tasks/statistics/priority', { withCredentials: true })
      .then(res => {
        setTaskData({
          labels: ['Low', 'Medium', 'High', 'Urgent'],
          datasets: [{
            label: 'Task Priority',
            data: res.data,
            backgroundColor: ['#6c757d', '#ffc107', '#fd7e14', '#dc3545']
          }]
        });
      });
  }, []);
  
  return (
    <div className="chart-dashboard">
      <h2>Task Priority Statistics</h2>
      <Doughnut data={taskData} />
    </div>
  );
};

export default ChartDashboard;
```

### 4.6 模块6：系统健康检查模块
#### 4.6.1 功能描述
提供后端服务状态、数据库连接状态、系统信息查询，支持数据库初始化/重置（仅开发环境）。
#### 4.6.2 接口说明
| 接口地址 | 请求方式 | 说明 |
|----------|----------|------|
| `/` | GET | 欢迎信息 + 数据库状态 |
| `/api/health` | GET | 健康检查（含数据库连接） |
| `/api/db/init` | GET | 初始化数据库（开发用） |
| `/api/db/reset` | POST | 重置数据库（开发用） |

## 5. 目录结构说明
```
team-collaboration-platform/
├── backend/                     # 后端代码
│   ├── app.py                   # Flask 主应用，包含所有API和模型定义
│   ├── init_db.py               # 独立数据库初始化脚本
│   └── instance/                # SQLite 数据库文件存放目录
│       └── app.db
├── frontend/                    # 前端代码
│   ├── public/                  # 前端静态公共资源
│   ├── src/
│   │   ├── components/          # 子组件
│   │   │   ├── ProjectForm.js   # 项目表单
│   │   │   ├── TaskForm.js      # 任务表单
│   │   │   └── ChartDashboard.js # 数据可视化仪表板
│   │   ├── utils/
│   │   │   └── imageUtils.js    # 图片工具（随机图片）
│   │   ├── images/              # 静态图片资源
│   │   ├── App.js               # 主应用组件（全局状态+页面导航）
│   │   ├── App.css              # 全局样式
│   │   ├── Auth.js              # 登录/注册组件
│   │   ├── Auth.css             # 认证样式
│   │   └── index.js             # 前端入口文件
│   ├── package.json             # 前端依赖配置
│   └── README.md                # 前端子文档
└── README.md                    # 项目总文档
```

## 6. 数据库设计
### 6.1 主要模型
#### 6.1.1 User（用户）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| name | String(100) | 姓名 |
| email | String(120) | 邮箱（唯一） |
| password_hash | String(255) | 加密密码 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

#### 6.1.2 Project（项目）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| name | String(200) | 项目名称 |
| description | Text | 描述 |
| owner_id | Integer(FK) | 创建者ID |
| status | String(20) | 状态（active/completed/archived） |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

#### 6.1.3 Task（任务）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| title | String(200) | 任务标题 |
| description | Text | 描述 |
| project_id | Integer(FK) | 所属项目ID |
| assignee_id | Integer(FK) | 负责人ID |
| priority | String(20) | low/medium/high/urgent |
| status | String(20) | todo/in_progress/review/done |
| due_date | DateTime | 截止日期 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

#### 6.1.4 Comment（评论）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | Integer | 主键 |
| content | Text | 评论内容 |
| user_id | Integer(FK) | 评论者ID |
| parent_id | Integer(FK) | 父评论ID（用于回复） |
| likes | Integer | 点赞数 |
| created_at | DateTime | 创建时间 |
| updated_at | DateTime | 更新时间 |

### 6.2 关联表与关系
- **project_members**：项目与用户的多对多关系（包含 joined_at 字段）
- **关系图（简化）**：
```
User 1──< owns >──* Project
User *──< members >──* Project
Project 1──< contains >──* Task
Task *──< assigned to >──1 User
User 1──< writes >──* Comment
Comment *──< replies to >──1 Comment
```

## 7. 前端核心组件说明
| 组件名称 | 功能说明 |
|----------|----------|
| App.js | 主组件，管理全局状态（用户、项目、任务、评论等）和页面导航（基于activePage状态） |
| Auth.js | 登录/注册表单，处理用户认证逻辑 |
| ProjectForm.js | 创建/编辑项目的表单组件，包含表单验证、提交逻辑 |
| TaskForm.js | 创建/编辑任务的表单组件，支持关联项目、选择负责人、设置优先级/截止日期 |
| ChartDashboard.js | 数据图表仪表板，渲染任务分布、项目进度等可视化图表 |
| utils/imageUtils.js | 提供随机图片获取函数，用于首页背景图等场景 |

### 7.1 页面路由（状态驱动）
通过 `activePage` 全局状态控制渲染页面：
- `home`：首页（公告栏 + 项目管理 + 任务看板）
- `user`：用户中心（个人信息、用户列表、系统状态）
- `charts`：数据图表
- `comments`：评论区

## 8. 常见问题与解决方案
| 问题现象 | 可能原因 | 解决方案 |
|----------|----------|----------|
| 首次运行后端时数据库初始化失败 | instance 文件夹无写入权限 / Python依赖缺失 | 1. 确保instance文件夹可写；2. 手动运行 `python init_db.py`；3. 重新安装Flask-SQLAlchemy依赖 |
| 前端无法连接后端API | 后端未启动 / 端口不匹配 / 跨域问题 | 1. 确认后端运行在5000端口；2. 检查前端Axios的baseURL配置；3. 确认后端已启用Flask-CORS |
| 登录后接口返回401 | 会话未保持 / Cookie未携带 | 1. 后端配置secret_key；2. 前端请求添加`withCredentials: true`；3. 检查浏览器Cookie设置 |
| 无法修改默认密码 | 未修改初始化脚本中的默认值 | 在`app.py`的`init_db()`函数中修改默认密码'123456'为自定义值，重新执行初始化 |
| 任务拖拽更新状态不生效 | 前端状态同步失败 / 后端更新接口异常 | 1. 检查前端拖拽事件的状态提交逻辑；2. 调试后端PUT `/api/projects/<pid>/tasks/update/<tid>`接口 |

## 9. 版本更新记录
| 版本号 |  更新内容 | 维护人 |
|--------|----------|--------|
| v1.0.0.0 | 初始版本，完整技术文档 | YWXstrong |
| v1.0.0.1 | 目前还没找到网页图片的bug，暂时用文件予以代替 | YWXstrong |
| v1.0.0.2 | 为后端Flask和前端React，css添加代码注释便于学习 | YWXstrong |
| v1.0.0.3 | 添加了SQLlite数据库系统（下个版本用户注册登入系统的准备） | YWXstrong |
| v1.0.0.4 | 学习了代码的增添改删，具体移步GitHub（python.md）；增加了一个通过哈希函数制作的用户登入注册系统 | YWXstrong |
| v1.0.0.5 | 优化了前端的网页显示，配置了一个的图片背景自定义 | YWXstrong |
| v1.0.0.6 | 优化了前端的网页显示让网页看的更加正规 | YWXstrong |
| v1.0.0.7 | 布局了一下简单的网页颜色，使颜色更加符合商业化 | YWXstrong |
| v1.0.0.8 | 更新了一个新的项目管理模块，更加提升了协作效率（更新技术文档） | YWXstrong |
| v1.0.0.9 | 优化了网页端ui，消化吸收项目管理模块函数架构运行逻辑 | YWXstrong |
| v1.0.1.0 | 学习解决了插件在JavaScript中的使用逻辑 | YWXstrong |
| v1.0.1.1 | 系统学习css，js的编写，不会的学习Mdn官方文档 | YWXstrong |
| v1.0.1.2 | 学习重构了网页的布局 | YWXstrong |
| v1.0.1.3 | 更新了一个任务看板模块，集合项目管理，修复了一些项目管理和任务看板模块的显示冲突bug，后续继续细致学习细节中 | YWXstrong |
| v1.0.1.4 | 优化了登录界面，让登入界面拥有一个一张自选图片背景，而不是纯颜色 | YWXstrong |
| v1.0.1.5 | 把网页最前面的文本框改成了一个实现基础内容的公告栏 | YWXstrong |
| v1.0.1.6 | 学习经典的版本回退(多重导航栏技术学习中) | YWXstrong |
| v1.0.1.7 | 导航栏模块（代码小重构）首页，用户中心，评论，登出 | YWXstrong |
| v1.0.1.8 | 图表直观显示任务看板&项目管理内容 | YWXstrong |
| v1.0.1.9 | 网页相关样式修改，更加符合整体配色&主题 | YWXstrong |

## 10. 贡献指南
### 10.1 分支规范
- `main/master`：生产环境分支，禁止直接提交代码
- `develop`：开发主分支，所有功能分支基于此分支创建
- `feature/xxx`：功能开发分支，如`feature/chart-optimize`
- `bugfix/xxx`：bug修复分支，如`bugfix/comment-like`

### 10.2 提交规范
提交信息遵循Conventional Commits规范，示例：
```bash
git commit -m "feat: 新增任务拖拽更新状态功能"
git commit -m "fix: 修复评论嵌套回复显示异常问题"
git commit -m "docs: 更新数据库设计文档"
```

### 10.3 PR提交流程
1. Fork 本仓库
2. 创建功能/修复分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add some feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 提交 Pull Request

> 请确保代码风格符合项目规范，并编写必要的注释。

## 11. 许可证
MIT License

## 12. 联系方式
- 项目仓库：https://github.com/your-username/team-collaboration-platform
- 问题反馈：https://github.com/your-username/team-collaboration-platform/issues
- 项目演示：https://www.bilibili.com/video/BV1xZAhzREF3/?share_source=copy_web&vd_source=ceaf6abe8833277a67532e1d8cf02e75