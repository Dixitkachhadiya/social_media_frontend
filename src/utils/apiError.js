// Normalizes Axios errors from the backend's { success:false, message, errors? } shape

const STATUS_FALLBACKS = {
  400: 'Some of the information you entered is invalid.',
  401: 'Please log in to continue.',
  403: "You don't have permission to do that.",
  404: 'We could not find what you were looking for.',
  409: 'That conflicts with existing data.',
  413: 'That request is too large.',
  429: 'Too many requests. Please slow down and try again shortly.',
  502: 'An external service failed to respond correctly. Please try again.',
  503: 'The service is temporarily unavailable.',
  504: 'The request timed out. Please try again.',
};

export const parseApiError = (error) => {
  if (!error?.isAxiosError && !error?.response) {
    return { status: 0, message: error?.message || 'Something went wrong.', fieldErrors: {}, retryAfter: null };
  }

  if (!error.response) {
    return {
      status: 0,
      message: 'Cannot reach the server. Check your connection and that the backend is running.',
      fieldErrors: {},
      retryAfter: null,
    };
  }

  const { status, data, headers } = error.response;
  const fieldErrors = {};
  for (const item of data?.errors ?? []) {
    if (item?.field && !fieldErrors[item.field]) fieldErrors[item.field] = item.message;
  }

  const retryHeader = Number(headers?.['retry-after']);

  return {
    status,
    message: data?.message || STATUS_FALLBACKS[status] || 'Something went wrong. Please try again.',
    fieldErrors,
    retryAfter: Number.isFinite(retryHeader) && retryHeader > 0 ? retryHeader : null,
  };
};

// Short message for toasts, including the wait time for rate limits
export const errorMessage = (error) => {
  const { message, retryAfter, status } = parseApiError(error);
  if (status === 429 && retryAfter && !/\d+\s*second/i.test(message)) {
    return `${message} Try again in ${retryAfter}s.`;
  }
  return message;
};
