
# 技术选型基于<团队协作模型基于Flask+React+SQLite的联合开发>

**决策者**: YWXstrong (w162675761@qq.com)

# ## 📖 文档目录

- 项目概述
    
- 技术架构
    
- 环境配置
    
- 开发指南
    
- API文档
    
- 部署说明
    
- 故障排除
    
- 学习总结
    
- 后续规划


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

### 用户登入注册模块
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
- ✅ 密码使用 PBKDF2 加密存储
- ✅ 密码不会以明文形式传输或存储
- ✅ 密码验证失败时返回通用错误信息（防止用户枚举）

### 5.2 Session 安全
- ✅ 使用 `SECRET_KEY` 签名 session cookie
- ✅ 支持 CORS credentials（`supports_credentials=True`）
- ✅ 登出时清除所有 session 数据

### 5.3 输入验证
- ✅ 前端：HTML5 表单验证（required, minLength, type="email"）
- ✅ 后端：检查必要字段是否存在
- ✅ 邮箱唯一性检查

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



 



