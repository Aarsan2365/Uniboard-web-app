import api from './api';
const buildFormData = notice => {
  const form = new FormData();
  form.append('title', notice.title);
  form.append('body', notice.body);
  form.append('category', notice.category);
  form.append('targetBatch', notice.targetBatch || 'All');
  if (notice.removeImage) form.append('removeImage', 'true');
  if (notice.removePdf) form.append('removePdf', 'true');
  if (notice.category === 'Events') {
    form.append('eventDate', new Date(notice.eventDate).toISOString());
    form.append('eventLocation', notice.eventLocation);
  }
  if (notice.image) form.append('image', notice.image);
  if (notice.pdf) form.append('pdf', notice.pdf);
  return form;
};
const getAll = async (params = {}) => (await api.get('/notices', { params })).data;
const getById = async id => (await api.get(`/notices/${id}`)).data;
const getPdf = async (id, { download = false, signal } = {}) => {
  try {
    return (await api.get(`/notices/${id}/pdf`, { responseType: 'blob', params: download ? { download: '1' } : {}, signal })).data;
  } catch (error) {
    // Binary requests also receive JSON errors, for example when a file is missing.
    if (error.response?.data instanceof Blob) {
      try { error.response.data = JSON.parse(await error.response.data.text()); } catch { /* Keep the original error. */ }
    }
    throw error;
  }
};
const create = async notice => (await api.post('/notices', buildFormData(notice))).data;
const update = async (id, notice) => (await api.put(`/notices/${id}`, buildFormData(notice))).data;
const remove = async id => (await api.delete(`/notices/${id}`)).data;
const markAsRead = async id => (await api.post(`/notices/${id}/read`)).data;
const getReadReceipts = async id => (await api.get(`/notices/${id}/reads`)).data;
const getUnreadCount = async () => (await api.get('/notices/unread-count')).data.unreadCount;
const getSaved = async () => (await api.get('/notices/saved')).data;
const save = async id => (await api.post(`/notices/${id}/save`)).data;
const unsave = async id => (await api.delete(`/notices/${id}/save`)).data;
const getUpcomingEvents = async () => (await api.get('/notices/events/upcoming')).data;
export default {
  getAll, getById, getPdf, create, update, remove, markAsRead,
  getReadReceipts, getUnreadCount, getSaved, save, unsave, getUpcomingEvents
};
