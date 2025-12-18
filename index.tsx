
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './hooks/useTheme';

const getBasename = () => {
  // This is the most robust method. The script's `src` attribute, when read
  // from the DOM, is a fully resolved URL. We can parse it to find the
  // directory it's running from, which serves as the router's basename.
  const mainScript = document.getElementById('main-script') as HTMLScriptElement | null;
  
  if (!mainScript || !mainScript.src) {
    console.error('Fatal: Could not find main script tag with id="main-script" or its src attribute is empty. Routing will likely fail.');
    // Fallback to root, though it's unlikely to work in the preview environment.
    return '/';
  }

  try {
    // Example src: https://...goog/a701c7ee-.../index.js
    const scriptUrl = new URL(mainScript.src);
    // Example pathname: /a701c7ee-.../index.js
    const scriptPathname = scriptUrl.pathname;
    
    // Find the last slash to remove the filename (e.g., index.js)
    const lastSlashIndex = scriptPathname.lastIndexOf('/');
    
    if (lastSlashIndex > 0) {
      // Substring from the start to the last slash.
      // e.g., /a701c7ee-...
      const basename = scriptPathname.substring(0, lastSlashIndex);
      return basename;
    } else if (lastSlashIndex === 0) {
        // This means the script is at the root, e.g., /index.js.
        // The basename is just '/', which is the default for BrowserRouter.
        return '/';
    }

  } catch (e) {
    console.error("Error parsing main script URL. Routing may be incorrect.", e);
  }

  // Final fallback if parsing fails for some unpredictable reason.
  console.warn("Could not determine basename from script src, falling back to '/'.");
  return '/';
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
