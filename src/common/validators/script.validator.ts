import is from '@sindresorhus/is'
import { Script } from '@pca/common/interfaces/script.interface'

function hasValidValues(script: Script): boolean {
  return (
    is.nonEmptyString(script.name?.trim()) &&
    is.nonEmptyString(script.path?.trim())
  )
}

export function validateScript(script: Script | null | undefined): boolean {
  return !is.nullOrUndefined(script) && hasValidValues(script)
}