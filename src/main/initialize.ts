/*
 * Copyright (c) 2021 Kiyozz.
 *
 * All rights reserved.
 */

import { registerContextMenu } from './context-menu.register'
import { CheckInstallationHandler } from './event-handlers/check-installation.handler'
import { ClipboardCopyHandler } from './event-handlers/clipboard-copy.handler'
import { ConfigGetHandler } from './event-handlers/config-get.handler'
import { ConfigUpdateHandler } from './event-handlers/config-update.handler'
import { DialogHandler } from './event-handlers/dialog.handler'
import { FileStatHandler } from './event-handlers/file-stat.handler'
import { GetVersionHandler } from './event-handlers/get-version.handler'
import { InAppErrorHandler } from './event-handlers/in-app-error.handler'
import { IsProductionHandler } from './event-handlers/is-production.handler'
import { OpenFileHandler } from './event-handlers/open-file.handler'
import { RecentFilesClearHandler } from './event-handlers/recent-files-clear.handler'
import { RecentFilesGetHandler } from './event-handlers/recent-files-get.handler'
import { RecentFilesRemoveHandler } from './event-handlers/recent-files-remove.handler'
import { RecentFilesSetHandler } from './event-handlers/recent-files-set.handler'
import { ScriptCompileEvent } from './event-handlers/script-compile.event'
import { TelemetryActiveHandler } from './event-handlers/telemetry-active.handler'
import { TelemetryHandler } from './event-handlers/telemetry.handler'
import { Event } from './interfaces/event'
import { EventHandler } from './interfaces/event-handler'
import { EventSync } from './interfaces/event-sync'
import { ipcMain } from './ipc'
import { IpcEvent } from './ipc-event'
import { registerIpcEvents } from './ipc-events.register'
import { Logger } from './logger'
import { registerMenu } from './menu.register'
import { ensureFiles, move, writeFile } from './path/path'
import { settingsStore } from './store/settings/store'
import { Telemetry } from './telemetry/telemetry'
import './translations/index'

const logger = new Logger('Initialize')

/**
 * Rename the current log file to have previous session log file
 */
async function backupLogFile() {
  const logFile = logger.file.path

  if (!logFile) {
    logger.info('there is no log file')

    return
  }

  await ensureFiles([logFile])

  const logFilename = logFile.replace('.log', '')

  await move(logFile, `${logFilename}.1.log`)
  await writeFile(logFile, '', { encoding: 'utf8' })

  logger.info(`file ${logFilename}.1.log created`)
}

export async function initialize(win: Electron.BrowserWindow): Promise<void> {
  await backupLogFile()

  const telemetryActive = settingsStore.get('telemetry.active') as boolean
  const telemetry = new Telemetry(
    telemetryActive,
    process.env.ELECTRON_TELEMETRY_API ?? '',
    process.env.ELECTRON_TELEMETRY_API_KEY ?? '',
    true,
  )

  ipcMain.on(IpcEvent.online, (_, args: { online: boolean }) => {
    logger.info(
      'network status changes.',
      `Internet is ${args.online ? 'online' : 'offline'}`,
    )
    telemetry.setOnline(args.online)
  })

  const openFileHandler = new OpenFileHandler()
  const handlers = new Map<string, EventHandler>([
    [IpcEvent.openDialog, new DialogHandler()],
    [IpcEvent.checkInstallation, new CheckInstallationHandler()],
    [IpcEvent.configUpdate, new ConfigUpdateHandler()],
    [IpcEvent.configGet, new ConfigGetHandler()],
    [IpcEvent.filesStats, new FileStatHandler()],
    [IpcEvent.getVersion, new GetVersionHandler()],
    [IpcEvent.appError, new InAppErrorHandler(telemetry)],
    [IpcEvent.isProduction, new IsProductionHandler()],
    [IpcEvent.clipboardCopy, new ClipboardCopyHandler()],
    [IpcEvent.telemetry, new TelemetryHandler(telemetry)],
    [IpcEvent.telemetryActive, new TelemetryActiveHandler(telemetry)],
    [IpcEvent.recentFilesGet, new RecentFilesGetHandler()],
    [IpcEvent.recentFilesSet, new RecentFilesSetHandler()],
    [IpcEvent.recentFilesClear, new RecentFilesClearHandler()],
    [IpcEvent.recentFileRemove, new RecentFilesRemoveHandler()],
  ])

  const events = new Map<string, Event>([
    [IpcEvent.compileScriptStart, new ScriptCompileEvent()],
  ])

  const syncs = new Map<string, EventSync>([])

  logger.debug(settingsStore.path)
  await registerMenu({
    win,
    openLogFile: (file: string) => {
      openFileHandler.listen(file)
    },
  })
  registerIpcEvents(handlers, events, syncs)
  await registerContextMenu(win)
}
