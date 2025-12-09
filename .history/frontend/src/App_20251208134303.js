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
  const [backgroundImage, setBackgroundImage] = useState('default'); // 背景图片状态
  const [editingUser, setEditingUser] = useState(null); // 编辑用户状态

  // 内置背景图片选项
  const backgroundOptions = {
    default: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCI+PHBhdGggZD0iTTAgMGgxNDBjMzMgMCA2MCAyNyA2MCA2MHYzMEgxNDBjLTMzIDAtNjAtMjctNjAtNjBWMHoiIGZpbGw9IiNmZGZiZmIiLz48L3N2Zz48L3JlY3Q+PC9zdmc+',
    nature: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiM4N2NlZWI7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNhMGRiZjE7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+',
    sunset: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmZjdhNGE7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmOWI0ZjtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6I2ZmZjJmODQ7c3RvcC1vcGFjaXR5OjEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+',
    ocean: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDg0YmY7c3RvcC1vcGFjaXR5OjEiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwOWNlODtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwYmZmZjtzdG9wLW9wYWNpdHk6MSIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzY0ZGJmZjtzdG9wLW9wYWNpdHk6MSIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4='
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

  // 处理用户卡片点击
  const handleUserCardClick = (user) => {
    setEditingUser(user);
  };

  // 处理介绍文本保存
  const handleSaveIntro = async (userId, intro) => {
    try {
      await axios.put(`http://localhost:5000/api/users/${userId}`, { intro }, {
        withCredentials: true
      });
      // 重新获取用户列表
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      console.error('保存介绍失败:', error);
    }
  };

  // 处理取消编辑
  const handleCancelEdit = () => {
    setEditingUser(null);
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
      <header className="App-header" style={{
        background: `linear-gradient(to bottom,
          url('${backgroundOptions[backgroundImage]}') no-repeat center top / cover,
          #fdfbfb 33.33vh,
          #e8f4f8 33.33vh
        )`
      }}>
        {/* 背景切换器 */}
        <div className="background-switcher">
          <span>背景主题：</span>
          {Object.keys(backgroundOptions).map(option => (
            <button
              key={option}
              className={`bg-btn ${backgroundImage === option ? 'active' : ''}`}
              onClick={() => setBackgroundImage(option)}
            >
              {option === 'default' ? '默认' :
               option === 'nature' ? '自然' :
               option === 'sunset' ? '夕阳' :
               option === 'ocean' ? '海洋' : option}
            </button>
          ))}
        </div>

        <div className="content-box">
          <h1 className="title-box">团队协作模型</h1>
        </div>

        <div className="content-box">
          <p className="message-box">{message}</p>
        </div>

        {/* 【新增】显示当前用户信息 */}
        {currentUser && (
          <div className="content-box current-user">
            <p>欢迎，<strong>{currentUser.name}</strong> ({currentUser.email})</p>
            <button onClick={handleLogout} className="logout-btn">登出</button>
          </div>
        )}

        <div className="content-box">
          <h2 className="title-box">用户列表</h2>
        </div>

        <div className="users-list">
          {/* 遍历users数组渲染用户卡片 */}

          {users.map(user => (
            <div key={user.id} className="user-card" onClick={() => handleUserCardClick(user)}>
              <strong>{user.name}</strong>
              <br />
              <span>{user.email}</span>
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
