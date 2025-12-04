import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Modal } from 'antd';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.table);

// Register Service Worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        // Listen for updates to the service worker
        registration.addEventListener?.('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              // If there's an existing controller, a new version is available
              if (navigator.serviceWorker.controller) {
                Modal.confirm({
                  title: '发现新版本',
                  content: '有更新可用，是否立即刷新以应用新版本？',
                  okText: '刷新',
                  cancelText: '稍后',
                  onOk: () => window.location.reload(),
                });
              }
            }
          });
        });
      })
      .catch((err) => console.error('SW registration failed:', err));
  });
}
