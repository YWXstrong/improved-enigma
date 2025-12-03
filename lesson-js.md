# 注释学习day1

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
//导入必要模块
//1.reac核心库以及两种重要的HOOK（usestate用于管理状态。useEffect用于副作用处理）
//2.axios用于HTTP请求
//3.应用的css的样式文件

function App() {
  //定义组件的状态（之后的代码第一块就在这里面改）
  const [message, setMessage] = useState('');   //储存后端返回的欢迎消息
  const [users, setUsers] = useState([]);       //储存用户列表数据
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值

  // 测试后端连接 usedffect hook; 在组件挂载后执行一次（依赖数组为空[]）
  useEffect(() => {
    const fetchData = async () => {            //定义异步函数获取数据
      try {
        console.log('正在连接后端服务...');
             //1.获取基础的欢迎消息
    
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);//更新message状态

        //2/获取用户数据
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        setUsers(usersResponse.data);//更新users状态
        console.log('后端连接成功！');
      } catch (error) {
        // 错误处理，更新错误信息
        setMessage('❌ 后端连接失败 - 请确保后端服务正在运行');
        console.error('API调用错误:', error);
      } finally {
        setLoading(false);//无论成功失败，都结束加载状态
      }
    };


    fetchData();//调用异步函数
  }, []);//空依赖数组表示在组件挂载时执行一次

  //加载状态渲染
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>please 加载中...</h1>
        </header>
      </div>
    );
  }
//主界面渲染
  return (
    <div className="App">
      <header className="App-header">
        <h1>newfire Improved Enigma - 全栈应用</h1>
        <p>{message}</p>{/* 显示后端消息 */}
        
        <h2> 用户列表</h2>
        <div className="users-list">
                  {/* 遍历users数组渲染用户卡片 */}
                  
          {users.map(user => (
            <div key={user.id} className="user-card">{/* key属性优化列表渲染 */}
              <strong>{user.name}</strong> {/* 用户名 */}
              <br />
              <span>{user.email}</span>{/* 用户邮箱 */}
            </div>
          ))}
        </div>

        <div className="links">
           {/* 后端健康检查链接 */}
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            后端健康检查
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;// 导出组件供其他文件使用
