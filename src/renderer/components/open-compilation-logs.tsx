/*
 * Copyright (c) 2020 Kiyozz.
 *
 * All rights reserved.
 */

import ErrorIcon from '@material-ui/icons/Error'

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { ScriptInterface } from '../interfaces'
import actions from '../redux/actions'
import { useAction, useStoreSelector } from '../redux/use-store-selector'
import { Dialog } from './dialog'
import { usePageContext } from './page-context'

export function LogsListItem({
  script,
  logs
}: {
  script: ScriptInterface
  logs: string
}) {
  const { copyToClipboard } = usePageContext()
  const onClickCopyLogs = useCallback(() => {
    copyToClipboard(`${script.name}\n\n${logs}\n`)
  }, [copyToClipboard, logs, script.name])

  return (
    <div>
      <div className="flex items-center justify-between bg-darker gap-4 pb-2 sticky top-0">
        <h3 className="select-all">{script.name}</h3>
        <button className="btn" onClick={onClickCopyLogs}>
          Copy
        </button>
      </div>
      <code className="p-4 bg-gray-700 block w-full rounded">
        {logs.split('\n').map((log, i) => (
          <span className="font-mono text-xs break-words" key={i}>
            {log} <br />
          </span>
        ))}
      </code>
    </div>
  )
}

export function OpenCompilationLogs() {
  const { t } = useTranslation()
  const isDrawerExpand = useStoreSelector(
    state => state.settings.isDrawerExpand
  )
  const logs = useStoreSelector(state => state.compilationLogs.logs)
  const popupOpen = useStoreSelector(state => state.compilationLogs.popupOpen)
  const popupToggle = useAction(actions.compilationPage.logs.popupToggle)

  const onClickButtonOpenLogs = useCallback(() => {
    popupToggle(true)
  }, [popupToggle])

  const onClickButtonCloseLogs = useCallback(() => {
    popupToggle(false)
  }, [popupToggle])

  return (
    <>
      <li
        onClick={onClickButtonOpenLogs}
        className="w-full px-4 py-2 flex hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <ErrorIcon />
        {isDrawerExpand && <div className="ml-6">{t('common.logs.nav')}</div>}
      </li>

      <Dialog
        open={popupOpen}
        onClose={onClickButtonCloseLogs}
        maxWidth={80}
        fullWidth
        actions={
          <button className="btn" onClick={onClickButtonCloseLogs}>
            {t('common.logs.close')}
          </button>
        }
        title={<h1 className="select-none">{t('common.logs.title')}</h1>}
      >
        <div className="flex flex-col gap-4">
          {logs.length > 0 ? (
            logs.map(([script, scriptLogs], index) => (
              <LogsListItem key={index} script={script} logs={scriptLogs} />
            ))
          ) : (
            <span className="select-none">{t('common.logs.noLogs')}</span>
          )}
        </div>
      </Dialog>
    </>
  )
}
