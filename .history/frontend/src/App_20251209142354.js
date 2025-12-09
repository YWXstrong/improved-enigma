import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Auth from './Auth';
//导入必要模块
//1.reac核心库以及两种重要的HOOK（usestate用于管理状态。useEffect用于副作用处理）
//2.axios用于HTTP请求
//3.应用的css的样式文件
//4.Auth组件用于登录注册

function App() {
  //定义组件的状态
  const [message, setMessage] = useState('');   //储存后端返回的欢迎消息
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值


  // 获取基础数据
  useEffect(() => {
    const fetchData = async () => {            //定义异步函数获取数据
      try {
        console.log('正在连接后端服务...');

        //1.获取基础的欢迎消息
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);//更新message状态

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
  }, []);

  //加载状态渲染
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>正在努力加载中QAQ.....</h1>
        </header>
      </div>
    );
  }

  // 主页面显示登录/注册界面
  return <Auth message={message} />;
  

}

export default App;// 导出组件供其他文件使用
