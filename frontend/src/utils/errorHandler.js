export function getErrorMessage(error) {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please log in again.';
      case 403:
        return 'You don\'t have permission to do this.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please wait a moment.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.error || 'An error occurred. Please try again.';
    }
  } else if (error.request) {
    return 'No response from server. Check your connection.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
}
