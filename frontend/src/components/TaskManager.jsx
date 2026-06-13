import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './TaskManager.css';

function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const filterParams = {};
      if (filter !== 'all' && filter !== 'completed' && filter !== 'pending') {
        filterParams.status = filter.toUpperCase();
      }
      if (filter === 'completed') {
        filterParams.status = 'COMPLETED';
      }
      if (filter === 'pending') {
        filterParams.status = 'TODO';
      }

      const data = await api.getTasks(filterParams);
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      const newTask = await api.createTask(taskData);
      setTasks([newTask, ...tasks]);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
      alert('Failed to create task: ' + err.message);
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      const updatedTask = await api.updateTask(editingTask.id, taskData);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      setEditingTask(null);
      setShowForm(false);
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task: ' + err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.deleteTask(taskId);
        setTasks(tasks.filter(t => t.id !== taskId));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleToggleComplete = async (taskId, isCompleted) => {
    try {
      const updatedTask = await api.markTaskComplete(taskId);
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#ef4444';
      case 'HIGH': return '#f97316';
      case 'MEDIUM': return '#eab308';
      case 'LOW': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return '✓ Done';
      case 'IN_PROGRESS': return '→ In Progress';
      case 'TODO': return '○ To Do';
      default: return status;
    }
  };

  if (loading) {
    return <div className="task-manager loading">Loading tasks...</div>;
  }

  return (
    <div className="task-manager">
      <div className="task-header">
        <h2>My Tasks</h2>
        <button
          className="new-task-button"
          onClick={() => {
            setEditingTask(null);
            setShowForm(true);
          }}
        >
          + New Task
        </button>
      </div>

      <div className="task-filters">
        {['all', 'pending', 'completed', 'TODO', 'IN_PROGRESS'].map(f => (
          <button
            key={f}
            className={`filter-button ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="empty-tasks">
          <p>No tasks found</p>
          <p>Click "New Task" to create one</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? 'completed' : ''}`}
            >
              <div className="task-left">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={(e) => handleToggleComplete(task.id, e.target.checked)}
                  className="task-checkbox"
                />
                <div className="task-content">
                  <div className="task-title">{task.title}</div>
                  {task.description && (
                    <div className="task-description">{task.description}</div>
                  )}
                  <div className="task-meta">
                    <span
                      className="task-priority"
                      style={{ color: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span className="task-status">{getStatusBadge(task.status)}</span>
                    {task.dueDate && (
                      <span className="task-due">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="edit-button"
                  onClick={() => handleEditTask(task)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          task={editingTask}
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}

function TaskForm({ task, onSubmit, onCancel }) {
  const [title, setTitle] = useState(task ? task.title : '');
  const [description, setDescription] = useState(task ? task.description || '' : '');
  const [priority, setPriority] = useState(task ? task.priority : 'MEDIUM');
  const [dueDate, setDueDate] = useState(task ? task.dueDate || '' : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      title,
      description,
      priority,
      dueDate: dueDate || null
    };
    onSubmit(taskData);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? 'Edit Task' : 'New Task'}</h3>
          <button className="close-modal" onClick={onCancel}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-button">
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TaskManager;