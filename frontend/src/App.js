import React, { useState, useEffect } from 'react'; //1.reac核心库以及两种重要的HOOK（usestate用于管理状态。useEffect用于副作用处理）
import axios from 'axios';                          //2.axios用于HTTP请求
import './App.css';                                 //3.应用的css的样式文件
import Auth from './Auth';                          //4.Auth组件用于登录注册
import ProjectForm from './components/ProjectForm'; //5.新的项目管理（模块）组件库

//函数的引用
function App() {
  //定义组件的状态
  const [message, setMessage] = useState('');   //储存后端返回的欢迎消息
  const [users, setUsers] = useState([]);       //储存用户列表数据
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值
  //用户登入模块
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 【新增】登录状态
  const [currentUser, setCurrentUser] = useState(null);  // 【新增】当前登录用户信息
  const [_backgroundImage, setBackgroundImage] = useState(null); // 【新增】存储背景图片
  const [imagePreview, setImagePreview] = useState(null);       // 【新增】图片预览URL
  // 项目管理模块
  const [projects, setProjects] = useState([]);  // 【新增】项目列表
  const [showProjectForm, setShowProjectForm] = useState(false);  // 【新增】显示项目表单
  const [editingProject, setEditingProject] = useState(null);  // 【新增】正在编辑的项目
  const [activeProjectId, setActiveProjectId] = useState(null);  // 【新增】当前选中的项目
  const [projectMembers, setProjectMembers] = useState([]);  // 【新增】项目成员列表
  const [inviteEmail, setInviteEmail] = useState('');  // 【新增】邀请邮箱
 


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
      
      
<div className="users-container">
  <h2>项目管理</h2>
  
  {/* 项目操作按钮 */}
  <div style={{ marginBottom: '20px' }}>
    <button 
      onClick={() => { setShowProjectForm(true); setEditingProject(null); }}
      style={{
        padding: '10px 20px',
        background: '#667eea',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginRight: '10px'
      }}
    >
      创建新项目
    </button>
  </div>

  {/* 项目表单 */}
  {showProjectForm && (
    <div style={{
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>{editingProject ? '编辑项目' : '创建新项目'}</h3>
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
  <div className="users-list">
    {projects.length > 0 ? (
      projects.map(project => (
        <div 
          key={project.id} 
          className="user-card"
          style={{
            background: activeProjectId === project.id ? '#e3f2fd' : '',
            cursor: 'pointer'
          }}
          onClick={() => handleSelectProject(project.id)}
        >
          <div className="user-avatar">
            <div style={{
              width: '100%',
              height: '100%',
              background: '#4caf50',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2em',
              fontWeight: 'bold'
            }}>
              P
            </div>
          </div>
          <div className="user-info">
            <strong>{project.name}</strong>
            <span>{project.description}</span>
            <div style={{ fontSize: '0.8em', color: '#666', marginTop: '5px' }}>
              创建者: {project.owner_name} | 状态: {project.status} | 成员: {project.member_count}人
            </div>
          </div>
          <div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(project);
                setShowProjectForm(true);
              }}
              style={{
                marginRight: '5px',
                padding: '5px 10px',
                fontSize: '0.8em'
              }}
            >
              编辑
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(project.id);
              }}
              style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '5px 10px',
                fontSize: '0.8em'
              }}
            >
              删除
            </button>
          </div>
        </div>
      ))
    ) : (
      <p>暂无项目，请创建一个新项目</p>
    )}
  </div>

  {/* 项目概览仪表板 */}
  {activeProjectId && (
    <div style={{
      marginTop: '30px',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '8px'
    }}>
      <h3>项目概览</h3>
      {projects.find(p => p.id === activeProjectId) && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <h4>{projects.find(p => p.id === activeProjectId).name}</h4>
            <p>{projects.find(p => p.id === activeProjectId).description}</p>
          </div>
          
          {/* 成员管理 */}
          <div>
            <h4>项目成员 ({projectMembers.length}人)</h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
              <input
                type="email"
                placeholder="输入邮箱邀请成员"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  marginRight: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd'
                }}
              />
              <button onClick={handleInviteMember}>
                邀请
              </button>
            </div>
            
            <div className="users-list">
              {projectMembers.map(member => (
                <div key={member.id} className="user-card">
                  <div className="user-avatar">
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#2196f3',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1em'
                    }}>
                      {member.name.charAt(0)}
                    </div>
                  </div>
                  <div className="user-info">
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
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
