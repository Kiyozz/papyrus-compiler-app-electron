import type { AppStore, Config } from '@common'
import is from '@sindresorhus/is'
import { groupValidator } from './validators/groupValidator'

function checkMo2(appStore: AppStore, defaultConfig: Config) {
  const mo2 = appStore.get('mo2')
  const resetMo2Config = () => appStore.set('mo2', defaultConfig.mo2)

  if (is.nullOrUndefined(mo2) && !is.object(mo2)) {
    resetMo2Config()
  }

  if ((Object.keys(mo2) as (keyof Config['mo2'])[]).some(key => is.nullOrUndefined(mo2[key]))) {
    resetMo2Config()
  }

  if (!is.boolean(mo2.use)) {
    resetMo2Config()
  }

  if (!is.string(mo2.output) || is.emptyString(mo2.output.trim())) {
    resetMo2Config()
  }

  if (!is.string(mo2.mods) || is.emptyString(mo2.mods.trim())) {
    resetMo2Config()
  }

  if (is.null_(mo2.instance) || (is.string(mo2.instance) && is.emptyString(mo2.instance.trim()))) {
    resetMo2Config()
  }
}

function checkFlag(appStore: AppStore) {
  const flag = appStore.get('flag')

  if (flag !== 'TESV_Papyrus_Flags.flg') {
    console.warn('only TESV_Papyrus_Flags.flg flag is supported')

    appStore.set('flag', 'TESV_Papyrus_Flags.flg')
  }
}

function checkGroups(appStore: AppStore, defaultConfig: Config) {
  const groups = appStore.get('groups')

  if (!is.array(groups) || !groups.every(groupValidator)) {
    appStore.set('groups', defaultConfig.groups)
  }
}

function checkGameType(appStore: AppStore, defaultConfig: Config) {
  const gameType = appStore.get('gameType')
  const resetGameType = () => appStore.set('gameType', defaultConfig.gameType)

  if (!is.string(gameType)) {
    resetGameType()
  }

  if (gameType !== 'Skyrim Legendary Edition' && gameType !== 'Skyrim Special Edition') {
    resetGameType()
  }
}

function checkGamePath(appStore: AppStore) {
  const gamePath = appStore.get('gamePath')
  const resetGamePath = () => appStore.set('gamePath', '')

  if (!is.string(gamePath)) {
    resetGamePath()
  }

  if (is.emptyString(gamePath.trim())) {
    resetGamePath()
  }
}

function checkOutput(appStore: AppStore, defaultConfig: Config) {
  const output = appStore.get('output')

  if (!is.string(output) || is.emptyString(output.trim())) {
    appStore.set('output', defaultConfig.output)
  }
}

function checkCompilerPath(appStore: AppStore, defaultConfig: Config) {
  const compilerPath = appStore.get('compilerPath')
  const gamePath = appStore.get('gamePath')

  if (is.nullOrUndefined(compilerPath) || (is.string(compilerPath) && is.emptyString(compilerPath.trim()))) {
    if (is.emptyString(gamePath)) {
      appStore.set('compilerPath', defaultConfig.compilerPath)
    }
  }
}

function checkNotSupportedKeys(appStore: AppStore, defaultConfig: Config) {
  const supportedKeys = [...Object.keys(defaultConfig), '__internal__']

  Object.keys(appStore.store).forEach(key => {
    if (!supportedKeys.includes(key)) {
      appStore.delete(key as any)
    }
  })
}

export function storeCheck(appStore: AppStore, defaultConfig: Config) {
  checkMo2(appStore, defaultConfig)
  checkGameType(appStore, defaultConfig)
  checkGamePath(appStore)
  checkFlag(appStore)
  checkCompilerPath(appStore, defaultConfig)
  checkOutput(appStore, defaultConfig)
  checkGroups(appStore, defaultConfig)
  checkNotSupportedKeys(appStore, defaultConfig)
}