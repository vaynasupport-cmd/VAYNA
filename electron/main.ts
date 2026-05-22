import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development'
const PROTOCOL = 'tradingjournal'

console.log('⚙️  Main process starting (Supabase mode)...')
console.log('🔧 isDev:', isDev)

// ─── Register deep link protocol (single instance) ───────────────────────────
if (!isDev) {
  const gotLock = app.requestSingleInstanceLock()
  if (!gotLock) {
    app.quit()
  } else {
    app.on('second-instance', (_event, commandLine) => {
      // Someone opened a deep link while the app is already running
      const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`))
      if (url && mainWindow) {
        mainWindow.webContents.send('deep-link', url)
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    })
  }
}

// Register custom protocol for Supabase auth redirects
app.setAsDefaultProtocolClient(PROTOCOL)

// ─── Create Window ────────────────────────────────────────────────────────────
function createWindow() {
  const preloadPath = path.resolve(__dirname, 'preload-loader.cjs')

  console.log('📦 Preload path:', preloadPath)
  console.log('📦 Preload exists:', existsSync(preloadPath))

  mainWindow = new BrowserWindow({
    width: 1600,
    height: 1000,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    icon: path.join(__dirname, '../build/icon.png'),
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  // Handle external links
}

// ─── App Events ───────────────────────────────────────────────────────────────
app.whenReady().then(async () => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// macOS: handle deep link opened from Finder
app.on('open-url', (_event, url) => {
  if (mainWindow) {
    mainWindow.webContents.send('deep-link', url)
  }
})

// ─── IPC Handlers (File System only) ─────────────────────────────────────────

ipcMain.handle('fs:selectImage', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
    ],
  })

  if (!result.canceled && result.filePaths.length > 0) {
    const fs = await import('fs')
    const filePath = result.filePaths[0]
    const buffer = fs.readFileSync(filePath)
    return {
      data: buffer.toString('base64'),
      name: path.basename(filePath),
    }
  }
  return null
})

ipcMain.handle('fs:saveCSV', async (_, data: string, defaultName: string) => {
  if (!mainWindow) return false
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
  })

  if (!result.canceled && result.filePath) {
    const fs = await import('fs')
    fs.writeFileSync(result.filePath, data, 'utf-8')
    return true
  }
  return false
})
