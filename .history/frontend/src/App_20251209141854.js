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

  // 【新增】可交互框框相关状态
  const [activeBox, setActiveBox] = useState(null);  // 当前活跃的框框
  const [introText, setIntroText] = useState('点击此处编辑团队介绍...');  // 可编辑的介绍文本
  const [isEditingIntro, setIsEditingIntro] = useState(false);  // 是否正在编辑介绍

  // 【新增】背景图片相关状态
  const [backgroundImage, setBackgroundImage] = useState('');  // 当前背景图片
  const [availableImages] = useState([
    { id: 1, name: '默认', url: '' },
    { id: 2, name: '科技', url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=1920&h=1080&fit=crop' },
    { id: 3, name: '自然', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop' },
    { id: 4, name: '城市', url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop' },
    { id: 5, name: '抽象', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1920&h=1080&fit=crop' }
  ]);  // 内置背景图片选项
 

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

  // 【新增】处理框框点击
  const handleBoxClick = (boxId) => {
    setActiveBox(activeBox === boxId ? null : boxId);
  };

  // 【新增】处理介绍文本保存
  const handleIntroSave = () => {
    setIsEditingIntro(false);
  };

  // 【新增】处理背景图片切换
  const handleImageChange = (imageUrl) => {
    setBackgroundImage(imageUrl);
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
    <div className="App" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}>
      <header className="App-header">
        {/* 背景图片选择器 */}
        <div className="image-selector">
          <label>背景图片：</label>
          <select onChange={(e) => handleImageChange(e.target.value)} value={backgroundImage}>
            {availableImages.map(img => (
              <option key={img.id} value={img.url}>{img.name}</option>
            ))}
          </select>
        </div>

        {/* 可交互标题框 */}
        <div
          className={`interactive-box ${activeBox === 'title' ? 'active' : ''}`}
          onClick={() => handleBoxClick('title')}
        >
          <h1>团队协作模型</h1>
        </div>

        {/* 可交互消息框 */}
        <div
          className={`interactive-box ${activeBox === 'message' ? 'active' : ''}`}
          onClick={() => handleBoxClick('message')}
        >
          <p>{message}</p>
        </div>

        {/* 【新增】显示当前登录用户信息 */}
        {currentUser && (
          <div
            className={`interactive-box current-user ${activeBox === 'user' ? 'active' : ''}`}
            onClick={() => handleBoxClick('user')}
          >
            <p>欢迎，<strong>{currentUser.name}</strong> ({currentUser.email})</p>
            <button onClick={handleLogout} className="logout-btn">登出</button>
          </div>
        )}

        {/* 可编辑介绍文本 */}
        <div
          className={`interactive-box intro-box ${activeBox === 'intro' ? 'active' : ''}`}
          onClick={() => handleBoxClick('intro')}
        >
          {isEditingIntro ? (
            <div>
              <textarea
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                onBlur={handleIntroSave}
                autoFocus
                className="intro-textarea"
              />
            </div>
          ) : (
            <p onClick={() => setIsEditingIntro(true)}>{introText}</p>
          )}
        </div>

        {/* 可交互用户列表标题 */}
        <div
          className={`interactive-box ${activeBox === 'userlist-title' ? 'active' : ''}`}
          onClick={() => handleBoxClick('userlist-title')}
        >
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

        {/* 可交互链接框 */}
        <div
          className={`interactive-box links ${activeBox === 'links' ? 'active' : ''}`}
          onClick={() => handleBoxClick('links')}
        >
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            后端健康检查
          </a>
        </div>
      </header>
    </div>
  );
  

}

export default App;// 导出组件供其他文件使用
