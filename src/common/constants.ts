import { is } from 'electron-util'

export const DEFAULT_COMPILER_PATH = `Papyrus Compiler${
  is.linux || is.macos ? '/' : '\\'
}PapyrusCompiler.exe`
export const GITHUB_LINK = 'http://github.com/Kiyozz/papyrus-compiler-app'
export const GITHUB_ISSUES_NEW = `${GITHUB_LINK}/issues/new`
