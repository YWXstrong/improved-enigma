import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

/**
 * 登录/注册组件
 * 这是一个简单的认证组件，包含登录和注册功能
 */
function Auth({ onLoginSuccess }) {
  // 状态管理
  const [isLogin, setIsLogin] = useState(true);  // true=登录模式, false=注册模式
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 处理输入框变化
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');  // 清除错误信息
  };

  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await axios.post(`http://localhost:5000${endpoint}`, {
        email: formData.email,
        password: formData.password,
        ...(isLogin ? {} : { name: formData.name })  // 注册时需要姓名
      }, {
        withCredentials: true  // 允许发送 cookies（用于 session）
      });

      // 登录/注册成功
      if (response.data.user) {
        onLoginSuccess(response.data.user);
      }
    } catch (err) {
      // 显示错误信息（优先显示后端返回的错误，否则显示网络错误）
      const errorMessage = err.response?.data?.error || 
                          err.message || 
                          '操作失败，请重试';
      setError(errorMessage);
      console.error('登录/注册错误:', err);
    } finally {
      setLoading(false);
    }
  };

  // 切换登录/注册模式
  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{isLogin ? '用户登录' : '用户注册'}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* 注册模式显示姓名输入框 */}
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">姓名</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入您的姓名"
                required
              />
            </div>
          )}

          {/* 邮箱输入框 */}
          <div className="form-group">
            <label htmlFor="email">邮箱</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入您的邮箱"
              required
            />
          </div>

          {/* 密码输入框 */}
          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              required
              minLength="6"
            />
          </div>

          {/* 错误信息显示 */}
          {error && <div className="error-message">{error}</div>}

          {/* 提交按钮 */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        {/* 切换登录/注册模式 */}
        <div className="toggle-mode">
          <span>
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button type="button" onClick={toggleMode} className="toggle-btn">
              {isLogin ? '立即注册' : '立即登录'}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Auth;

