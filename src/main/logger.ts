/*
 * Copyright (c) 2021 Kiyozz.
 *
 * All rights reserved.
 */

import log, { LogFile, LogFunctions, Transports } from 'electron-log'
import { is } from 'electron-util'

const isDev = is.development
const isDebug = process.argv.includes('--debug')

if (!isDev && !isDebug) {
  log.transports.console.level = false
}

export class Logger {
  private logger: LogFunctions
  catchErrors = log.catchErrors

  constructor(namespace: string) {
    this.logger = log.scope(namespace)
  }

  get transports(): Transports {
    return log.transports
  }

  get file(): LogFile {
    return this.transports.file.getFile()
  }

  get previousSessionFilePath(): string {
    return this.file.path.replace('.log', '.1.log')
  }

  debug(...params: unknown[]): void {
    if (this.isDebugEnabled()) {
      this.logger.debug(...params)
    }
  }

  info(...params: unknown[]): void {
    this.logger.info(...params)
  }

  error(...params: unknown[]): void {
    this.logger.error(...params)
  }

  warn(...params: unknown[]): void {
    this.logger.warn(...params)
  }

  isDebugEnabled(): boolean {
    return is.development || isDebug
  }
}
