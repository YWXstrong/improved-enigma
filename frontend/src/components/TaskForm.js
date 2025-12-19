//任务看板布局ui

import React, { useState, useEffect } from 'react';

function TaskForm({ projectId, projectMembers, task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    assignee_id: '',
    due_date: ''
  });

  // 如果是编辑模式，用任务数据填充表单
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'medium',
        status: task.status || 'todo',
        assignee_id: task.assignee_id || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : ''
      });
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 验证必填字段
    if (!formData.title.trim()) {
      alert('请填写任务标题');
      return;
    }
    
    onSubmit(formData);
  };

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    urgent: '#9C27B0'
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div className="form-group">
        <label htmlFor="title">任务标题 *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="输入任务标题"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">任务描述</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="输入任务描述"
          rows="4"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="priority">优先级</label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low" style={{ color: priorityColors.low }}>低</option>
            <option value="medium" style={{ color: priorityColors.medium }}>中</option>
            <option value="high" style={{ color: priorityColors.high }}>高</option>
            <option value="urgent" style={{ color: priorityColors.urgent }}>紧急</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="assignee_id">分配给</label>
          <select
            id="assignee_id"
            name="assignee_id"
            value={formData.assignee_id}
            onChange={handleChange}
          >
            <option value="">未分配</option>
            {projectMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} ({member.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">状态</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="todo">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="review">审核中</option>
            <option value="done">已完成</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="due_date">截止日期</label>
          <input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          取消
        </button>
        <button type="submit" className="submit-btn">
          {task ? '更新任务' : '创建任务'}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;