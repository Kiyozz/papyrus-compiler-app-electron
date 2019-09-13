import { AnyAction } from 'redux'
import * as CONSTANTS from '../actions/constants'
import { CompilationLogsModel, ScriptModel } from '../../models'

export interface CompilationLogsState {
  logs: CompilationLogsModel,
  popupOpen: boolean
}

const initialState: CompilationLogsState = {
  logs: [],
  popupOpen: false
}

export default function compilationLogsReducer(state = initialState, action: AnyAction): CompilationLogsState {
  switch (action.type) {
    case CONSTANTS.APP_COMPILATION_LOGS_POPUP_TOGGLE:
      return {
        ...state,
        popupOpen: action.payload || false
      }
    case CONSTANTS.APP_COMPILATION_START_COMPILATION:
      return {
        logs: [],
        popupOpen: false
      }
    case CONSTANTS.APP_COMPILATION_START_COMPILATION_SCRIPT_SUCCESS:
    case CONSTANTS.APP_COMPILATION_START_COMPILATION_SCRIPT_FAILED:
      const payload: [ScriptModel, string] = action.payload

      return {
        ...state,
        logs: [...state.logs, payload]
      }
    default:
      return state
  }
}