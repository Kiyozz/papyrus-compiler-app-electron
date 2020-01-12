import { Injectable } from '@nestjs/common'
import { Handler } from '../decorators'
import { CompileScriptException } from '../exceptions'
import { GameHelper } from '../helpers/game.helper'
import { PathHelper } from '../helpers/path.helper'
import { ScriptCompilerService } from '../services/script-compiler.service'
import { ConfigService } from '../services/config.service'
import { LogService } from '../services/log.service'
import { Mo2Service } from '../services/mo2.service'
import { PapyrusCompilerService } from '../services/papyrus-compiler.service'
import { ShellService } from '../services/shell.service'
import { GameType } from '../types/game.type'
import { HandlerInterface } from '../types/handler.interface'

interface CompileScriptParameters {
  script: string
  output: string
  gamePath: string
  game: GameType
  mo2Instance: string
  mo2SourcesFolders: string[]
}

@Injectable()
@Handler('compile-script')
export class CompileScriptHandler implements HandlerInterface<CompileScriptParameters> {
  constructor(
    private readonly gameHelper: GameHelper,
    private readonly pathHelper: PathHelper,
    private readonly shellService: ShellService,
    private readonly papyrusCompilerService: PapyrusCompilerService,
    private readonly mo2Service: Mo2Service,
    private readonly logService: LogService
  ) {}

  async listen(event: Electron.IpcMainEvent, { script, game, gamePath, mo2SourcesFolders, mo2Instance }: CompileScriptParameters) {
    const configService = ConfigService.create(this.pathHelper, this.gameHelper, { game, gamePath, mo2SourcesFolders, mo2InstanceFolder: mo2Instance })
    const compileService = new ScriptCompilerService(
      configService,
      this.gameHelper,
      this.pathHelper,
      this.shellService,
      this.papyrusCompilerService,
      this.mo2Service,
      this.logService
    )

    this.logService.info('Started compilation for script:', script)

    try {
      const result = await compileService.compile(script)
      const isSuccess = /0 failed/.test(result)

      this.logService.log('Compilation result\n\n', result, '\n')
      this.logService.log('Compilation is success', isSuccess)

      if (isSuccess) {
        this.logService.info(`Script ${script} successfully compiled.`)

        return result
      } else {
        this.throwError(script, { stderr: result })
      }
    } catch (err) {
      if (!(err instanceof CompileScriptException)) {
        this.logService.debug(err)
      }

      this.throwError(script, { stderr: err.message })
    }
  }

  private throwError(script: string, result: { stderr: string }) {
    throw new CompileScriptException(script, result.stderr)
  }
}
