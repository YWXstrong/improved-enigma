# 导入Flask框架和相关模块
from flask import Flask, jsonify, Response, request, session  # Flask核心，jsonify用于返回JSON，Response用于构建响应，request用于获取请求数据，session用于会话管理
from flask_cors import CORS  # 处理跨域资源共享（CORS），允许前端应用访问后端API

# 导入SQLAlchemy用于数据库操作
from flask_sqlalchemy import SQLAlchemy  # type: ignore # SQLAlchemy ORM
# 导入操作系统和日期时间模块
import os
from datetime import datetime

# 导入json模块（虽然之前有，但保留以保持代码清晰）
import json  # Python内置的JSON处理模块

# 导入密码哈希工具
from werkzeug.security import generate_password_hash, check_password_hash  # 用于密码加密和验证

from datetime import datetime, timedelta #用于获取任务日期


# 创建Flask应用实例，__name__表示当前模块名
app = Flask(__name__)
# 启用CORS，允许所有域名访问（开发环境配置）
# supports_credentials=True 允许前端发送 cookies（用于 session 管理）
CORS(app, supports_credentials=True)

# Flask应用配置：确保JSON响应中的中文字符正常显示（默认会被转义为Unicode）
app.config['JSON_AS_ASCII'] = False

# 【新增】数据库配置开始
# 获取当前文件所在目录的绝对路径
basedir = os.path.abspath(os.path.dirname(__file__))
# 配置SQLite数据库路径（放在项目根目录的instance文件夹中）
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "instance", "app.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # 关闭修改跟踪，减少内存开销
app.config['SECRET_KEY'] = 'your-secret-key-here'  # 用于会话安全，生产环境请使用强密钥

# 始化数据库
db = SQLAlchemy(app)

# 定义用户模型（对应数据库表）
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=True)  # 【修改】允许为空，便于数据库迁移
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
        
        
        
     #评论系统
class Comment(db.Model):
    __tablename__ = 'comments'
    
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('comments.id'), nullable=True)  # 用于回复
    likes = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    user = db.relationship('User', backref='comments')
    parent = db.relationship('Comment', remote_side=[id], backref='replies')
    
    def to_dict(self):
        return {
            'id': self.id,
            'content': self.content,
            'user_id': self.user_id,
            'user_name': self.user.name if self.user else None,
            'user_avatar': self.user.name[0] if self.user else None,
            'parent_id': self.parent_id,
            'likes': self.likes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'replies': [reply.to_dict() for reply in self.replies] if self.replies else []
        }
         # API路由
@app.route('/api/comments', methods=['GET'])
def get_comments():
    """获取所有评论（顶级评论）"""
    try:
        comments = Comment.query.filter_by(parent_id=None).order_by(Comment.created_at.desc()).all()
        return jsonify([comment.to_dict() for comment in comments])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/comments', methods=['POST'])
def create_comment():
    """创建评论"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        data = request.get_json()
        if not data or 'content' not in data:
            return jsonify({"error": "评论内容不能为空"}), 400
        
        new_comment = Comment(
            content=data['content'],
            user_id=user_id,
            parent_id=data.get('parent_id')
        )
        
        db.session.add(new_comment)
        db.session.commit()
        
        return jsonify({
            "message": "评论发布成功",
            "comment": new_comment.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/comments/<int:comment_id>/like', methods=['POST'])
def like_comment(comment_id):
    """点赞评论"""
    try:
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "评论不存在"}), 404
        
        comment.likes += 1
        db.session.commit()
        
        return jsonify({
            "message": "点赞成功",
            "likes": comment.likes
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    """删除评论"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({"error": "评论不存在"}), 404
        
        # 检查权限（只有评论作者或管理员可以删除）
        user = User.query.get(user_id)
        if comment.user_id != user_id and user.name != '管理员':
            return jsonify({"error": "无权删除此评论"}), 403
        
        db.session.delete(comment)
        db.session.commit()
        
        return jsonify({"message": "评论删除成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

     
     
      # 项目管理模块函数定义
class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), default='active')  # active, completed, archived
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    owner = db.relationship('User', backref='owned_projects')
    members = db.relationship('User', secondary='project_members', backref='projects')
    
    def to_dict(self):
        """将项目对象转换为字典"""
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'owner_id': self.owner_id,
            'owner_name': self.owner.name if self.owner else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'member_count': len(self.members) if self.members else 0
        }

# 【新增】项目成员关联表
project_members = db.Table('project_members',
    db.Column('project_id', db.Integer, db.ForeignKey('projects.id'), primary_key=True),
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('joined_at', db.DateTime, default=datetime.utcnow)
)
# 【新增】任务模型
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
    
    # 关系
    project = db.relationship('Project', backref='tasks')
    assignee = db.relationship('User', backref='assigned_tasks')
    
    def to_dict(self):
        """将任务对象转换为字典"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'project_id': self.project_id,
            'assignee_id': self.assignee_id,
            'assignee_name': self.assignee.name if self.assignee else None,
            'assignee_avatar': self.assignee.name[0] if self.assignee else None,
            'priority': self.priority,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
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
        
        # 检查数据库文件是否存在
        db_path = os.path.join(instance_path, 'app.db')
        db_exists = os.path.exists(db_path)
        
        # 创建所有表
        db.create_all()
        
        # 如果数据库已存在，检查是否需要添加 password_hash 列
        if db_exists:
            try:
                # 使用 PRAGMA 检查列是否存在
                result = db.session.execute(db.text("PRAGMA table_info(users)"))
                columns = [row[1] for row in result.fetchall()]  # 获取所有列名
                
                if 'password_hash' not in columns:
                    # 如果列不存在，添加列
                    print("检测到旧版数据库，正在添加 password_hash 列...")
                    db.session.execute(db.text("ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)"))
                    db.session.commit()
                    print("成功添加 password_hash 列")
                else:
                    print("数据库表结构已是最新版本")
            except Exception as e:
                # 如果检查失败，尝试删除表重建（开发环境）
                print(f"检查表结构时出错: {e}")
                print("尝试重新创建表（会丢失现有数据）...")
                try:
                    db.drop_all()
                    db.create_all()
                    print("表已重新创建")
                except Exception as rebuild_error:
                    print(f"重新创建表失败: {rebuild_error}")
        
        # 检查并更新现有用户（为没有密码的用户设置默认密码）
        try:
            users_without_password = User.query.filter(
                (User.password_hash == None) | (User.password_hash == '')
            ).all()
            
            if users_without_password:
                print(f"发现 {len(users_without_password)} 个用户没有密码，正在设置默认密码...")
                for user in users_without_password:
                    user.set_password('123456')  # 设置默认密码
                db.session.commit()
                print("已为现有用户设置默认密码：123456")
        except Exception as e:
            print(f"检查用户密码时出错（可能是新数据库）: {e}")
        
        # 如果用户表为空，则添加示例数据（注意：现在需要密码）
        try:
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
        except Exception as e:
            print(f"添加示例数据时出错: {e}")  
            db.session.rollback()
        
        # 在用户示例数据添加后，添加项目示例数据：
        try:
            if Project.query.count() == 0:
                # 获取一些用户作为项目所有者
                users = User.query.limit(2).all()
                
                if users:
                    sample_projects = [
                        {
                            "name": "网站重构项目",
                            "description": "重构公司官方网站，提升用户体验",
                            "owner_id": users[0].id,
                            "status": "active"
                        },
                        {
                            "name": "移动应用开发",
                            "description": "开发新一代移动应用",
                            "owner_id": users[1].id if len(users) > 1 else users[0].id,
                            "status": "active"
                        }
                    ]
                    
                    for project_data in sample_projects:
                        project = Project(**project_data)
                        # 将所有者添加为成员
                        project.members.append(User.query.get(project_data['owner_id']))
                        db.session.add(project)
                    
                    db.session.commit()
                    print("项目示例数据添加成功")
        except Exception as e:
            print(f"添加项目示例数据时出错: {e}")
            db.session.rollback()
        
        # 【新增】初始化数据库时添加任务示例数据：
        try:
            if Task.query.count() == 0:
                # 获取项目和用户
                projects = Project.query.all()
                users = User.query.all()
                
                if projects and users:
                    sample_tasks = [
                        {
                            "title": "设计登录页面",
                            "description": "设计用户登录界面，包括表单验证和响应式布局",
                            "project_id": projects[0].id,
                            "assignee_id": users[0].id if users else None,
                            "priority": "high",
                            "status": "todo",
                            "due_date": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=7)
                        },
                        {
                            "title": "后端API开发",
                            "description": "开发用户管理相关的RESTful API接口",
                            "project_id": projects[0].id,
                            "assignee_id": users[1].id if len(users) > 1 else None,
                            "priority": "medium",
                            "status": "in_progress",
                            "due_date": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=5)
                        },
                        {
                            "title": "数据库设计",
                            "description": "设计项目数据库结构，包括表和关系",
                            "project_id": projects[1].id if len(projects) > 1 else projects[0].id,
                            "assignee_id": users[0].id if users else None,
                            "priority": "urgent",
                            "status": "review",
                            "due_date": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=3)
                        },
                        {
                            "title": "测试用例编写",
                            "description": "编写单元测试和集成测试用例",
                            "project_id": projects[1].id if len(projects) > 1 else projects[0].id,
                            "assignee_id": users[1].id if len(users) > 1 else None,
                            "priority": "low",
                            "status": "done",
                            "due_date": datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=1)
                        }
                    ]
                    
                    for task_data in sample_tasks:
                        task = Task(**task_data)
                        db.session.add(task)
                    
                    db.session.commit()
                    print("任务示例数据添加成功")
        except Exception as e:
            print(f"添加任务示例数据时出错: {e}")
            db.session.rollback()
    
# 【新增】数据库配置结束

# 定义根路由，当访问 http://localhost:5000/ 时触发
@app.route('/')
def home():
    # 返回JSON格式的欢迎消息，包含服务状态和版本信息
    # 【修改】更新欢迎消息，提示已连接数据库
    return jsonify({
        "message": "欢迎使用团队协作平台！",  # 【修改】添加数据库连接信息
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
        
        # 检查用户是否存在
        if not user:
            return jsonify({"error": "邮箱或密码错误"}), 401
        
        # 检查用户是否有密码（处理旧数据）
        if not user.password_hash:
            # 如果用户没有密码，设置默认密码
            user.set_password('123456')
            db.session.commit()
            return jsonify({
                "message": "检测到您的账号需要设置密码，已自动设置默认密码：123456，请重新登录",
                "error": "请使用默认密码 123456 重新登录"
            }), 400
        
        # 验证密码
        if not user.check_password(data['password']):
            return jsonify({"error": "邮箱或密码错误"}), 401
        
        # 设置会话
        session['user_id'] = user.id
        session['user_name'] = user.name
        
        return jsonify({
            "message": "登录成功",
            "user": user.to_dict()
        })
    except Exception as e:
        import traceback
        print(f"登录错误: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": f"登录失败: {str(e)}"}), 500

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

# 【新增】重置数据库路由（仅开发环境使用，会删除所有数据）
@app.route('/api/db/reset', methods=['POST'])
def reset_database():
    """重置数据库（删除所有表并重新创建）"""
    try:
        with app.app_context():
            db.drop_all()
            db.create_all()
            init_db()
        return jsonify({"message": "数据库重置成功，所有用户默认密码为：123456"})
    except Exception as e:
        import traceback
        print(f"重置数据库错误: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
    

# 项目管理模块
# 获取当前用户的所有项目
@app.route('/api/projects')
def get_projects():
    """获取当前用户参与的所有项目"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        # 获取用户创建和参与的项目
        user = User.query.get(user_id)
        projects = user.owned_projects + user.projects
        # 去重
        unique_projects = list({p.id: p for p in projects}.values())
        
        return jsonify([project.to_dict() for project in unique_projects])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 创建新项目
@app.route('/api/projects/create', methods=['POST'])
def create_project():
    """创建新项目"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({"error": "项目名称不能为空"}), 400
        
        # 创建项目
        new_project = Project(
            name=data['name'],
            description=data.get('description', ''),
            owner_id=user_id,
            status=data.get('status', 'active')
        )
        
        # 将创建者添加为项目成员
        new_project.members.append(User.query.get(user_id))
        
        db.session.add(new_project)
        db.session.commit()
        
        return jsonify({
            "message": "项目创建成功",
            "project": new_project.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 更新项目
@app.route('/api/projects/update/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    """更新项目信息"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查权限（只有创建者可以修改）
        if project.owner_id != user_id:
            return jsonify({"error": "无权修改此项目"}), 403
        
        data = request.get_json()
        if 'name' in data:
            project.name = data['name']
        if 'description' in data:
            project.description = data['description']
        if 'status' in data:
            project.status = data['status']
        
        project.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "项目更新成功",
            "project": project.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 删除项目
@app.route('/api/projects/delete/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    """删除项目"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查权限（只有创建者可以删除）
        if project.owner_id != user_id:
            return jsonify({"error": "无权删除此项目"}), 403
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({"message": "项目删除成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 邀请用户加入项目
@app.route('/api/projects/<int:project_id>/invite', methods=['POST'])
def invite_to_project(project_id):
    """邀请用户加入项目"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查权限（只有创建者可以邀请）
        if project.owner_id != user_id:
            return jsonify({"error": "无权邀请成员"}), 403
        
        data = request.get_json()
        if not data or 'email' not in data:
            return jsonify({"error": "请提供用户邮箱"}), 400
        
        # 查找用户
        user = User.query.filter_by(email=data['email']).first()
        if not user:
            return jsonify({"error": "用户不存在"}), 404
        
        # 检查是否已经是成员
        if user in project.members:
            return jsonify({"error": "用户已是项目成员"}), 400
        
        # 添加成员
        project.members.append(user)
        db.session.commit()
        
        return jsonify({
            "message": f"已邀请 {user.name} 加入项目",
            "user": user.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 获取项目成员
@app.route('/api/projects/<int:project_id>/members')
def get_project_members(project_id):
    """获取项目成员列表"""
    try:
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        return jsonify([user.to_dict() for user in project.members])
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
# 【新增】获取项目任务列表
@app.route('/api/projects/<int:project_id>/tasks')
def get_project_tasks(project_id):
    """获取项目的所有任务"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        # 检查用户是否有权限访问该项目
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查用户是否是项目成员
        user = User.query.get(user_id)
        if user not in project.members and project.owner_id != user_id:
            return jsonify({"error": "无权访问此项目"}), 403
        
        tasks = Task.query.filter_by(project_id=project_id).all()
        return jsonify([task.to_dict() for task in tasks])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 【新增】创建任务
@app.route('/api/projects/<int:project_id>/tasks/create', methods=['POST'])
def create_task(project_id):
    """创建新任务"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        project = Project.query.get(project_id)
        if not project:
            return jsonify({"error": "项目不存在"}), 404
        
        # 检查用户是否是项目成员
        user = User.query.get(user_id)
        if user not in project.members and project.owner_id != user_id:
            return jsonify({"error": "无权在此项目创建任务"}), 403
        
        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({"error": "任务标题不能为空"}), 400
        
        # 处理截止日期
        due_date = None
        if 'due_date' in data and data['due_date']:
            try:
                due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except:
                try:
                    due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
                except:
                    pass
        
        # 创建任务
        new_task = Task(
            title=data['title'],
            description=data.get('description', ''),
            project_id=project_id,
            assignee_id=data.get('assignee_id'),
            priority=data.get('priority', 'medium'),
            status=data.get('status', 'todo'),
            due_date=due_date
        )
        
        db.session.add(new_task)
        db.session.commit()
        
        return jsonify({
            "message": "任务创建成功",
            "task": new_task.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 【新增】更新任务
@app.route('/api/projects/<int:project_id>/tasks/update/<int:task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    """更新任务信息"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        task = Task.query.get(task_id)
        if not task or task.project_id != project_id:
            return jsonify({"error": "任务不存在"}), 404
        
        # 检查用户是否是项目成员
        user = User.query.get(user_id)
        project = Project.query.get(project_id)
        if user not in project.members and project.owner_id != user_id:
            return jsonify({"error": "无权修改此任务"}), 403
        
        data = request.get_json()
        
        # 更新任务信息
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'assignee_id' in data:
            task.assignee_id = data['assignee_id']
        if 'priority' in data:
            task.priority = data['priority']
        if 'status' in data:
            task.status = data['status']
        if 'due_date' in data:
            if data['due_date']:
                try:
                    task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                except:
                    try:
                        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d')
                    except:
                        task.due_date = None
            else:
                task.due_date = None
        
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            "message": "任务更新成功",
            "task": task.to_dict()
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 【新增】删除任务
@app.route('/api/projects/<int:project_id>/tasks/delete/<int:task_id>', methods=['DELETE'])
def delete_task(project_id, task_id):
    """删除任务"""
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({"error": "请先登录"}), 401
        
        task = Task.query.get(task_id)
        if not task or task.project_id != project_id:
            return jsonify({"error": "任务不存在"}), 404
        
        # 检查权限（项目创建者或任务创建者可以删除）
        user = User.query.get(user_id)
        project = Project.query.get(project_id)
        
        # 只有项目创建者可以删除任务
        if project.owner_id != user_id:
            return jsonify({"error": "无权删除此任务"}), 403
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({"message": "任务删除成功"})
    except Exception as e:
        db.session.rollback()
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