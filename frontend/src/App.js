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

  const [backgroundImage, setBackgroundImage] = useState(null);  // 【新增】存储背景图片
  const [imagePreview, setImagePreview] = useState(null);       // 【新增】图片预览URL
  
 

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

// 【新增】处理图片上传
const handleImageUpload = (e) => {
  const file = e.target.files[0];
  if (file) {
    // 检查文件类型
    if (!file.type.match('image.*')) {
      alert('请选择图片文件！');
      return;
    }
    
    // 检查文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB！');
      return;
    }
    
    setBackgroundImage(file);
    
    // 创建预览URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }
};

// 【新增】清除图片
const handleClearImage = () => {
  setBackgroundImage(null);
  setImagePreview(null);
  // 重置文件输入
  const fileInput = document.getElementById('bg-image-upload');
  if (fileInput) {
    fileInput.value = '';
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
  <div className="main-container">
    {/* 图片区域 - 占1/3高度 */}
   <div className="image-section">
  {imagePreview ? (
    <div className="image-container">
      <img src={imagePreview} alt="自定义背景" className="uploaded-image" />
      <div className="image-overlay">
        <h3>团队协作平台</h3>
        <p>当前使用本地图片作为背景</p>
        <button onClick={handleClearImage} className="image-action-btn">
          清除图片
        </button>
      </div>
    </div>
  ) : (
    <div className="image-placeholder">
      <h3>团队协作平台</h3>
      <p>上传本地图片作为背景</p>
      <p className="image-hint">支持 JPG, PNG, GIF 格式，最大 5MB</p>
      <div className="upload-controls">
        <input 
          type="file" 
          id="bg-image-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <label htmlFor="bg-image-upload" className="upload-btn">
          选择本地图片
        </label>
        <div className="or-text">或</div>
        <div 
          className="upload-demo-btn"
          onClick={() => {
            // 使用一个示例图片
            setImagePreview('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80');
          }}
        >
          使用示例图片
        </div>
      </div>
    </div>
  )}
</div>

    {/* 内容区域 - 占2/3高度 */}
    <div className="content-section">
      <div className="text-box">
        <h1>团队协作模型</h1>
        <div className="welcome-box">
          <p>{message || '欢迎使用团队协作平台'}</p>
        </div>
      </div>

      {/* 当前用户信息框 */}
      {currentUser && (
        <div className="text-box current-user-box">
          <h2>当前用户</h2>
          <p>欢迎，<strong>{currentUser.name}</strong></p>
          <p>邮箱：{currentUser.email}</p>
          <button onClick={handleLogout} className="logout-btn">登出系统</button>
        </div>
      )}

      {/* 用户列表框 */}
      <div className="users-container">
        <h2>用户列表</h2>
        <div className="users-list">
          {users.length > 0 ? (
            users.map(user => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {/* 可以添加头像 */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: '#667eea',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2em',
                    fontWeight: 'bold'
                  }}>
                    {user.name.charAt(0)}
                  </div>
                </div>
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
            ))
          ) : (
            <p>暂无其他用户</p>
          )}
        </div>
      </div>

      {/* 链接框 */}
      <div className="text-box">
        <h3>系统链接</h3>
        <div className="links">
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            后端健康检查
          </a>
        </div>
      </div>
    </div>
  </div>
);

  

}

export default App;// 导出组件供其他文件使用
