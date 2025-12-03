# 导入Flask框架和相关模块
from flask import Flask, jsonify, Response  # Flask核心，jsonify用于返回JSON，Response用于构建响应
from flask_cors import CORS  # 处理跨域资源共享（CORS），允许前端应用访问后端API
import json  # Python内置的JSON处理模块

# 创建Flask应用实例，__name__表示当前模块名
app = Flask(__name__)
# 启用CORS，允许所有域名访问（开发环境配置）
CORS(app)

# Flask应用配置：确保JSON响应中的中文字符正常显示（默认会被转义为Unicode）
app.config['JSON_AS_ASCII'] = False

# 定义根路由，当访问 http://localhost:5000/ 时触发
@app.route('/')
def home():
    # 返回JSON格式的欢迎消息，包含服务状态和版本信息
    return jsonify({
        "message": "Flask 后端服务运行正常！",
        "status": "success",
        "version": "1.0.0"
    })

# 定义用户数据API路由，GET方法获取用户列表
@app.route('/api/users')
def get_users():
    # 模拟用户数据（实际项目通常从数据库获取）
    users = [
        {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
        {"id": 2, "name": "李四", "email": "lisi@example.com"},
        {"id": 3, "name": "YWXstrong", "email": "w162675761@qq.com"}
    ]
    # 将用户列表转换为JSON响应
    return jsonify(users)

# 定义健康检查路由，用于监控服务状态
@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "service": "improved-enigma"})

# 程序入口点：当直接运行此脚本时启动Flask开发服务器
if __name__ == '__main__':
    # 启动服务器，参数说明：
    # debug=True - 开启调试模式（代码更改自动重启，显示详细错误信息）
    # host='0.0.0.0' - 监听所有网络接口（允许外部访问）
    # port=5000 - 使用5000端口（默认Flask端口）
    app.run(debug=True, host='0.0.0.0', port=5000)