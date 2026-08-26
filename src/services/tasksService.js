import { apiRequest } from './api';

export const tasksService = {
  // GET /api/tasks
  getTasks: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.search) query.append('search', params.search);

      // Deadlines multi-select
      if (params.deadline && params.deadline !== 'all') {
        if (Array.isArray(params.deadline)) {
          params.deadline.forEach((d) => query.append('deadline', d));
        } else {
          query.append('deadline', params.deadline);
        }
      }

      // Task Status multi-select
      if (params.status && params.status !== 'all') {
        if (Array.isArray(params.status)) {
          params.status.forEach((s) => query.append('status', s));
        } else {
          query.append('status', params.status);
        }
      }

      // Contact Status multi-select
      if (params.contact_status && params.contact_status !== 'all') {
        if (Array.isArray(params.contact_status)) {
          params.contact_status.forEach((cs) => query.append('contact_status', cs));
        } else {
          query.append('contact_status', params.contact_status);
        }
      }

      // Priority multi-select
      if (params.priority && params.priority !== 'all') {
        if (Array.isArray(params.priority)) {
          params.priority.forEach((p) => query.append('priority', p));
        } else {
          query.append('priority', params.priority);
        }
      }

      if (params.assigned_to && params.assigned_to !== 'all' && params.assigned_to !== 'All Users') {
        query.append('assigned_to', params.assigned_to);
      }
      if (params.contact_id) query.append('contact_id', params.contact_id);
      if (params.sort_by) query.append('sort_by', params.sort_by);
      if (params.sort_order) query.append('sort_order', params.sort_order);

      const qs = query.toString();
      const response = await apiRequest(`/tasks${qs ? `?${qs}` : ''}`);
      return response;
    } catch (error) {
      console.warn('[Tasks Service] getTasks failed:', error);
      return {
        count: 0,
        summary: { total: 0, todoCount: 0, inProgressCount: 0, completedCount: 0, overdueCount: 0 },
        data: [],
      };
    }
  },

  // GET /api/tasks/:id
  getTask: async (id) => {
    const response = await apiRequest(`/tasks/${id}`);
    return response.data;
  },

  // POST /api/tasks
  createTask: async (taskData) => {
    const response = await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
    return response.data;
  },

  // PUT /api/tasks/:id
  updateTask: async (id, taskData) => {
    const response = await apiRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
    return response.data;
  },

  // PUT /api/tasks/:id/status
  updateTaskStatus: async (id, status) => {
    const response = await apiRequest(`/tasks/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  // DELETE /api/tasks/:id
  deleteTask: async (id) => {
    const response = await apiRequest(`/tasks/${id}`, {
      method: 'DELETE',
    });
    return response;
  },
};
