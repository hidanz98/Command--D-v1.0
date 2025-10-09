// Suppress development warnings
if (process.env.NODE_ENV === 'development') {
  // Suppress React 18 StrictMode warnings in development
  const originalError = console.error;
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillMount'))
    ) {
      return;
    }
    originalError.apply(console, args);
  };
}
