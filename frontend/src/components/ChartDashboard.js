/**
 * 简易图表仪表板 - 不使用外部图表库
 * 使用纯 CSS 和 HTML 实现简单数据可视化
 */

import React from 'react';

const SimpleChartDashboard = ({ tasks = [], projects = [], activeProjectId }) => {
  // 计算统计数据
  const taskStatusStats = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {});

  const taskPriorityStats = tasks.reduce((acc, task) => {
    acc[task.priority] = (acc[task.priority] || 0) + 1;
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const completedTasks = taskStatusStats.done || 0;
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 状态颜色映射
  const statusColors = {
    todo: '#FF6B6B',
    in_progress: '#4ECDC4',
    review: '#FFD166',
    done: '#06D6A0'
  };

  const priorityColors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#F44336',
    urgent: '#9C27B0'
  };

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h2> 数据分析</h2>
        <div className="charts-stats-summary">
          <div className="stat-item">
            <span className="stat-label">总任务数</span>
            <span className="stat-value">{totalTasks}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">总项目数</span>
            <span className="stat-value">{projects.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">完成率</span>
            <span className="stat-value">{completionRate}%</span>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        {/* 任务状态分布 - 使用进度条表示 */}
        <div className="chart-card">
          <h3>任务状态分布</h3>
          <div className="chart-container simple-chart">
            {Object.entries(taskStatusStats).map(([status, count]) => {
              const percentage = totalTasks ? Math.round((count / totalTasks) * 100) : 0;
              const statusNames = {
                todo: '待处理',
                in_progress: '进行中',
                review: '审核中',
                done: '已完成'
              };
              
              return (
                <div key={status} className="chart-bar-item">
                  <div className="chart-bar-label">
                    <span className="bar-label-name">{statusNames[status] || status}</span>
                    <span className="bar-label-value">{count} ({percentage}%)</span>
                  </div>
                  <div className="chart-bar-track">
                    <div 
                      className="chart-bar-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: statusColors[status] || '#ccc'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 任务优先级分布 - 使用圆形进度图 */}
        <div className="chart-card">
          <h3> 任务优先级分布</h3>
          <div className="chart-container simple-chart">
            <div className="priority-circles">
              {Object.entries(taskPriorityStats).map(([priority, count]) => {
                const percentage = totalTasks ? Math.round((count / totalTasks) * 100) : 0;
                const priorityNames = {
                  low: '低',
                  medium: '中',
                  high: '高',
                  urgent: '紧急'
                };
                
                return (
                  <div key={priority} className="priority-circle-item">
                    <div 
                      className="priority-circle"
                      style={{
                        background: `conic-gradient(${priorityColors[priority] || '#ccc'} 0% ${percentage}%, #f0f0f0 ${percentage}% 100%)`
                      }}
                    >
                      <div className="circle-inner">
                        <span className="circle-value">{count}</span>
                        <span className="circle-label">{priorityNames[priority] || priority}</span>
                      </div>
                    </div>
                    <div className="priority-info">
                      <span>{priorityNames[priority] || priority}优先级</span>
                      <span>{count}个 ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 项目统计 */}
        {projects.length > 0 && (
          <div className="chart-card">
            <h3>🏢 项目统计</h3>
            <div className="chart-container simple-chart">
              <div className="project-stats">
                {projects.slice(0, 5).map(project => (
                  <div key={project.id} className="project-stat-item">
                    <div className="project-name">{project.name}</div>
                    <div className="project-members">
                      <span>👥 成员: {project.member_count || 0}</span>
                      <span>📋 任务: {tasks.filter(t => t.project_id === project.id).length}</span>
                    </div>
                    <div className="project-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${Math.min((project.member_count || 0) * 20, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 数据洞察 */}
        <div className="chart-card">
          <h3> 数据洞察</h3>
          <div className="chart-container simple-chart">
            <div className="insights-list">
              <div className="insight-item">
                <div className="insight-icon">📈</div>
                <div className="insight-content">
                  <h4>工作效率</h4>
                  <p>任务完成率: <strong>{completionRate}%</strong></p>
                  {completionRate > 70 ? 
                    <span className="insight-good">表现优秀</span> : 
                    completionRate > 40 ? 
                    <span className="insight-ok"> 有待提升</span> : 
                    <span className="insight-warning">需要关注</span>
                  }
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">⚡</div>
                <div className="insight-content">
                  <h4>优先级分析</h4>
                  <p>高优先级任务: <strong>{taskPriorityStats.high || 0}个</strong></p>
                  {(taskPriorityStats.high || 0) > 5 ? 
                    <span className="insight-warning">高优先级任务较多</span> : 
                    <span className="insight-good">优先级分布合理</span>
                  }
                </div>
              </div>
              
              <div className="insight-item">
                <div className="insight-icon">👥</div>
                <div className="insight-content">
                  <h4>团队协作</h4>
                  <p>活跃项目: <strong>{projects.length}个</strong></p>
                  {projects.length > 3 ? 
                    <span className="insight-good">项目丰富</span> : 
                    <span className="insight-info"> 可创建更多项目</span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleChartDashboard;