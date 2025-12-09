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
  //定义组件的状态（之后的代码第一块就在这里面改）
  const [message, setMessage] = useState('');   //储存后端返回的欢迎消息
  const [users, setUsers] = useState([]);       //储存用户列表数据
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 【新增】登录状态
  const [currentUser, setCurrentUser] = useState(null);  // 【新增】当前登录用户信息

  // 【新增】背景和交互功能状态
  const [backgroundImage, setBackgroundImage] = useState('nature1'); // 当前背景图片
  const [introText, setIntroText] = useState('欢迎来到团队协作平台！这里是您的个性化介绍区域，点击编辑您的团队介绍信息。'); // 介绍文本
  const [isEditingIntro, setIsEditingIntro] = useState(false); // 是否正在编辑介绍

  // 内置背景图片选项
  const backgroundImages = {
    nature1: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    nature2: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop',
    abstract1: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop',
    tech1: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop',
    city1: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&h=600&fit=crop'
  };
 

  // 检查登录状态和获取数据
  useEffect(() => {
    const fetchData = async () => {            //定义异步函数获取数据
      try {
        console.log('正在连接后端服务...');
        
        // 【新增】首先检查是否已登录
        try {
          const authResponse = await axios.get('http://localhost:5000/api/auth/me', {
            withCredentials: true
          });
          if (authResponse.data.is_logged_in) {
            setIsLoggedIn(true);
            setCurrentUser(authResponse.data.user);
          }
        } catch (authError) {
          // 未登录，继续显示登录界面
          setIsLoggedIn(false);
        }
        
        //1.获取基础的欢迎消息
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);//更新message状态

        //2.获取用户数据（登录后才获取）
        if (isLoggedIn) {
          const usersResponse = await axios.get('http://localhost:5000/api/users');
          setUsers(usersResponse.data);//更新users状态
        }
        
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
  }, [isLoggedIn]);//依赖isLoggedIn，登录状态改变时重新获取数据

  // 【新增】处理登录成功
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    // 登录成功后获取用户列表
    fetchUsers();
  };

  // 【新增】获取用户列表
  const fetchUsers = async () => {
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/users');
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  // 【新增】处理登出
  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      setIsLoggedIn(false);
      setCurrentUser(null);
      setUsers([]);
    } catch (error) {
      console.error('登出失败:', error);
    }
  };

  // 【新增】处理背景图片切换
  const handleBackgroundChange = (imageKey) => {
    setBackgroundImage(imageKey);
    localStorage.setItem('selectedBackground', imageKey);
  };

  // 【新增】处理介绍文本编辑
  const handleIntroEdit = () => {
    setIsEditingIntro(true);
  };

  const handleIntroSave = () => {
    setIsEditingIntro(false);
    localStorage.setItem('introText', introText);
  };

  const handleIntroChange = (e) => {
    setIntroText(e.target.value);
  };

  // 【新增】从本地存储加载设置
  useEffect(() => {
    const savedBackground = localStorage.getItem('selectedBackground');
    const savedIntro = localStorage.getItem('introText');

    if (savedBackground) {
      setBackgroundImage(savedBackground);
    }
    if (savedIntro) {
      setIntroText(savedIntro);
    }
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

  // 【新增】未登录时显示登录/注册界面
  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

//主界面渲染（已登录状态）
  return (
    <div className="App">
      {/* 背景图片层 */}
      <div
        className="background-image"
        style={{ backgroundImage: `url(${backgroundImages[backgroundImage]})` }}
      ></div>

      {/* 颜色渐变背景层 */}
      <div className="color-gradient"></div>

      {/* 背景选择器 */}
      <div className="background-selector">
        <h3>背景选择</h3>
        <div className="background-options">
          {Object.entries(backgroundImages).map(([key, url]) => (
            <div
              key={key}
              className={`background-option ${backgroundImage === key ? 'selected' : ''}`}
              style={{ backgroundImage: `url(${url})` }}
              onClick={() => handleBackgroundChange(key)}
              title={key}
            ></div>
          ))}
        </div>
      </div>

      <header className="App-header">
        {/* 标题框 */}
        <div className="interactive-box" onClick={handleIntroEdit}>
          <h1>团队协作模型</h1>
        </div>

        {/* 消息框 */}
        <div className="interactive-box">
          <p>{message}</p>
        </div>

        {/* 当前用户信息框 */}
        {currentUser && (
          <div className="interactive-box current-user">
            <p>欢迎，<strong>{currentUser.name}</strong> ({currentUser.email})</p>
            <button onClick={handleLogout} className="logout-btn">登出</button>
          </div>
        )}

        {/* 可编辑介绍文本框 */}
        <div className="interactive-box" onClick={handleIntroEdit}>
          {isEditingIntro ? (
            <div>
              <textarea
                className="intro-text editing"
                value={introText}
                onChange={handleIntroChange}
                onBlur={handleIntroSave}
                autoFocus
                rows={4}
              />
              <button onClick={handleIntroSave} style={{ marginTop: '10px', padding: '5px 10px', background: '#667eea', color: 'white', border: 'none', borderRadius: '5px' }}>
                保存
              </button>
            </div>
          ) : (
            <div className="intro-text" onClick={handleIntroEdit}>
              {introText}
            </div>
          )}
        </div>

        <h2>用户列表</h2>
        <div className="users-list">
          {/* 遍历users数组渲染用户卡片 - 用户列表区域保持原有样式 */}
          {users.map(user => (
            <div key={user.id} className="user-card">
              <strong>{user.name}</strong>
              <br />
              <span>{user.email}</span>
            </div>
          ))}
        </div>

        {/* 链接框 */}
        <div className="interactive-box links">
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            后端健康检查
          </a>
        </div>
      </header>
    </div>
  );
  

}

export default App;// 导出组件供其他文件使用
