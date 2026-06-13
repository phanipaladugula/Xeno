// API service for backend communication
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  // Helper to make API calls
  async request(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(username, password, email) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email })
    });
  }

  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  }

  // Chat endpoints
  async getChats() {
    return this.request('/chats');
  }

  async createChat(title) {
    return this.request('/chats', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async getMessages(chatId) {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId, content) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  // Task endpoints
  async getTasks() {
    return this.request('/tasks');
  }

  async createTask(task) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  }

  async updateTask(taskId, task) {
    return this.request(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(task)
    });
  }

  async deleteTask(taskId) {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE'
    });
  }

  async markTaskComplete(taskId) {
    return this.request(`/tasks/${taskId}/complete`, {
      method: 'PUT'
    });
  }
}

export default new ApiService();