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
  const [imageBlocks, setImageBlocks] = useState(() => {
    const saved = localStorage.getItem('imageBlocks');
    return saved ? JSON.parse(saved) : [];
  });
  const [showAddImageBlock, setShowAddImageBlock] = useState(false);
 

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
      const user = users.find(u => u.id === userId);
      if (user) {
        setUsers(users.map(u => 
          u.id === userId ? { ...u, description: editingText } : u
        ));
      }
    } else if (cardId === 'welcome') {
      localStorage.setItem('welcomeText', editingText);
    } else if (cardId === 'current-user') {
      // 当前用户信息也可以编辑，保存到本地存储
      localStorage.setItem('currentUserInfo', editingText);
    }
    setEditingCard(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setEditingText('');
  };

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newBlock = {
          id: Date.now(),
          image: event.target.result,
          title: '',
          description: ''
        };
        const updated = [...imageBlocks, newBlock];
        setImageBlocks(updated);
        localStorage.setItem('imageBlocks', JSON.stringify(updated));
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleDeleteImage = (id) => {
    const updated = imageBlocks.filter(block => block.id !== id);
    setImageBlocks(updated);
    localStorage.setItem('imageBlocks', JSON.stringify(updated));
  };

  const handleUpdateImageBlock = (id, field, value) => {
    const updated = imageBlocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    );
    setImageBlocks(updated);
    localStorage.setItem('imageBlocks', JSON.stringify(updated));
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

  const ImageBlock = ({ block }) => {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [titleValue, setTitleValue] = useState(block.title);
    const [descValue, setDescValue] = useState(block.description);

    const saveTitle = () => {
      handleUpdateImageBlock(block.id, 'title', titleValue);
      setIsEditingTitle(false);
    };

    const saveDesc = () => {
      handleUpdateImageBlock(block.id, 'description', descValue);
      setIsEditingDesc(false);
    };

    return (
      <div className="image-block">
        <div className="image-block-header">
          <button 
            className="delete-image-btn" 
            onClick={() => handleDeleteImage(block.id)}
            title="删除图片"
          >
            ×
          </button>
        </div>
        <div className="image-block-image">
          <img src={block.image} alt={block.title || '自定义图片'} />
        </div>
        <div className="image-block-content">
          {isEditingTitle ? (
            <div className="image-edit-field">
              <input
                type="text"
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
                className="image-edit-input"
                autoFocus
                placeholder="输入标题..."
              />
            </div>
          ) : (
            <h4 
              className="image-block-title clickable-text"
              onClick={() => setIsEditingTitle(true)}
            >
              {block.title || '点击添加标题...'}
            </h4>
          )}
          {isEditingDesc ? (
            <div className="image-edit-field">
              <textarea
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
                onBlur={saveDesc}
                className="image-edit-textarea"
                autoFocus
                placeholder="输入描述..."
              />
            </div>
          ) : (
            <p 
              className="image-block-desc clickable-text"
              onClick={() => setIsEditingDesc(true)}
            >
              {block.description || '点击添加描述...'}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="app-container">
        {/* 登录模块区块 */}
        <div className="auth-section">
          <div className="section-header">
            <h2>登录模块</h2>
          </div>
          <div className="auth-module">
            {!isLoggedIn ? (
              <Auth onLoginSuccess={handleLoginSuccess} />
            ) : (
              <div className="logged-in-info">
                <div className="user-info-card">
                  <p>欢迎，<strong>{currentUser?.name}</strong> ({currentUser?.email})</p>
                </div>
                <button onClick={handleLogout} className="logout-btn">登出</button>
              </div>
            )}
          </div>
        </div>

        {/* 图片板块区域 */}
        {isLoggedIn && (
          <div className="images-section">
            <div className="section-header">
              <h2>自定义图片板块</h2>
              <button 
                className="add-image-btn"
                onClick={() => setShowAddImageBlock(!showAddImageBlock)}
              >
                {showAddImageBlock ? '取消' : '+ 添加图片'}
              </button>
            </div>
            {showAddImageBlock && (
              <div className="add-image-panel">
                <label className="image-upload-btn">
                  选择图片
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddImage}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="upload-hint">支持 JPG、PNG、GIF 等图片格式</p>
              </div>
            )}
            <div className="images-grid">
              {imageBlocks.map(block => (
                <ImageBlock key={block.id} block={block} />
              ))}
              {imageBlocks.length === 0 && !showAddImageBlock && (
                <div className="empty-images">
                  <p>还没有图片，点击上方"添加图片"按钮开始添加</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 其他内容区块 */}
        {isLoggedIn && (
          <>
            <div className="content-section">
              <div className="section-header">
                <h2>内容板块</h2>
              </div>
              <div className="content-grid">
                <EditableCard
                  cardId="welcome"
                  title="团队协作模型"
                  content={localStorage.getItem('welcomeText') || '欢迎使用团队协作模型！点击此卡片可以编辑介绍文本。'}
                  onClick={handleCardClick}
                />
                <EditableCard
                  cardId="message"
                  title="系统消息"
                  content={message}
                  onClick={handleCardClick}
                />
              </div>
            </div>

            <div className="users-section">
              <div className="section-header">
                <h2>用户列表</h2>
              </div>
              <div className="users-grid">
                {users.map(user => {
                  const userContent = user.description || `${user.email}\n\n点击编辑用户介绍...`;
                  return (
                    <EditableCard
                      key={user.id}
                      cardId={`user-${user.id}`}
                      title={user.name}
                      content={userContent}
                      onClick={handleCardClick}
                    />
                  );
                })}
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
          </>
        )}
      </div>
    </div>
  );
}

export default App;
