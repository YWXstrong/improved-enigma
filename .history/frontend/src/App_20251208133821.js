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
  const [backgroundImage, setBackgroundImage] = useState(''); // 背景图片URL
  const [backgroundInput, setBackgroundInput] = useState(''); // 背景图片输入框值
  const [introText, setIntroText] = useState('点击此处编辑团队介绍...'); // 介绍文本
  const [isEditingIntro, setIsEditingIntro] = useState(false); // 是否正在编辑介绍
 

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

  // 【新增】处理背景图片设置
  const handleBackgroundChange = () => {
    setBackgroundImage(backgroundInput);
  };

  // 【新增】处理介绍文本编辑
  const handleIntroEdit = () => {
    setIsEditingIntro(true);
  };

  const handleIntroSave = () => {
    setIsEditingIntro(false);
  };

  const handleIntroChange = (e) => {
    setIntroText(e.target.value);
  };

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
      <header className="App-header" style={backgroundImage ? {
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 33.33%, rgba(253, 251, 251, 0.9) 33.34%, #fdfbfb 100%), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : undefined}>
        <div className="background-settings">
          <input
            type="text"
            placeholder="输入背景图片URL"
            value={backgroundInput}
            onChange={(e) => setBackgroundInput(e.target.value)}
            className="background-input"
          />
          <button onClick={handleBackgroundChange} className="background-btn">设置背景</button>
        </div>

        <div className="text-box title-box">
          <h1>团队协作模型</h1>
        </div>

        <div className="text-box message-box">
          <p>{message}</p>{/* 显示后端消息 */}
        </div>

        {/* 【新增】显示当前登录用户信息 */}
        {currentUser && (
          <div className="text-box user-info-box">
            <div className="current-user">
              <p>欢迎，<strong>{currentUser.name}</strong> ({currentUser.email})</p>
              <button onClick={handleLogout} className="logout-btn">登出</button>
            </div>
          </div>
        )}

        {/* 【新增】团队介绍文本 */}
        <div className="text-box intro-box" onClick={handleIntroEdit}>
          {isEditingIntro ? (
            <div className="intro-edit">
              <textarea
                value={introText}
                onChange={handleIntroChange}
                onBlur={handleIntroSave}
                autoFocus
                className="intro-textarea"
                placeholder="输入团队介绍..."
              />
              <button onClick={handleIntroSave} className="intro-save-btn">保存</button>
            </div>
          ) : (
            <div className="intro-display">
              <p>{introText}</p>
              <span className="edit-hint">点击编辑</span>
            </div>
          )}
        </div>

        <div className="text-box">
          <h2>用户列表</h2>
        </div>
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

        <div className="text-box">
          <div className="links">
             {/* 后端健康检查链接 */}
            <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
              后端健康检查
            </a>
          </div>
        </div>
      </header>
    </div>
  );
  

}

export default App;// 导出组件供其他文件使用
