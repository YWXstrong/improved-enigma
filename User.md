# 用户登录注册系统实现文档

## 一、项目概述

本次更新为项目添加了完整的用户认证系统，包括用户注册、登录、登出功能，实现了基于密码的安全认证机制。

## 二、主要更改内容

### 2.1 后端更改（`backend/app.py`）

#### 1. 用户模型扩展
- **添加字段**：在 `User` 模型中新增 `password_hash` 字段，用于存储加密后的密码
- **密码管理方法**：
  - `set_password(password)`: 设置并加密密码
  - `check_password(password)`: 验证密码是否正确

#### 2. 认证API端点
新增了4个认证相关的API路由：
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前登录用户信息

#### 3. 数据库迁移处理
- 实现了自动检测和添加缺失字段的功能
- 支持从旧版数据库平滑升级到新版

### 2.2 前端更改

#### 1. 新建组件
- **`Auth.js`**: 登录/注册表单组件
  - 支持登录和注册模式切换
  - 表单验证和错误提示
  - 密码最小长度验证（6位）

#### 2. 主应用更新（`App.js`）
- 添加登录状态管理
- 自动检查用户登录状态
- 根据登录状态显示不同界面
- 集成登出功能

#### 3. 样式文件
- **`Auth.css`**: 登录/注册界面样式
- 更新 **`App.css`**: 添加用户信息显示样式

## 三、重点函数和API

### 3.1 密码加密相关函数

#### `generate_password_hash(password)`
- **来源**：`werkzeug.security`
- **功能**：将明文密码转换为加密哈希值
- **算法**：使用 PBKDF2 (Password-Based Key Derivation Function 2) 算法
- **特点**：
  - 每次加密结果不同（使用随机盐值）
  - 不可逆（无法从哈希值反推原始密码）
  - 抗暴力破解

**使用示例**：
```python
from werkzeug.security import generate_password_hash

password_hash = generate_password_hash('123456')
# 结果类似：'pbkdf2:sha256:600000$salt$hash...'
```

#### `check_password_hash(password_hash, password)`
- **来源**：`werkzeug.security`
- **功能**：验证明文密码是否与存储的哈希值匹配
- **原理**：使用相同的算法和盐值重新计算哈希，然后比较结果

**使用示例**：
```python
from werkzeug.security import check_password_hash

is_correct = check_password_hash(stored_hash, '123456')
# 返回 True 或 False
```

### 3.2 Session 管理函数

#### `session['key'] = value`
- **来源**：Flask `session` 对象
- **功能**：存储会话数据（服务器端，通过加密的cookie传递）
- **用途**：保存用户登录状态

**使用示例**：
```python
from flask import session

# 登录时设置
session['user_id'] = user.id
session['user_name'] = user.name

# 检查登录状态
user_id = session.get('user_id')
```

#### `session.clear()`
- **功能**：清除所有会话数据
- **用途**：用户登出时使用

### 3.3 数据库操作函数

#### `db.create_all()`
- **来源**：SQLAlchemy
- **功能**：根据模型定义创建所有数据库表
- **特点**：如果表已存在则不会重复创建

#### `PRAGMA table_info(table_name)`
- **来源**：SQLite 系统命令
- **功能**：获取表的结构信息（列名、类型等）
- **用途**：检查表是否包含某个字段，用于数据库迁移

**使用示例**：
```python
result = db.session.execute(db.text("PRAGMA table_info(users)"))
columns = [row[1] for row in result.fetchall()]  # 获取所有列名
if 'password_hash' not in columns:
    # 添加缺失的列
    db.session.execute(db.text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
```

### 3.4 前端关键函数

#### `axios.post(url, data, config)`
- **来源**：axios 库
- **功能**：发送 POST 请求到后端API
- **配置**：`withCredentials: true` 允许发送 cookies（用于 session）

**使用示例**：
```javascript
const response = await axios.post('http://localhost:5000/api/auth/login', {
  email: formData.email,
  password: formData.password
}, {
  withCredentials: true  // 重要：允许发送 cookies
});
```

## 四、运用的算法和原理

### 4.1 密码哈希算法：PBKDF2

#### 算法原理
- **全称**：Password-Based Key Derivation Function 2（基于密码的密钥派生函数2）
- **标准**：RFC 2898
- **工作原理**：
  1. 生成随机盐值（salt）
  2. 将密码和盐值组合
  3. 使用哈希函数（如 SHA-256）进行多次迭代（默认 260,000 次）
  4. 生成固定长度的密钥/哈希值

#### 安全特性
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

### 4.2 Session 管理机制

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

### 4.3 数据库迁移策略

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

## 五、安全考虑

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

## 七、后续扩展建议

1. **密码强度验证**：添加密码复杂度要求
2. **记住我功能**：实现长期登录（使用 JWT token）
3. **密码重置**：添加忘记密码功能
4. **用户资料编辑**：允许用户修改个人信息
5. **权限管理**：实现基于角色的访问控制（RBAC）

## 八、技术栈总结

- **后端**：Flask + SQLAlchemy + werkzeug
- **前端**：React + axios
- **数据库**：SQLite
- **加密算法**：PBKDF2 (通过 werkzeug)
- **会话管理**：Flask Session

---

**文档版本**：1.0  
**最后更新**：2024年

