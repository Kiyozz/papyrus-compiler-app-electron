/*
 * Copyright (c) 2021 Kiyozz.
 *
 * All rights reserved.
 */

import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import ErrorIcon from '@material-ui/icons/Error'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder'
import React from 'react'
import { ScriptStatus } from '../../enums/script-status.enum'
import { ScriptInterface } from '../../interfaces'

export default function getIconFromStatus(
  script: ScriptInterface
): JSX.Element {
  switch (script.status) {
    case ScriptStatus.IDLE:
      return <QueryBuilderIcon />
    case ScriptStatus.RUNNING:
      return <HourglassEmptyIcon />
    case ScriptStatus.SUCCESS:
      return <CheckCircleIcon />
    default:
      return <ErrorIcon />
  }
}
