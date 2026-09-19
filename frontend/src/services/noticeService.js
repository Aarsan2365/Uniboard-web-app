// services/noticeService.js
//
// Every function here maps to a backend route. Components call these
// instead of using axios directly — keeps REST API details out of
// the Vue components entirely.
//
// create/update build a FormData payload so an optional image file
// can ride alongside the text fields as multipart/form-data; the
// backend (multer) only kicks in when the content-type is multipart,
// so this doesn't change anything for the no-image case.

import api from './api';

const buildFormData = (notice) => {
  const formData = new FormData();
  formData.append('title', notice.title);
  formData.append('body', notice.body);
  formData.append('category', notice.category);
  if (notice.targetBatch) {
    formData.append('targetBatch', notice.targetBatch);
  }
  if (notice.image) {
    formData.append('image', notice.image);
  }
  return formData;
};

// params: { category, search, page, limit }
const getAll = async (params = {}) => {
  const { data } = await api.get('/notices', { params });
  return data; // { data: [...], meta: { total, page, pages, limit } }
};

const getById = async (id) => {
  const { data } = await api.get(`/notices/${id}`);
  return data;
};

const create = async (notice) => {
  const { data } = await api.post('/notices', buildFormData(notice), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const update = async (id, notice) => {
  const { data } = await api.put(`/notices/${id}`, buildFormData(notice), {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

const remove = async (id) => {
  const { data } = await api.delete(`/notices/${id}`);
  return data;
};

const markAsRead = async (id) => {
  const { data } = await api.post(`/notices/${id}/read`);
  return data;
};

const getReadReceipts = async (id) => {
  const { data } = await api.get(`/notices/${id}/reads`);
  return data; // { count, readers: [{ id, name, email, readAt }] }
};

const getUnreadCount = async () => {
  const { data } = await api.get('/notices/unread-count');
  return data.unreadCount;
};

export default {
  getAll,
  getById,
  create,
  update,
  remove,
  markAsRead,
  getReadReceipts,
  getUnreadCount,
};
