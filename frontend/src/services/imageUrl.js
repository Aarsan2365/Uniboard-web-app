// Relative paths use the same origin/proxy as the API. External hosting can
// supply VITE_API_ORIGIN, or the origin part of an absolute VITE_API_URL.
export const resolveImageUrl = value => {
  if (!value) return '';
  const origin = import.meta.env.VITE_API_ORIGIN || (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
  return value.startsWith('/') ? `${origin}${value}` : value;
};
