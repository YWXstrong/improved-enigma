import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 测试后端连接
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('正在连接后端服务...');
        const response = await axios.get('http://localhost:5000/');
        setMessage(response.data.message);
        
        const usersResponse = await axios.get('http://localhost:5000/api/users');
        setUsers(usersResponse.data);
        console.log('后端连接成功！');
      } catch (error) {
        setMessage('❌ 后端连接失败 - 请确保后端服务正在运行');
        console.error('API调用错误:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>��� 加载中...</h1>
        </header>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>��� Improved Enigma - 全栈应用</h1>
        <p>{message}</p>
        
        <h2>��� 用户列表</h2>
        <div className="users-list">
          {users.map(user => (
            <div key={user.id} className="user-card">
              <strong>{user.name}</strong>
              <br />
              <span>{user.email}</span>
            </div>
          ))}
        </div>

        <div className="links">
          <a href="http://localhost:5000/api/health" target="_blank" rel="noopener noreferrer">
            后端健康检查
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
