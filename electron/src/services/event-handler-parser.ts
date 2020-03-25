import 'reflect-metadata'
import { Inject, Injectable } from '@nestjs/common'
import { ELECTRON_IPC_EVENT } from '../decorators'
import { ipcMain } from 'electron'
import { HandlerInterface } from '../types/handler.interface'
import { LogService } from './log.service'

@Injectable()
export class EventHandlerParser {
  constructor(
    @Inject('HANDLERS') private eventHandlers: HandlerInterface[],
    private readonly logService: LogService
  ) {}

  register() {
    this.eventHandlers
      .forEach(eventHandler => {
        const { name } = Reflect.getMetadata(ELECTRON_IPC_EVENT, eventHandler.constructor)

        this.logService.info(`Registering ${name} event.`)

        ipcMain.on(name, async (event, args) => {
          this.logService.info(`Event ${name} in progress.`)

          try {
            const payload = await eventHandler.listen(event, args)

            this.logService.info(`Event ${name} succeeded.`)
            event.sender.send(`${name}-success`, payload)
          } catch (e) {
            this.logService.error(`Event ${name} failed.`)
            this.logService.error(`[${name}]`, e)

            event.sender.send(`${name}-error`, e.message)
          }
        })
      })
  }
}