const sanitizeValue = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (!value || typeof value !== 'object') return value;

  return Object.entries(value).reduce((safe, [key, child]) => {
    if (!key.startsWith('$') && !key.includes('.')) safe[key] = sanitizeValue(child);
    return safe;
  }, {});
};

export const sanitizeRequest = (req, _res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
};

