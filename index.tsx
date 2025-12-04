import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// FIX: Prevent the "Unsaved changes" dialog from triggering when the preview reloads.
// This tells the browser to ignore the unload event for this iframe.
window.onbeforeunload = null;
window.addEventListener('beforeunload', (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  return undefined;
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);