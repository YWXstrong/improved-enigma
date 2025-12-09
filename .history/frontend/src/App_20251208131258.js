import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import Auth from './Auth';

function App() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [editingText, setEditingText] = useState('');
 

  useEffect(() => {
    const fetchData = async () => {
      try {
        try {
          const authResponse = await axios.get('http://localhost:5000/api/auth/me', {
            withCredentials: true
          });
          if (authResponse.data.is_logged_in) {
            setIsLoggedIn(true);
            setCurrentUser(authResponse.data.user);
          }
        } catch (authError) {
          setIsLoggedIn(false);
        }
        
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);

        if (isLoggedIn) {
          const usersResponse = await axios.get('http://localhost:5000/api/users');
          setUsers(usersResponse.data);
        }
      } catch (error) {
        setMessage('❌ 后端连接失败 - 请确保后端服务正在运行');
        console.error('API调用错误:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isLoggedIn]);

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
      <header className="App-header">
        <h1>团队协作模型 </h1>
        <p>{message}</p>{/* 显示后端消息 */}
        
        {/* 【新增】显示当前登录用户信息 */}
        {currentUser && (
          <div className="current-user">
            <p>欢迎，<strong>{currentUser.name}</strong> ({currentUser.email})</p>
            <button onClick={handleLogout} className="logout-btn">登出</button>
          </div>
        )}
        
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
