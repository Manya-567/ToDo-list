import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://127.0.0.1:8000/api/tasks/';

function App() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(API_URL, form);
      setForm({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      console.error('Error adding task:', err.message);
    }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}${editTaskId}/`, {
        ...form,
        completed: false,
      });
      setForm({ title: '', description: '' });
      setEditMode(false);
      setEditTaskId(null);
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err.message);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err.message);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await axios.put(`${API_URL}${task.id}/`, {
        title: task.title,
        description: task.description,
        completed: !task.completed,
      });
      fetchTasks();
    } catch (err) {
      console.error('Error toggling complete:', err.message);
    }
  };

  const startEditing = (task) => {
    setEditMode(true);
    setEditTaskId(task.id);
    setForm({ title: task.title, description: task.description });
  };

  return (
    <div className="container">
      <h2>📝 Todo List App (MongoDB + Django + React)</h2>

      <form onSubmit={editMode ? updateTask : addTask}>
        <input
          type="text"
          placeholder="Task Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <button type="submit">{editMode ? 'Update Task' : 'Add Task'}</button>
        {editMode && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setEditMode(false);
              setEditTaskId(null);
              setForm({ title: '', description: '' });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task-card">
            <div className="task-header">
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task)}
                />
                <span className={`task-title ${task.completed ? 'completed' : ''}`}>
                  {task.title}
                </span>
              </label>
            </div>
            {task.description && (
              <p className="task-desc">{task.description}</p>
            )}
            <div className="task-actions">
              <button className="edit-btn" onClick={() => startEditing(task)}>
                Edit
              </button>
              <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
