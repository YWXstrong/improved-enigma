import React, { useState, useEffect } from 'react'; //1.react核心库以及两种重要的HOOK（useState用于管理状态，useEffect用于副作用处理）
import axios from 'axios';                          //2.axios用于HTTP请求
import './App.css';                                 //3.应用的css样式文件
import Auth from './Auth';                          //4.Auth组件用于登录注册
import ProjectForm from './components/ProjectForm'; //5.项目管理组件
import { getRandomImage } from './utils/imageUtils';//导入随机图片函数
import TaskForm from './components/TaskForm';       //任务表单组件
import ChartDashboard from './components/ChartDashboard';

//函数的引用
function App() {
  // 导航状态 - 定义当前活动的页面
  const [activePage, setActivePage] = useState('home'); // 'home', 'user', 'health', 'comments'
  
  // 定义组件的状态
  const [message, setMessage] = useState('');   //储存后端返回的欢迎消息
  const [users, setUsers] = useState([]);       //储存用户列表数据
  const [loading, setLoading] = useState(true); //控制加载状态的布尔值
  
  // 用户登录模块
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // 登录状态
  const [currentUser, setCurrentUser] = useState(null);  // 当前登录用户信息
  
  // 首页图片自定义
  const [backgroundImage, setBackgroundImage] = useState(null); // 存储当前背景图片
  const [isCustomImage, setIsCustomImage] = useState(false); // 标记是否是自定义图片
  const [showImageSelector, setShowImageSelector] = useState(false); // 显示图片选择器
  const [availableImages, setAvailableImages] = useState([]);// 获取所有图片用于选择
  
  // 项目管理模块
  const [projects, setProjects] = useState([]);  // 项目列表
  const [showProjectForm, setShowProjectForm] = useState(false);  // 显示项目表单
  const [editingProject, setEditingProject] = useState(null);  // 正在编辑的项目
  const [activeProjectId, setActiveProjectId] = useState(null);  // 当前选中的项目
  const [projectMembers, setProjectMembers] = useState([]);  // 项目成员列表
  const [inviteEmail, setInviteEmail] = useState('');  // 邀请邮箱

  // 任务看板模块
  const [tasks, setTasks] = useState([]);  // 任务列表
  const [showTaskForm, setShowTaskForm] = useState(false);  // 显示任务表单
  const [editingTask, setEditingTask] = useState(null);  // 正在编辑的任务
  const [taskSearchTerm, setTaskSearchTerm] = useState('');  // 任务搜索关键词
  const [taskFilterPriority, setTaskFilterPriority] = useState('all');  // 任务优先级筛选
  const [taskFilterAssignee, setTaskFilterAssignee] = useState('all');  // 任务分配筛选
  const [draggedTask, setDraggedTask] = useState(null);  // 当前拖拽的任务
  
  // 任务状态列定义
  const taskStatusColumns = [
    { id: 'todo', title: '待处理', color: '#FF6B6B' },
    { id: 'in_progress', title: '进行中', color: '#4ECDC4' },
    { id: 'review', title: '审核中', color: '#FFD166' },
    { id: 'done', title: '已完成', color: '#06D6A0' }
  ];
  
  // 任务优先级选项
  const taskPriorityOptions = [
    { id: 'low', label: '低', color: '#4CAF50' },
    { id: 'medium', label: '中', color: '#FF9800' },
    { id: 'high', label: '高', color: '#F44336' },
    { id: 'urgent', label: '紧急', color: '#9C27B0' }
  ];
  
  // 公告栏模块
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: '系统维护通知',
      content: '本周六凌晨2:00-4:00将进行系统维护，期间服务将短暂不可用。',
      author: '管理员',
      date: '2024-01-15',
      priority: 'high'
    },
    {
      id: 2,
      title: '新功能上线',
      content: '任务看板功能已正式上线，欢迎团队成员体验并提供反馈。',
      author: '产品部',
      date: '2025-12-26',
      priority: 'medium'
    },
    {
      id: 3,
      title: '春节放假安排',
      content: '2月9日至2月17日放假，2月18日正常上班。请大家提前安排好工作。',
      author: '人事部',
      date: '2024-01-13',
      priority: 'high'
    }
  ]);
  
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'medium'
  });
  
  // 评论模块
  const [comments, setComments] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // 首页图片自定义 - 初始化随机图片
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

  // 检查登录状态和获取数据
  useEffect(() => {
    const fetchData = async () => {            //定义异步函数获取数据
      try {
        console.log('正在连接后端服务...');
        
        // 首先检查是否已登录
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
        
        // 获取基础的欢迎消息
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);//更新message状态

        // 获取用户数据（登录后才获取）
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

  // 处理登录成功
  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
    // 登录成功后获取用户列表和项目列表
    fetchUsers();
    fetchProjects();  // 获取项目
  };

  // 获取项目列表
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

  // 获取任务列表
  const fetchTasks = async (projectId) => {
    if (!projectId) return;
    
    try {
      const response = await axios.get(
        `http://localhost:5000/api/projects/${projectId}/tasks`,
        { withCredentials: true }
      );
      setTasks(response.data);
    } catch (error) {
      console.error('获取任务列表失败:', error);
    }
  };

  // 创建/更新任务
  const handleTaskSubmit = async (taskData) => {
    if (!activeProjectId) {
      alert('请先选择一个项目');
      return;
    }

    try {
      const url = editingTask
        ? `http://localhost:5000/api/projects/${activeProjectId}/tasks/update/${editingTask.id}`
        : `http://localhost:5000/api/projects/${activeProjectId}/tasks/create`;
      
      const method = editingTask ? 'put' : 'post';
      
      const response = await axios[method](url, taskData, {
        withCredentials: true
      });
      
      if (response.data.task) {
        // 更新任务列表
        if (editingTask) {
          setTasks(tasks.map(t => 
            t.id === response.data.task.id ? response.data.task : t
          ));
        } else {
          setTasks([...tasks, response.data.task]);
        }
        
        // 重置表单
        setShowTaskForm(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error('保存任务失败:', error);
      alert(error.response?.data?.error || '操作失败');
    }
  };

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

  // 上传自定义图片
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

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/users');
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  // 处理登出
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

  // 选中项目时获取任务和成员
  const handleSelectProject = (projectId) => {
    setActiveProjectId(projectId);
    fetchProjectMembers(projectId);
    fetchTasks(projectId);
  };

  // 创建/更新项目
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

  // 删除项目
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

  // 邀请成员
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

  // 获取项目成员
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

  // 公告处理函数
  const handleAnnouncementSubmit = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      alert('请填写完整的公告信息');
      return;
    }

    if (editingAnnouncement) {
      // 编辑现有公告
      setAnnouncements(announcements.map(ann => 
        ann.id === editingAnnouncement.id 
          ? { 
              ...ann, 
              title: newAnnouncement.title,
              content: newAnnouncement.content,
              priority: newAnnouncement.priority,
              date: new Date().toISOString().split('T')[0]
            }
          : ann
      ));
    } else {
      // 添加新公告
      const newAnn = {
        id: announcements.length + 1,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        author: currentUser?.name || '管理员',
        date: new Date().toISOString().split('T')[0],
        priority: newAnnouncement.priority
      };
      setAnnouncements([newAnn, ...announcements]);
    }

    // 重置表单
    setNewAnnouncement({ title: '', content: '', priority: 'medium' });
    setEditingAnnouncement(null);
    setShowAnnouncementForm(false);
  };

  const handleDeleteAnnouncement = (id) => {
    if (window.confirm('确定要删除这条公告吗？')) {
      setAnnouncements(announcements.filter(ann => ann.id !== id));
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setNewAnnouncement({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority
    });
    setShowAnnouncementForm(true);
  };

  // 评论处理函数
  const handleSubmitComment = () => {
    if (!newComment.trim()) {
      alert('请输入评论内容');
      return;
    }

    const newCommentObj = {
      id: comments.length + 1,
      content: newComment,
      author: currentUser?.name || '匿名用户',
      authorAvatar: currentUser?.name?.charAt(0) || 'U',
      timestamp: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: 0,
      replies: []
    };

    setComments([newCommentObj, ...comments]);
    setNewComment('');
    setShowCommentForm(false);
  };

  const handleSubmitReply = (commentId) => {
    if (!replyContent.trim()) {
      alert('请输入回复内容');
      return;
    }

    const newReply = {
      id: Date.now(),
      content: replyContent,
      author: currentUser?.name || '匿名用户',
      authorAvatar: currentUser?.name?.charAt(0) || 'U',
      timestamp: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      likes: 0
    };

    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, newReply]
        };
      }
      return comment;
    }));

    setReplyContent('');
    setReplyingTo(null);
  };

  const handleLikeComment = (commentId, isReply = false, parentId = null) => {
    if (isReply && parentId) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return { ...reply, likes: reply.likes + 1 };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    } else {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: comment.likes + 1 };
        }
        return comment;
      }));
    }
  };

  const handleDeleteComment = (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('确定要删除这条评论吗？')) return;

    if (isReply && parentId) {
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== commentId)
          };
        }
        return comment;
      }));
    } else {
      setComments(comments.filter(comment => comment.id !== commentId));
    }
  };

  // 任务相关函数
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('确定要删除这个任务吗？')) return;
    
    try {
      await axios.delete(
        `http://localhost:5000/api/projects/${activeProjectId}/tasks/delete/${taskId}`,
        { withCredentials: true }
      );
      
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('删除任务失败:', error);
      alert(error.response?.data?.error || '删除失败');
    }
  };

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (status) => {
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:5000/api/projects/${activeProjectId}/tasks/update/${draggedTask.id}`,
        { status: status },
        { withCredentials: true }
      );
      
      // 更新本地状态
      setTasks(tasks.map(task => 
        task.id === draggedTask.id ? response.data.task : task
      ));
      
      setDraggedTask(null);
    } catch (error) {
      console.error('更新任务状态失败:', error);
      alert(error.response?.data?.error || '更新失败');
    }
  };

  // 筛选和搜索任务
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // 搜索筛选
      const matchesSearch = task.title.toLowerCase().includes(taskSearchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(taskSearchTerm.toLowerCase());
      
      // 优先级筛选
      const matchesPriority = taskFilterPriority === 'all' || task.priority === taskFilterPriority;
      
      // 分配者筛选
      const matchesAssignee = taskFilterAssignee === 'all' || task.assignee_id === parseInt(taskFilterAssignee);
      
      return matchesSearch && matchesPriority && matchesAssignee;
    });
  };

  // 加载状态渲染
  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>正在努力加载中QAQ.....</h1>
        </header>
      </div>
    );
  }

  // 未登录时显示登录/注册界面
  if (!isLoggedIn) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }



  // 渲染导航栏和多页面内容
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


{/* 右上角导航栏 */}
<nav className="top-navbar">
  <ul className="nav-list">
    <li className="nav-item">
      <button 
        className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
        onClick={() => setActivePage('home')}
      >

        <span className="nav-text">首页</span>
      </button>
    </li>
    <li className="nav-item">
      <button 
        className={`nav-link ${activePage === 'user' ? 'active' : ''}`}
        onClick={() => setActivePage('user')}
      >

        <span className="nav-text">用户中心</span>
      </button>
    </li>
    {/* 新增数据图表按钮 */}
    <li className="nav-item">
      <button 
        className={`nav-link ${activePage === 'charts' ? 'active' : ''}`}
        onClick={() => setActivePage('charts')}
      >
        <span className="nav-text">数据图表</span>
      </button>
    </li>
    <li className="nav-item">
      <button 
        className={`nav-link ${activePage === 'comments' ? 'active' : ''}`}
        onClick={() => setActivePage('comments')}
      >

        <span className="nav-text">评论</span>
      </button>
    </li>
    <li className="nav-item">
      <button 
        className="nav-link danger"
        onClick={handleLogout}
        title="登出系统"
      >

        <span className="nav-text">登出</span>
      </button>
    </li>
  </ul>
</nav>

      {/* 页面内容区域 */}
      <div className="page-content">
        
        {/* 首页：项目公告、项目管理、任务看板 */}
        <div className={`page home-page ${activePage === 'home' ? 'active' : ''}`}>
          <div className="main-content">
            <div className="right-content">
              {/* 公告栏 */}
              <div className="announcement-board">
                <div className="announcement-header">
                  <div className="announcement-title-section">
                    <h2>项目公告</h2>
                    <span className="announcement-count">共 {announcements.length} 条公告</span>
                  </div>
                  <button 
                    className="create-announcement-btn"
                    onClick={() => {
                      setShowAnnouncementForm(true);
                      setEditingAnnouncement(null);
                      setNewAnnouncement({ title: '', content: '', priority: 'medium' });
                    }}
                  >
                    <span>+</span> 发布公告
                  </button>
                </div>

                {/* 公告表单 */}
                {showAnnouncementForm && (
                  <div className="announcement-form-container">
                    <div className="form-header">
                      <h3>{editingAnnouncement ? '编辑公告' : '发布新公告'}</h3>
                      <button 
                        onClick={() => {
                          setShowAnnouncementForm(false);
                          setEditingAnnouncement(null);
                          setNewAnnouncement({ title: '', content: '', priority: 'medium' });
                        }}
                        className="close-form-btn"
                      >
                        ×
                      </button>
                    </div>
                    <div className="announcement-form">
                      <div className="form-group">
                        <label>公告标题</label>
                        <input
                          type="text"
                          placeholder="请输入公告标题"
                          value={newAnnouncement.title}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                          className="announcement-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>公告内容</label>
                        <textarea
                          placeholder="请输入公告内容"
                          value={newAnnouncement.content}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                          className="announcement-textarea"
                          rows="4"
                        />
                      </div>
                      <div className="form-group">
                        <label>优先级</label>
                        <select
                          value={newAnnouncement.priority}
                          onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                          className="announcement-select"
                        >
                          <option value="high">高优先级</option>
                          <option value="medium">中优先级</option>
                          <option value="low">低优先级</option>
                        </select>
                      </div>
                      <div className="announcement-form-actions">
                        <button
                          onClick={() => {
                            setShowAnnouncementForm(false);
                            setEditingAnnouncement(null);
                            setNewAnnouncement({ title: '', content: '', priority: 'medium' });
                          }}
                          className="cancel-btn"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleAnnouncementSubmit}
                          className="submit-btn"
                        >
                          {editingAnnouncement ? '更新公告' : '发布公告'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 公告列表 */}
                <div className="announcement-list">
                  {announcements.length > 0 ? (
                    announcements.map(announcement => (
                      <div 
                        key={announcement.id} 
                        className={`announcement-item ${announcement.priority === 'high' ? 'priority-high' : announcement.priority === 'medium' ? 'priority-medium' : 'priority-low'}`}
                      >
                        <div className="announcement-item-header">
                          <div className="announcement-item-title">
                            <h4>{announcement.title}</h4>
                            <span className={`announcement-priority ${announcement.priority}`}>
                              {announcement.priority === 'high' ? '重要' : announcement.priority === 'medium' ? '一般' : '普通'}
                            </span>
                          </div>
                          <div className="announcement-item-actions">
                            <button
                              onClick={() => handleEditAnnouncement(announcement)}
                              className="edit-announcement-btn"
                              title="编辑"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="delete-announcement-btn"
                              title="删除"
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        <div className="announcement-item-content">
                          <p>{announcement.content}</p>
                        </div>
                        <div className="announcement-item-footer">
                          <span className="announcement-author">发布人: {announcement.author}</span>
                          <span className="announcement-date">发布时间: {announcement.date}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-announcements">
                      <p>暂无公告，点击"发布公告"添加第一条公告</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 项目操作区域 */}
              <div className="projects-section">
                <div className="projects-header">
                  <h2>项目管理</h2>
                  <p>管理您的项目、团队成员和协作任务</p>
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
              
              {/* 任务看板模块 */}
              <div className="task-board-section">
                <div className="task-board-header">
                  <div className="task-board-title">
                    <h3>任务看板</h3>
                    <span className="task-count">任务总数: {getFilteredTasks().length}</span>
                  </div>
                  
                  <div className="task-controls">
                    {/* 搜索框 */}
                    <div className="search-box">
                      <input
                        type="text"
                        placeholder="搜索任务..."
                        value={taskSearchTerm}
                        onChange={(e) => setTaskSearchTerm(e.target.value)}
                        className="search-input"
                      />
                    </div>
                    
                    {/* 筛选器 */}
                    <div className="filter-controls">
                      <select
                        value={taskFilterPriority}
                        onChange={(e) => setTaskFilterPriority(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">所有优先级</option>
                        {taskPriorityOptions.map(option => (
                          <option key={option.id} value={option.id} style={{ color: option.color }}>
                            {option.label}优先级
                          </option>
                        ))}
                      </select>
                      
                      <select
                        value={taskFilterAssignee}
                        onChange={(e) => setTaskFilterAssignee(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">所有成员</option>
                        {projectMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 创建任务按钮 */}
                    <button 
                      onClick={() => { setShowTaskForm(true); setEditingTask(null); }}
                      className="create-task-btn"
                    >
                      <span>+</span> 创建任务
                    </button>
                  </div>
                </div>

                {/* 任务表单 */}
                {showTaskForm && (
                  <div className="task-form-container">
                    <div className="form-header">
                      <h3>{editingTask ? '编辑任务' : '创建新任务'}</h3>
                      <button 
                        onClick={() => { setShowTaskForm(false); setEditingTask(null); }}
                        className="close-form-btn"
                      >
                        ×
                      </button>
                    </div>
                    <TaskForm 
                      projectId={activeProjectId}
                      projectMembers={projectMembers}
                      task={editingTask}
                      onSubmit={handleTaskSubmit}
                      onCancel={() => {
                        setShowTaskForm(false);
                        setEditingTask(null);
                      }}
                    />
                  </div>
                )}

                {/* 任务看板列 */}
                <div className="task-board-columns">
                  {taskStatusColumns.map(column => {
                    const columnTasks = getFilteredTasks().filter(task => task.status === column.id);
                    
                    return (
                      <div 
                        key={column.id}
                        className="task-column"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(column.id)}
                      >
                        <div className="column-header" style={{ borderTopColor: column.color }}>
                          <div className="column-title">
                            <span className="column-color-dot" style={{ backgroundColor: column.color }}></span>
                            {column.title}
                          </div>
                          <span className="column-count">{columnTasks.length}</span>
                        </div>
                        
                        <div className="task-list">
                          {columnTasks.map(task => (
                            <div
                              key={task.id}
                              className="task-card"
                              draggable
                              onDragStart={() => handleDragStart(task)}
                            >
                              <div className="task-header">
                                <div className="task-priority" style={{ 
                                  backgroundColor: taskPriorityOptions.find(p => p.id === task.priority)?.color || '#ccc'
                                }}>
                                  {taskPriorityOptions.find(p => p.id === task.priority)?.label || task.priority}
                                </div>
                                <div className="task-actions">
                                  <button
                                    onClick={() => {
                                      setEditingTask(task);
                                      setShowTaskForm(true);
                                    }}
                                    className="task-action-btn"
                                    title="编辑"
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="task-action-btn"
                                    title="删除"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                              
                              <div className="task-content">
                                <h4 className="task-title">{task.title}</h4>
                                <p className="task-description">{task.description}</p>
                              </div>
                              
                              <div className="task-footer">
                                <div className="task-assignee">
                                  {task.assignee_avatar ? (
                                    <div className="assignee-avatar-small">
                                      {task.assignee_name?.charAt(0)}
                                    </div>
                                  ) : (
                                    <span className="unassigned">未分配</span>
                                  )}
                                </div>
                                
                                {task.due_date && (
                                  <div className="task-due-date">
                                    📅 {new Date(task.due_date).toLocaleDateString('zh-CN')}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          
                          {columnTasks.length === 0 && (
                            <div className="empty-column">
                              暂无任务，可拖拽任务到此列
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>


{/* 用户中心页面：当前用户、用户列表和系统健康检查 */}
<div className={`page user-center-page ${activePage === 'user' ? 'active' : ''}`}>
  <div className="user-center-grid">
    {/* 当前用户信息 */}
    <div className="user-center-card">
      <h3 className="user-center-title">当前用户信息</h3>
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
    <div className="user-center-card">
      <h3 className="user-center-title">用户列表 ({users.length})</h3>
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
    
    {/* 系统健康检查 - 移动到用户中心 */}
    <div className="user-center-card">
      <h3 className="user-center-title">系统健康状态</h3>
      
      <div className="health-status-large">
        <div className={`status-indicator-large ${message ? 'status-ok' : 'status-error'}`}></div>
        <div className="health-message">{message || '未连接到后端'}</div>
      </div>
      
      <div className="health-details">
        <div className="health-detail-item">
          <div className="health-detail-label">用户状态</div>
          <div className="health-detail-value">
            {currentUser ? `${currentUser.name} (已登录)` : '未登录'}
          </div>
        </div>
        
        <div className="health-detail-item">
          <div className="health-detail-label">项目数量</div>
          <div className="health-detail-value">{projects.length} 个</div>
        </div>
        
        <div className="health-detail-item">
          <div className="health-detail-label">在线用户</div>
          <div className="health-detail-value">{users.length} 人</div>
        </div>
        
        <div className="health-detail-item">
          <div className="health-detail-label">任务总数</div>
          <div className="health-detail-value">{tasks.length} 个</div>
        </div>
      </div>
      
      <div className="health-actions">
        <a 
          href="http://localhost:5000/api/health" 
          target="_blank" 
          rel="noopener noreferrer"
          className="health-action-btn"
        >
          后端健康检查
        </a>
        <button 
          onClick={() => {
            // 重新获取数据刷新状态
            fetchProjects();
            fetchUsers();
            if (activeProjectId) {
              fetchTasks(activeProjectId);
              fetchProjectMembers(activeProjectId);
            }
            alert('系统状态已刷新');
          }}
          className="health-action-btn"
        >
          刷新状态
        </button>
      </div>
    </div>
  </div>
</div>

       {/* 数据图表页面 */}
<div className={`page charts-page ${activePage === 'charts' ? 'active' : ''}`}>
  <div className="charts-page-content">
    <ChartDashboard 
      tasks={tasks}
      projects={projects}
      activeProjectId={activeProjectId}
    />
  </div>
</div>

        {/* 评论页面 */}
        <div className={`page comments-page ${activePage === 'comments' ? 'active' : ''}`}>
          <div className="comments-section">
            <div className="comments-header">
              <div className="comments-title-section">
                <h2>评论区</h2>
                <span className="comments-count">共 {comments.length} 条评论</span>
              </div>
              <button 
                className="new-comment-btn"
                onClick={() => setShowCommentForm(true)}
              >
                <span>+</span> 发表评论
              </button>
            </div>

            {/* 评论表单 */}
            {showCommentForm && (
              <div className="comment-form-container">
                <div className="form-header">
                  <h3>发表评论</h3>
                  <button 
                    onClick={() => setShowCommentForm(false)}
                    className="close-form-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="comment-form">
                  <textarea
                    placeholder="请输入您的评论..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-textarea"
                    rows="4"
                  />
                  <div className="comment-form-actions">
                    <button
                      onClick={() => setShowCommentForm(false)}
                      className="cancel-btn"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      className="submit-btn"
                    >
                      发布评论
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 评论列表 */}
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author">
                        <div className="comment-avatar">
                          {comment.authorAvatar}
                        </div>
                        <div className="comment-author-info">
                          <div className="comment-author-name">{comment.author}</div>
                          <div className="comment-timestamp">{comment.timestamp}</div>
                        </div>
                      </div>
                      <div className="comment-actions">
                        <button
                          onClick={() => handleLikeComment(comment.id)}
                          className="comment-action-btn like-btn"
                          title="点赞"
                        >
                          <span>👍</span> {comment.likes > 0 && comment.likes}
                        </button>
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="comment-action-btn reply-btn"
                          title="回复"
                        >
                          回复
                        </button>
                        {(currentUser?.name === comment.author || currentUser?.name === '管理员') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="comment-action-btn delete-btn"
                            title="删除"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="comment-content">
                      {comment.content}
                    </div>

                    {/* 回复表单 */}
                    {replyingTo === comment.id && (
                      <div className="reply-form-container">
                        <textarea
                          placeholder={`回复 ${comment.author}...`}
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="reply-textarea"
                          rows="3"
                        />
                        <div className="reply-form-actions">
                          <button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent('');
                            }}
                            className="reply-cancel-btn"
                          >
                            取消
                          </button>
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            className="reply-submit-btn"
                          >
                            提交回复
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 回复列表 */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="replies-list">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="reply-item">
                            <div className="reply-header">
                              <div className="reply-author">
                                <div className="reply-avatar">
                                  {reply.authorAvatar}
                                </div>
                                <div>
                                  <div className="reply-author-name">{reply.author}</div>
                                  <div className="reply-timestamp">{reply.timestamp}</div>
                                </div>
                              </div>
                              <div className="reply-actions">
                                <button
                                  onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                  className="reply-action-btn"
                                  title="点赞"
                                >
                                  <span>👍</span> {reply.likes > 0 && reply.likes}
                                </button>
                                {(currentUser?.name === reply.author || currentUser?.name === '管理员') && (
                                  <button
                                    onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                    className="reply-action-btn"
                                    title="删除"
                                  >
                                    删除
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="reply-content">
                              {reply.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  <p>暂无评论，点击"发表评论"添加第一条评论</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;// 导出组件供其他文件使用！