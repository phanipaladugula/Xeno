// API service for backend communication
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  // Helper to make API calls
  async request(url, options = {}) {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(userId && { 'X-User-Id': userId }),
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

  async createGroupChat(title) {
    return this.request('/chats/group', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async addParticipant(chatId, userId) {
    return this.request(`/chats/${chatId}/participants`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  async removeParticipant(chatId, userId) {
    return this.request(`/chats/${chatId}/participants/${userId}`, {
      method: 'DELETE'
    });
  }

  async getParticipants(chatId) {
    return this.request(`/chats/${chatId}/participants`);
  }

  async getMessages(chatId) {
    return this.request(`/chats/${chatId}/messages`);
  }

  async sendMessage(chatId, content, sender, isAiResponse) {
    return this.request(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, sender, isAiResponse })
    });
  }

  async deleteChat(chatId) {
    return this.request(`/chats/${chatId}`, {
      method: 'DELETE'
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

  // Agent endpoints
  async processAgentMessage(chatId, content) {
    return this.request('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ chatId, content })
    });
  }

  async getAgentStatus() {
    return this.request('/agent/status');
  }

  // Task endpoints (updated with query params)
  async getTasks(filter = {}) {
    let url = '/tasks';
    const params = new URLSearchParams();
    if (filter.status) params.append('status', filter.status);
    if (filter.priority) params.append('priority', filter.priority);
    if (params.toString()) url += '?' + params.toString();
    return this.request(url);
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