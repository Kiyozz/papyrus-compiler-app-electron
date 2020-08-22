import uniqBy from 'lodash-es/uniqBy'
import { ScriptModel } from '../../models'

export default function uniqScripts(scripts: ScriptModel[]): ScriptModel[] {
  return uniqBy(scripts, 'name')
}
