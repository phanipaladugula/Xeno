// Tests for api service
import api from '../api';

// Mock fetch
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
  localStorage.clear();
});

describe('ApiService', () => {
  describe('Auth endpoints', () => {
    test('register should make POST request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ userId: 1, username: 'test', token: 'test-token' })
      });

      const result = await api.register('testuser', 'password123', 'test@example.com');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: 'testuser', password: 'password123', email: 'test@example.com' })
        }
      );
      expect(result).toHaveProperty('username', 'test');
    });

    test('login should make POST request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ userId: 1, username: 'test', token: 'test-token' })
      });

      const result = await api.login('testuser', 'password123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: 'testuser', password: 'password123' })
        }
      );
      expect(result).toHaveProperty('username', 'test');
    });

    test('login should store token in localStorage', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ userId: 1, username: 'test', token: 'test-token' })
      });

      await api.login('testuser', 'password123');

      expect(localStorage.getItem('token')).toBe('test-token');
      expect(localStorage.getItem('userId')).toBe('1');
      expect(localStorage.getItem('username')).toBe('test');
    });
  });

  describe('Chat endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
    });

    test('getChats should make GET request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'Test Chat' }])
      });

      const result = await api.getChats();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/chats',
        {
          method: 'GET',
          headers: expect.objectContaining({
            'X-User-Id': '1',
            'Authorization': 'Bearer test-token'
          })
        }
      );
      expect(Array.isArray(result)).toBe(true);
    });

    test('createChat should make POST request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1, title: 'New Chat' })
      });

      const result = await api.createChat('New Chat');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/chats',
        {
          method: 'POST',
          headers: expect.objectContaining({
            'X-User-Id': '1'
          }),
          body: JSON.stringify({ title: 'New Chat' })
        }
      );
      expect(result).toHaveProperty('title', 'New Chat');
    });
  });

  describe('Task endpoints', () => {
    beforeEach(() => {
      localStorage.setItem('userId', '1');
      localStorage.setItem('token', 'test-token');
    });

    test('getTasks should make GET request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'Test Task' }])
      });

      const result = await api.getTasks();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks',
        {
          method: 'GET',
          headers: expect.objectContaining({
            'X-User-Id': '1'
          })
        }
      );
      expect(Array.isArray(result)).toBe(true);
    });

    test('createTask should make POST request', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 1, title: 'New Task' })
      });

      const task = { title: 'New Task', priority: 'MEDIUM' };
      const result = await api.createTask(task);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/tasks',
        {
          method: 'POST',
          headers: expect.objectContaining({
            'X-User-Id': '1'
          }),
          body: JSON.stringify(task)
        }
      );
      expect(result).toHaveProperty('title', 'New Task');
    });
  });

  describe('Error handling', () => {
    test('should throw error on failed request', async () => {
      fetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' })
      });

      await expect(api.login('testuser', 'wrongpass')).rejects.toThrow('Unauthorized');
    });
  });
});