# 导入Flask框架和相关模块
from flask import Flask, jsonify, Response, request, session  # Flask核心，jsonify用于返回JSON，Response用于构建响应，request用于获取请求数据，session用于会话管理
from flask_cors import CORS  # 处理跨域资源共享（CORS），允许前端应用访问后端API

# 【新增】导入SQLAlchemy用于数据库操作
from flask_sqlalchemy import SQLAlchemy  # type: ignore # SQLAlchemy ORM
# 【新增】导入操作系统和日期时间模块
import os
from datetime import datetime

# 【新增】导入json模块（虽然之前有，但保留以保持代码清晰）
import json  # Python内置的JSON处理模块

# 【新增】导入密码哈希工具
from werkzeug.security import generate_password_hash, check_password_hash  # 用于密码加密和验证

# 创建Flask应用实例，__name__表示当前模块名
app = Flask(__name__)
# 启用CORS，允许所有域名访问（开发环境配置）
CORS(app)

# Flask应用配置：确保JSON响应中的中文字符正常显示（默认会被转义为Unicode）
app.config['JSON_AS_ASCII'] = False

# 【新增】数据库配置开始
# 获取当前文件所在目录的绝对路径
basedir = os.path.abspath(os.path.dirname(__file__))
# 配置SQLite数据库路径（放在项目根目录的instance文件夹中）
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 关闭修改跟踪，减少内存开销
app.config['SECRET_KEY'] = 'your-secret-key-here'  # 用于会话安全，生产环境请使用强密钥

# 【新增】初始化数据库
db = SQLAlchemy(app)

# 【新增】定义用户模型（对应数据库表）
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  # 【新增】存储加密后的密码
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def set_password(self, password):
        """设置密码（自动加密）"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """验证密码"""
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        """将模型对象转换为字典，便于JSON序列化（不包含密码）"""
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

# 【新增】初始化数据库（创建表）
def init_db():
    with app.app_context():
        # 创建instance文件夹（如果不存在）
        instance_path = os.path.join(basedir, 'instance')
        if not os.path.exists(instance_path):
            os.makedirs(instance_path)
        
        # 创建所有表
        db.create_all()
        
        # 如果用户表为空，则添加示例数据（注意：现在需要密码）
        if User.query.count() == 0:
            sample_users = [
                {"name": "张三", "email": "zhangsan@example.com", "password": "123456"},
                {"name": "李四", "email": "lisi@example.com", "password": "123456"},
                {"name": "YWXstrong", "email": "w162675761@qq.com", "password": "123456"}
            ]
            
            for user_data in sample_users:
                password = user_data.pop('password')  # 取出密码
                user = User(**user_data)
                user.set_password(password)  # 设置加密后的密码
                db.session.add(user)
            
            db.session.commit()
            print("数据库初始化完成，已添加示例数据（默认密码：123456）")
# 【新增】数据库配置结束

# 定义根路由，当访问 http://localhost:5000/ 时触发
@app.route('/')
def home():
    # 返回JSON格式的欢迎消息，包含服务状态和版本信息
    # 【修改】更新欢迎消息，提示已连接数据库
    return jsonify({
        "message": "Flask 后端服务运行正常！已连接SQLite数据库",  # 【修改】添加数据库连接信息
        "status": "success",
        "version": "1.0.0",
        "database": "SQLite"  # 【新增】添加数据库类型字段
    })

# 定义用户数据API路由，GET方法获取用户列表
@app.route('/api/users')
def get_users():
    # 【修改】从硬编码数据改为从数据库获取
    try:
        # 【修改】从数据库获取所有用户，而不是硬编码数据
        users = User.query.all()
        # 将用户列表转换为JSON响应
        return jsonify([user.to_dict() for user in users])  # 【修改】使用to_dict方法
    except Exception as e:
        return jsonify({"error": str(e)}), 500  # 【新增】错误处理

# 【新增】用户注册API路由
@app.route('/api/auth/register', methods=['POST'])
def register():
    """用户注册"""
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "缺少必要字段（name, email, password）"}), 400
        
        # 检查邮箱是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "该邮箱已被使用"}), 409
        
        # 创建新用户
        new_user = User(
            name=data['name'],
            email=data['email']
        )
        new_user.set_password(data['password'])  # 设置加密后的密码
        
        db.session.add(new_user)
        db.session.commit()
        
        # 自动登录（设置会话）
        session['user_id'] = new_user.id
        session['user_name'] = new_user.name
        
        return jsonify({
            "message": "注册成功",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 【新增】用户登录API路由
@app.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        if not data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "请提供邮箱和密码"}), 400
        
        # 查找用户
        user = User.query.filter_by(email=data['email']).first()
        
        # 验证用户和密码
        if not user or not user.check_password(data['password']):
            return jsonify({"error": "邮箱或密码错误"}), 401
        
        # 设置会话
        session['user_id'] = user.id
        session['user_name'] = user.name
        
        return jsonify({
            "message": "登录成功",
            "user": user.to_dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 【新增】用户登出API路由
@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """用户登出"""
    try:
        session.clear()  # 清除所有会话数据
        return jsonify({"message": "登出成功"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 【新增】检查登录状态API路由
@app.route('/api/auth/me', methods=['GET'])
def get_current_user():
    """获取当前登录用户信息"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "未登录"}), 401
        
        user = User.query.get(user_id)
        if not user:
            session.clear()
            return jsonify({"error": "用户不存在"}), 404
        
        return jsonify({
            "user": user.to_dict(),
            "is_logged_in": True
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 【新增】添加新用户API路由（保留原有功能，但需要密码）
@app.route('/api/users/add', methods=['POST'])
def add_user():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'email' not in data or 'password' not in data:
            return jsonify({"error": "缺少必要字段（name, email, password）"}), 400
        
        # 检查邮箱是否已存在
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"error": "该邮箱已被使用"}), 409
        
        # 创建新用户
        new_user = User(
            name=data['name'],
            email=data['email']
        )
        new_user.set_password(data['password'])  # 设置加密后的密码
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({
            "message": "用户添加成功",
            "user": new_user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 【新增】更新用户API路由
@app.route('/api/users/update/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        from flask import request
        
        data = request.get_json()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "用户不存在"}), 404
        
        # 更新用户信息
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # 检查邮箱是否已被其他用户使用
            existing_user = User.query.filter_by(email=data['email']).first()
            if existing_user and existing_user.id != user_id:
                return jsonify({"error": "该邮箱已被其他用户使用"}), 409
            user.email = data['email']
        
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "用户更新成功",
            "user": user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 【新增】删除用户API路由
@app.route('/api/users/delete/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "用户不存在"}), 404
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({"message": "用户删除成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 【新增】获取单个用户API路由
@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"error": "用户不存在"}), 404
        
        return jsonify(user.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 定义健康检查路由，用于监控服务状态
@app.route('/api/health')
def health_check():
    # 【修改】健康检查添加数据库状态信息
    try:
        # 测试数据库连接
        db.session.execute('SELECT 1')
        db_status = 'connected'
        user_count = User.query.count()
    except Exception as e:
        db_status = f'disconnected: {str(e)}'
        user_count = 0
    
    return jsonify({
        "status": "healthy",
        "service": "improved-enigma",
        "database": db_status,  # 【新增】数据库连接状态
        "total_users": user_count,  # 【新增】用户总数
        "timestamp": datetime.utcnow().isoformat()  # 【新增】时间戳
    })

# 【新增】数据库管理路由（仅开发环境使用）
@app.route('/api/db/init')
def init_database():
    try:
        init_db()
        return jsonify({"message": "数据库初始化成功"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 程序入口点：当直接运行此脚本时启动Flask开发服务器
if __name__ == '__main__':
    # 【新增】初始化数据库（仅在第一次运行时创建）
    init_db()
    
    # 启动服务器，参数说明：
    # debug=True - 开启调试模式（代码更改自动重启，显示详细错误信息）
    # host='0.0.0.0' - 监听所有网络接口（允许外部访问）
    # port=5000 - 使用5000端口（默认Flask端口）
    app.run(debug=True, host='0.0.0.0', port=5000)