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

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/users');
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

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

  const handleCardClick = (cardId, currentText) => {
    setEditingCard(cardId);
    setEditingText(currentText);
  };

  const handleSaveEdit = (cardId) => {
    if (cardId === 'message') {
      setMessage(editingText);
    } else if (cardId.startsWith('user-')) {
      const userId = parseInt(cardId.replace('user-', ''));
      setUsers(users.map(user => 
        user.id === userId ? { ...user, description: editingText } : user
      ));
    } else if (cardId === 'welcome') {
      // 可以保存到本地存储或其他地方
      localStorage.setItem('welcomeText', editingText);
    }
    setEditingCard(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditingText('');
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="loading-card">正在努力加载中...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  const EditableCard = ({ cardId, title, content, onClick }) => {
    const isEditing = editingCard === cardId;
    
    if (isEditing) {
      return (
        <div className="card editing">
          <div className="card-header">
            <h3>{title}</h3>
          </div>
          <div className="card-content">
            <textarea
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="edit-textarea"
              autoFocus
            />
            <div className="edit-actions">
              <button onClick={() => handleSaveEdit(cardId)} className="save-btn">保存</button>
              <button onClick={handleCancelEdit} className="cancel-btn">取消</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="card clickable" onClick={() => onClick(cardId, content)}>
        <div className="card-header">
          <h3>{title}</h3>
        </div>
        <div className="card-content">
          <p>{content || '点击编辑介绍文本...'}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="app-container">
        <div className="header-section">
          <EditableCard
            cardId="welcome"
            title="团队协作模型"
            content={localStorage.getItem('welcomeText') || '欢迎使用团队协作模型！点击此卡片可以编辑介绍文本。'}
            onClick={handleCardClick}
          />
        </div>

        {currentUser && (
          <div className="user-section">
            <EditableCard
              cardId="current-user"
              title={`当前用户：${currentUser.name}`}
              content={`邮箱：${currentUser.email}`}
              onClick={handleCardClick}
            />
            <button onClick={handleLogout} className="logout-btn">登出</button>
          </div>
        )}

        <div className="message-section">
          <EditableCard
            cardId="message"
            title="系统消息"
            content={message}
            onClick={handleCardClick}
          />
        </div>

        <div className="users-section">
          <h2 className="section-title">用户列表</h2>
          <div className="users-grid">
            {users.map(user => (
              <EditableCard
                key={user.id}
                cardId={`user-${user.id}`}
                title={user.name}
                content={user.description || `${user.email}\n\n点击编辑用户介绍...`}
                onClick={handleCardClick}
              />
            ))}
          </div>
        </div>

        <div className="links-section">
          <div className="card">
            <div className="card-header">
              <h3>系统链接</h3>
            </div>
            <div className="card-content">
              <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer" className="link-btn">
                后端健康检查
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
