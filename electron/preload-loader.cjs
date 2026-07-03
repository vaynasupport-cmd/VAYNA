// CommonJS preload — exposes file system helpers and IPC listeners.
// All database operations are handled directly via Supabase in the renderer.
const { contextBridge, ipcRenderer } = require('electron');

console.log('[PRELOAD] Starting minimal preload (Supabase mode)...');

try {
  // Global callback store for new trades (single listener pattern)
  let tradeCallbacks = [];
  let updateCallbacks = [];
  
  // Set up the single listener immediately
  ipcRenderer.on('new-trade', (_, trade) => {
    console.log('[IPC] new-trade received:', trade);
    tradeCallbacks.forEach(callback => callback(trade));
  });

  ipcRenderer.on('update-trade', (_, data) => {
    console.log('[IPC] update-trade received:', data);
    updateCallbacks.forEach(callback => callback(data));
  });

  const api = {
    // Window Controls
    windowControls: {
      minimize: () => ipcRenderer.invoke('window:minimize'),
      maximize: () => ipcRenderer.invoke('window:maximize'),
      close: () => ipcRenderer.invoke('window:close'),
      isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
      onMaximizeChange: (callback) => {
        const listener = (_, isMaximized) => callback(isMaximized);
        ipcRenderer.on('window:maximize-change', listener);
        return () => ipcRenderer.removeListener('window:maximize-change', listener);
      },
    },

    // File System — kept for CSV export and image selection
    fs: {
      selectImage: () => {
        console.log('[IPC] fs.selectImage');
        return ipcRenderer.invoke('fs:selectImage');
      },
      saveCSV: (data, defaultName) => {
        console.log('[IPC] fs.saveCSV');
        return ipcRenderer.invoke('fs:saveCSV', data, defaultName);
      },
    },

    // Deep link callback — receive Supabase auth redirect URLs
    onDeepLink: (callback) => {
      const listener = (_, url) => callback(url);
      ipcRenderer.on('deep-link', listener);
      return () => ipcRenderer.removeListener('deep-link', listener);
    },

    // MT Auto-Import — register callbacks (single global listener)
    onNewTrade: (callback) => {
      // Add callback to the list
      tradeCallbacks.push(callback);
      console.log(`[PRELOAD] Registered new-trade callback (total: ${tradeCallbacks.length})`);
      
      // Return unsubscribe function
      return () => {
        tradeCallbacks = tradeCallbacks.filter(cb => cb !== callback);
        console.log(`[PRELOAD] Unregistered new-trade callback (total: ${tradeCallbacks.length})`);
      };
    },
    
    // MT Auto-Import Update
    onUpdateTrade: (callback) => {
      updateCallbacks.push(callback);
      return () => {
        updateCallbacks = updateCallbacks.filter(cb => cb !== callback);
      };
    },
  };

  contextBridge.exposeInMainWorld('electronAPI', api);
  console.log('[PRELOAD] ✅ Minimal electronAPI exposed (fs + MT auto-import)');
} catch (error) {
  console.error('[PRELOAD] ❌ CRITICAL ERROR:', error);
}
