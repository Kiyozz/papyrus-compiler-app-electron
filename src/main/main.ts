/*
 * Copyright (c) 2021 Kiyozz.
 *
 * All rights reserved.
 */

import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron'
import { debugInfo, is } from 'electron-util'
import { format, URL } from 'url'

import { initialize } from './initialize'
import { Logger } from './logger'
import { join } from './path/path'
import { unhandled } from './unhandled'

const logger = new Logger('Main')
let win: BrowserWindow | null = null

unhandled(() => {
  win?.close()
  win = null
})

async function createWindow() {
  logger.info(debugInfo())

  const windowOptions: BrowserWindowConstructorOptions = {
    width: 800,
    height: 820,
    minHeight: 600,
    minWidth: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      preload: join(__dirname, 'preload.js'),
    },
    show: false,
  }

  if (is.macos) {
    windowOptions.titleBarStyle = 'hidden'
  } else {
    windowOptions.frame = false
  }

  win = new BrowserWindow(windowOptions)

  const isDev = is.development

  if (isDev) {
    win.loadURL('http://localhost:9080')
  } else {
    const url = new URL(`file://${join(__dirname, 'index.html')}`)
    win.loadURL(format(url))
  }

  await initialize(win)

  win.on('closed', () => {
    win = null
  })

  win.on('ready-to-show', () => {
    logger.debug('the window is ready to show')

    win?.show()

    if (isDev) {
      win?.webContents.openDevTools({ mode: 'bottom' })
    }
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (!is.macos) {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null && app.isReady()) {
    createWindow()
  }
})
