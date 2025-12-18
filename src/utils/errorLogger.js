export function logError(error, context) {
  // Send error to a logging service, or log to console
  console.error(`[${context}]`, error);
}
