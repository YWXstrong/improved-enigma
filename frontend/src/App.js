import React, { useState, useEffect } from 'react'; //1.reac核心库以及两种重要的HOOK（usestate用于管理状态。useEffect用于副作用处理）
import axios from 'axios';                          //2.axios用于HTTP请求
import './App.css';                                 //3.应用的css的样式文件
import Auth from './Auth';                          //4.Auth组件用于登录注册
import ProjectForm from './components/ProjectForm'; //5.新的项目管理（模块）组件库
import { getRandomImage } from './utils/imageUtils';//导入随机图片函数

//函数的引用
function App() {
  //定义组件的状态
  const [message, setMessage] = useState('');   //储存后端返回的欢迎消息
  const [users, setUsers] = useState([]);       //储存用户列表数据
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值
  //用户登入模块
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 【新增】登录状态
  const [currentUser, setCurrentUser] = useState(null);  // 【新增】当前登录用户信息
   //首页图片自定义
  const [backgroundImage, setBackgroundImage] = useState(null); // 存储当前背景图片
  const [isCustomImage, setIsCustomImage] = useState(false); // 标记是否是自定义图片
  const [showImageSelector, setShowImageSelector] = useState(false); // 显示图片选择器
  const [availableImages, setAvailableImages] = useState([]);// 获取所有图片用于选择
  // 项目管理模块
  const [projects, setProjects] = useState([]);  // 【新增】项目列表
  const [showProjectForm, setShowProjectForm] = useState(false);  // 【新增】显示项目表单
  const [editingProject, setEditingProject] = useState(null);  // 【新增】正在编辑的项目
  const [activeProjectId, setActiveProjectId] = useState(null);  // 【新增】当前选中的项目
  const [projectMembers, setProjectMembers] = useState([]);  // 【新增】项目成员列表
  const [inviteEmail, setInviteEmail] = useState('');  // 【新增】邀请邮箱


  //首页图片自定义
  // 初始化随机图片
  useEffect(() => {
    // 设置随机图片作为默认背景
    const randomImg = getRandomImage();
    setBackgroundImage(randomImg);
    
    // 获取所有可用图片
    const imagesContext = require.context('./images', false, /\.(png|jpe?g|gif|svg)$/);
    const imagePaths = imagesContext.keys().map(key => imagesContext(key));
    setAvailableImages(imagePaths);
    
    console.log('初始化随机图片完成');
  }, []);

  // 选择随机图片
  const handleRandomImage = () => {
    const randomImg = getRandomImage();
    setBackgroundImage(randomImg);
    setIsCustomImage(false);
    setShowImageSelector(false);
  };

  // 选择特定图片
  const handleSelectImage = (imgPath) => {
    setBackgroundImage(imgPath);
    setIsCustomImage(true);
    setShowImageSelector(false);
  };

  // 上传自定义图片（保持原有功能）
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        alert('请选择图片文件！');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB！');
        return;
      }
      
      // 创建预览URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
        setIsCustomImage(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // 清除自定义图片，恢复随机图片
  const handleClearImage = () => {
    const randomImg = getRandomImage();
    setBackgroundImage(randomImg);
    setIsCustomImage(false);
    // 重置文件输入
    const fileInput = document.getElementById('bg-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
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

  

  // 【新增】修改handleLoginSuccess，登录后获取项目
const handleLoginSuccess = (user) => {
  setIsLoggedIn(true);
  setCurrentUser(user);
  // 登录成功后获取用户列表和项目列表
  fetchUsers();
  fetchProjects();  // 【新增】获取项目
};
// 【新增】在handleLoginSuccess函数后添加获取项目的函数
const fetchProjects = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/projects', {
      withCredentials: true
    });
    setProjects(response.data);
  } catch (error) {
    console.error('获取项目列表失败:', error);
  }
};


// 【新增】创建/更新项目
const handleProjectSubmit = async (projectData) => {
  try {
    const url = editingProject 
      ? `http://localhost:5000/api/projects/update/${editingProject.id}`
      : 'http://localhost:5000/api/projects/create';
    
    const method = editingProject ? 'put' : 'post';
    
    const response = await axios[method](url, projectData, {
      withCredentials: true
    });
    
    if (response.data.project) {
      // 更新项目列表
      if (editingProject) {
        setProjects(projects.map(p => 
          p.id === response.data.project.id ? response.data.project : p
        ));
      } else {
        setProjects([...projects, response.data.project]);
      }
      
      // 重置表单
      setShowProjectForm(false);
      setEditingProject(null);
    }
  } catch (error) {
    console.error('保存项目失败:', error);
    alert(error.response?.data?.error || '操作失败');
  }
};

// 【新增】删除项目
const handleDeleteProject = async (projectId) => {
  if (!window.confirm('确定要删除这个项目吗？')) return;
  
  try {
    await axios.delete(`http://localhost:5000/api/projects/delete/${projectId}`, {
      withCredentials: true
    });
    
    setProjects(projects.filter(p => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  } catch (error) {
    console.error('删除项目失败:', error);
    alert(error.response?.data?.error || '删除失败');
  }
};

// 【新增】邀请成员
const handleInviteMember = async () => {
  if (!activeProjectId || !inviteEmail.trim()) return;
  
  try {
    const response = await axios.post(
      `http://localhost:5000/api/projects/${activeProjectId}/invite`,
      { email: inviteEmail },
      { withCredentials: true }
    );
    
    alert(response.data.message);
    setInviteEmail('');
    // 刷新成员列表
    fetchProjectMembers(activeProjectId);
  } catch (error) {
    console.error('邀请成员失败:', error);
    alert(error.response?.data?.error || '邀请失败');
  }
};

// 【新增】获取项目成员
const fetchProjectMembers = async (projectId) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/projects/${projectId}/members`,
      { withCredentials: true }
    );
    setProjectMembers(response.data);
  } catch (error) {
    console.error('获取项目成员失败:', error);
  }
};

// 【新增】选中项目
const handleSelectProject = (projectId) => {
  setActiveProjectId(projectId);
  fetchProjectMembers(projectId);
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

// 重构网页项目
  return (
    <div className="app-container">
      {/* 顶部图片区域 */}
      <div className="image-section">
        {backgroundImage && (
          <div className="image-container">
            <img src={backgroundImage} alt="背景" className="background-image" />
            
            {/* 左上角控制面板 */}
            <div className="image-controls-top-left">
              <div className="control-buttons">
                {/* 切换图片按钮 */}
                <button 
                  className="control-btn"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  title="更换图片"
                >
                  <span className="text">更换图片</span>
                </button>
                
                {/* 随机图片按钮 */}
                <button 
                  className="control-btn"
                  onClick={handleRandomImage}
                  title="随机图片"
                >

                  <span className="text">随机</span>
                </button>
                
                {/* 上传图片按钮 */}
                <div className="upload-wrapper">
                  <input 
                    type="file" 
                    id="bg-image-upload"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="bg-image-upload" className="control-btn">
                    <span className="text">上传</span>
                  </label>
                </div>
                
                {/* 清除按钮（仅显示当有自定义图片时） */}
                {isCustomImage && (
                  <button 
                    className="control-btn danger"
                    onClick={handleClearImage}
                    title="清除自定义图片"
                  >
                    <span className="text">清除</span>
                  </button>
                )}
              </div>
              
              {/* 图片选择器 */}
              {showImageSelector && (
                <div className="image-selector">
                  <div className="selector-header">
                    <h4>选择背景图片</h4>
                    <button 
                      className="close-selector"
                      onClick={() => setShowImageSelector(false)}
                    >
                      ×
                    </button>
                  </div>
                  <div className="image-grid">
                    {availableImages.map((img, index) => (
                      <div 
                        key={index} 
                        className="image-option"
                        onClick={() => handleSelectImage(img)}
                      >
                        <img src={img} alt={`背景${index + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* 图片标题覆盖层 */}
            <div className="image-overlay-center">
              <h1 className="image-title">团队协作平台</h1>
              <p className="image-subtitle">高效协作，创意无限</p>
            </div>
          </div>
        )}
      </div>

    {/* 主体内容区域 */}
    <div className="main-content">
      {/* 左侧导航栏 */}
      <div className="left-sidebar">
        {/* 当前用户信息 */}
        <div className="sidebar-card">
          <h3 className="sidebar-title">当前用户</h3>
          {currentUser && (
            <div className="user-info-box">
              <div className="user-avatar-large">
                {currentUser.name.charAt(0)}
              </div>
              <div className="user-details">
                <strong>{currentUser.name}</strong>
                <span>{currentUser.email}</span>
                <button onClick={handleLogout} className="logout-btn-sidebar">
                  登出系统
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 用户列表 */}
        <div className="sidebar-card">
          <h3 className="sidebar-title">用户列表 ({users.length})</h3>
          <div className="users-list-compact">
            {users.length > 0 ? (
              users.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-avatar-small">
                    {user.name.charAt(0)}
                  </div>
                  <div className="user-info-small">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-users">暂无其他用户</p>
            )}
          </div>
        </div>

        {/* 后端健康检查 */}
        <div className="sidebar-card">
          <h3 className="sidebar-title">系统状态</h3>
          <div className="health-status">
            <div className={`status-indicator ${message ? 'status-ok' : 'status-error'}`}></div>
            <span>{message || '未连接到后端'}</span>
          </div>
          <div className="links-section">
            <a 
              href="http://localhost:5000/api/health" 
              target="_blank" 
              rel="noopener noreferrer"
              className="health-link"
            >
              后端健康检查
            </a>
          </div>
        </div>
      </div>

      {/* 右侧主内容区 - 项目管理系统 */}
      <div className="right-content">
        <div className="content-header">
          <h1>项目管理系统</h1>
          <p>管理您的项目、团队成员和协作任务</p>
        </div>

        {/* 项目操作区域 */}
        <div className="projects-section">
          <div className="projects-header">
            <h2>项目管理</h2>
            <button 
              onClick={() => { setShowProjectForm(true); setEditingProject(null); }}
              className="create-project-btn"
            >
              <span>+</span> 创建新项目
            </button>
          </div>

          {/* 项目表单 */}
          {showProjectForm && (
            <div className="project-form-container">
              <div className="form-header">
                <h3>{editingProject ? '编辑项目' : '创建新项目'}</h3>
                <button 
                  onClick={() => { setShowProjectForm(false); setEditingProject(null); }}
                  className="close-form-btn"
                >
                  ×
                </button>
              </div>
              <ProjectForm 
                project={editingProject}
                onSubmit={handleProjectSubmit}
                onCancel={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
              />
            </div>
          )}

          {/* 项目列表 */}
          <div className="projects-grid">
            {projects.length > 0 ? (
              projects.map(project => (
                <div 
                  key={project.id} 
                  className={`project-card ${activeProjectId === project.id ? 'active' : ''}`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <div className="project-header">
                    <div className="project-avatar">
                      P
                    </div>
                    <div className="project-title">
                      <h4>{project.name}</h4>
                      <span className="project-status">{project.status}</span>
                    </div>
                    <div className="project-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingProject(project);
                          setShowProjectForm(true);
                        }}
                        className="edit-btn"
                      >
                        编辑
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProject(project.id);
                        }}
                        className="delete-btn"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <div className="project-description">
                    {project.description}
                  </div>
                  <div className="project-footer">
                    <span className="project-owner">
                      创建者: {project.owner_name}
                    </span>
                    <span className="project-members">
                      成员: {project.member_count}人
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-projects">
                <p>暂无项目，点击"创建新项目"开始</p>
              </div>
            )}
          </div>

          {/* 项目详情 */}
          {activeProjectId && (
            <div className="project-detail">
              <div className="detail-header">
                <h3>项目概览</h3>
              </div>
              {projects.find(p => p.id === activeProjectId) && (
                <>
                  <div className="project-info">
                    <h4>{projects.find(p => p.id === activeProjectId).name}</h4>
                    <p className="project-description-full">
                      {projects.find(p => p.id === activeProjectId).description}
                    </p>
                  </div>
                  
                  {/* 成员管理 */}
                  <div className="members-section">
                    <h4>项目成员 ({projectMembers.length}人)</h4>
                    <div className="invite-section">
                      <input
                        type="email"
                        placeholder="输入邮箱邀请新成员..."
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="invite-input"
                      />
                      <button onClick={handleInviteMember} className="invite-btn">
                        邀请
                      </button>
                    </div>
                    
                    <div className="members-list">
                      {projectMembers.map(member => (
                        <div key={member.id} className="member-item">
                          <div className="member-avatar">
                            {member.name.charAt(0)}
                          </div>
                          <div className="member-info">
                            <div className="member-name">{member.name}</div>
                            <div className="member-email">{member.email}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

}

export default App;// 导出组件供其他文件使用
