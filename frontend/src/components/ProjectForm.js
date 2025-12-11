// src/components/ProjectForm.js
//项目管理
import React, { useState } from 'react';

function ProjectForm({ project, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'active'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          项目名称 *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          项目描述
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            minHeight: '80px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px' }}>
          状态
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd'
          }}
        >
          <option value="active">进行中</option>
          <option value="completed">已完成</option>
          <option value="archived">已归档</option>
        </select>
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <button 
          type="submit" 
          style={{ 
            padding: '10px 20px',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {project ? '更新' : '创建'}
        </button>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ 
            padding: '10px 20px',
            background: '#f8f9fa',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          取消
        </button>
      </div>
    </form>
  );
}

export default ProjectForm;