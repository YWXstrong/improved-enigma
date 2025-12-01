from flask import Flask, jsonify, Response
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)  # 允许前端跨域请求

# 设置 JSON 确保中文正常显示
app.config['JSON_AS_ASCII'] = False

# 基础路由
@app.route('/')
def home():
    return jsonify({
        "message": "Flask 后端服务运行正常！",
        "status": "success",
        "version": "1.0.0"
    })

@app.route('/api/users')
def get_users():
    # 示例 API
    users = [
        {"id": 1, "name": "张三", "email": "zhangsan@example.com"},
        {"id": 2, "name": "李四", "email": "lisi@example.com"},
        {"id": 3, "name": "YWXstrong", "email": "w162675761@qq.com"}
    ]
    return jsonify(users)

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "service": "improved-enigma"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)