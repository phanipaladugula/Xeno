// Xeno CRM API Service
const API_BASE_URL = 'http://localhost:8080/api';

class ApiService {
  async request(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const err = await response.json();
          errorMsg = err.error || err.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      return response.json();
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Is the server running?');
      }
      throw err;
    }
  }

  // --- Customers ---
  getCustomers(page = 0, size = 20, search = '') {
    const params = new URLSearchParams({ page, size });
    if (search) params.append('search', search);
    return this.request(`/customers?${params}`);
  }

  getCustomer(id) {
    return this.request(`/customers/${id}`);
  }

  createCustomer(data) {
    return this.request('/customers', { method: 'POST', body: JSON.stringify(data) });
  }

  updateCustomer(id, data) {
    return this.request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteCustomer(id) {
    return this.request(`/customers/${id}`, { method: 'DELETE' });
  }

  getCustomerStats() {
    return this.request('/customers/stats');
  }

  // --- Segments ---
  getSegments() {
    return this.request('/segments');
  }

  getSegment(id) {
    return this.request(`/segments/${id}`);
  }

  createSegment(data) {
    return this.request('/segments', { method: 'POST', body: JSON.stringify(data) });
  }

  updateSegment(id, data) {
    return this.request(`/segments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteSegment(id) {
    return this.request(`/segments/${id}`, { method: 'DELETE' });
  }

  previewSegment(rules) {
    return this.request('/segments/preview', { method: 'POST', body: JSON.stringify({ rules }) });
  }

  getSegmentCustomers(id) {
    return this.request(`/segments/${id}/customers`);
  }

  // --- Campaigns ---
  getCampaigns() {
    return this.request('/campaigns');
  }

  getCampaign(id) {
    return this.request(`/campaigns/${id}`);
  }

  createCampaign(data) {
    return this.request('/campaigns', { method: 'POST', body: JSON.stringify(data) });
  }

  updateCampaign(id, data) {
    return this.request(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteCampaign(id) {
    return this.request(`/campaigns/${id}`, { method: 'DELETE' });
  }

  launchCampaign(id) {
    return this.request(`/campaigns/${id}/launch`, { method: 'POST' });
  }

  getCampaignStats(id) {
    return this.request(`/campaigns/${id}/stats`);
  }

  getCampaignRecipients(id) {
    return this.request(`/campaigns/${id}/recipients`);
  }

  getGlobalCampaignStats() {
    return this.request('/campaigns/stats/global');
  }

  // --- AI Agent ---
  chat(content, history = []) {
    return this.request('/agent/chat', {
      method: 'POST',
      body: JSON.stringify({ content, history }),
    });
  }

  getDashboard() {
    return this.request('/agent/dashboard');
  }

  getAgentStatus() {
    return this.request('/agent/status');
  }
}

export default new ApiService();