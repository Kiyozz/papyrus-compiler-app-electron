import path from 'path'
import fs from 'fs-extra'
import fg from 'fast-glob'
import {
  FileWriteException,
  FileReadException,
  FileNotExistsException,
  FileEnsureException,
  FileAccessException
} from '../exceptions/files'
import { LogService } from '../services/log.service'

export class PathHelper {
  constructor(private readonly logService: LogService) {}

  toSlash(value: string): string {
    return value.replace(/\\/g, '/')
  }

  toAntiSlash(value: string): string {
    return value.replace(/\//g, '\\')
  }

  normalize(value: string): string {
    return value[0] + value.substring(1).toLowerCase()
  }

  join(...paths: string[]): string {
    return path.join(...paths)
  }

  basename(p: string, ext?: string) {
    this.logService.info('Getting basename of', p, 'with ext', ext)

    return path.basename(p, ext)
  }

  async stat(filename: string): Promise<fs.Stats> {
    this.logService.info('Getting statistics of the path', filename)

    try {
      return await fs.stat(filename)
    } catch (e) {
      throw new FileAccessException(filename)
    }
  }

  exists(fileOrFolder: string): Promise<boolean> {
    this.logService.info('Is the path exists?', fileOrFolder)

    return fs.pathExists(fileOrFolder)
  }

  async ensureDirs(dirs: string[]): Promise<void> {
    this.logService.debug(
      `Checking presence of director${dirs.length > 1 ? 'ies' : 'y'}`,
      ...dirs.map(dir => `"${dir}"`)
    )

    for (const dir of dirs) {
      try {
        await fs.ensureDir(dir)
      } catch (e) {
        throw new FileEnsureException(dir)
      }
    }
  }

  async readFile(filename: string): Promise<Buffer> {
    this.logService.debug('Reading file ', filename)

    const fileExists = await this.exists(filename)

    if (!fileExists) {
      throw new FileNotExistsException(filename)
    }

    try {
      return fs.readFile(filename)
    } catch (e) {
      throw new FileReadException(filename, e.message)
    }
  }

  async writeFile(filename: string, data: any): Promise<void> {
    this.logService.debug('Writing file', filename, 'with', data)

    const fileExists = await this.exists(filename)

    if (!fileExists) {
      throw new FileNotExistsException(filename)
    }

    try {
      return fs.writeFile(filename, data)
    } catch (e) {
      throw new FileWriteException(filename, e.message)
    }
  }

  async getPathsInFolder(fileNames: string[], options: fg.Options): Promise<string[]> {
    this.logService.info('Getting paths in folder', fileNames, 'with options', options)

    const response = await fg(
      fileNames.map(file => this.toSlash(file)),
      {
        caseSensitiveMatch: false,
        ...options
      }
    )

    this.logService.info('Response of fast-glob', response)

    return response
  }

  get separator() {
    return path.sep
  }
}
