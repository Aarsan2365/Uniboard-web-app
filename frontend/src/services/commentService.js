// services/commentService.js
import api from './api';

const getForNotice = async (noticeId) => {
  const { data } = await api.get(`/notices/${noticeId}/comments`);
  return data;
};

const create = async (noticeId, body) => {
  const { data } = await api.post(`/notices/${noticeId}/comments`, { body });
  return data;
};

const remove = async (commentId) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data;
};

export default { getForNotice, create, remove };
