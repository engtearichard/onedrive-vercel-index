import type { OdFolderChildren } from '../types'

import Link from 'next/link'
import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'next-i18next'

import { humanFileSize, formatModifiedDateTime } from '../utils/fileDetails'
import { Downloading, Checkbox, ChildIcon, ChildName } from './FileListing'
import { getStoredToken } from '../utils/protectedRouteHandler'

const FileListItem: FC<{ fileContent: OdFolderChildren }> = ({ fileContent: c }) => {
  return (
    <div className="grid cursor-pointer grid-cols-12 items-center space-x-2 px-3 py-2.5">
      {/* 檔案名稱：手機版佔滿可用寬度，桌機版佔 7 格 */}
      <div className="col-span-12 flex items-center space-x-2 truncate md:col-span-7" title={c.name}>
        <div className="w-5 flex-shrink-0 text-center">
          <ChildIcon child={c} />
        </div>
        <ChildName name={c.name} folder={Boolean(c.folder)} />
      </div>
      {/* 修改時間：手機隱藏，桌機佔 3 格 */}
      <div className="col-span-3 hidden flex-shrink-0 font-mono text-sm text-gray-700 dark:text-gray-500 md:block">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
      {/* 檔案大小：手機隱藏，桌機佔 2 格 */}
      <div className="col-span-2 hidden flex-shrink-0 truncate font-mono text-sm text-gray-700 dark:text-gray-500 md:block">
        {humanFileSize(c.size)}
      </div>
    </div>
  )
}

const FolderListLayout = ({
  path,
  folderChildren,
  selected,
  toggleItemSelected,
  totalSelected,
  toggleTotalSelected,
  totalGenerating,
  handleSelectedDownload,
  folderGenerating,
  handleFolderDownload,
  toast,
}) => {
  const hashedToken = getStoredToken(path)
  const { t } = useTranslation()

  // Get item path from item name
  const getItemPath = (name: string) => `${path === '/' ? '' : path}/${encodeURIComponent(name)}`

  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between border-b border-gray-900/10 px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:border-gray-500/30 dark:text-gray-400">
        <div className="flex flex-1 items-center space-x-2">
          <span className="md:w-7/12">{t('Name')}</span>
          <span className="hidden md:block md:w-3/12">{t('Last Modified')}</span>
          <span className="hidden md:block md:w-2/12">{t('Size')}</span>
        </div>

        {/* 頂部全選與批次下載 */}
        <div className="flex flex-shrink-0 items-center space-x-2 text-gray-700 dark:text-gray-300">
          <label className="flex cursor-pointer items-center space-x-1 rounded px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Checkbox
              checked={totalSelected}
              onChange={toggleTotalSelected}
              indeterminate={true}
              title={t('Select all files')}
            />
            <span className="text-xs font-normal normal-case">{t('全選')}</span>
          </label>

          {totalGenerating ? (
            <Downloading title={t('Downloading selected files, refresh page to cancel')} style="px-1.5 py-1" />
          ) : (
            <button
              title={t('Download selected files')}
              className="flex cursor-pointer items-center space-x-1 rounded px-1.5 py-1 font-semibold normal-case text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-40 disabled:hover:bg-transparent dark:text-blue-400 dark:hover:bg-gray-800"
              disabled={totalSelected === 0}
              onClick={handleSelectedDownload}
            >
              <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
              <span className="text-xs">{t('下載')}</span>
            </button>
          )}
        </div>
      </div>

      {folderChildren.map((c: OdFolderChildren) => (
        <div
          className="flex items-center justify-between transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
          key={c.id}
        >
          {/* 左側檔案資訊（點擊跳轉） */}
          <Link
            href={`${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`}
            passHref
            className="min-w-0 flex-1"
          >
            <FileListItem fileContent={c} />
          </Link>

          {/* 右側操作按鈕群：拔除 hidden，手機與電腦隨時保持顯示 */}
          <div className="flex flex-shrink-0 items-center space-x-1 pr-3 text-gray-700 dark:text-gray-400">
            {/* 單檔/資料夾直接下載按鈕 */}
            <div>
              {c.folder ? (
                folderGenerating[c.id] ? (
                  <Downloading title={t('Downloading folder, refresh page to cancel')} style="px-1.5 py-1" />
                ) : (
                  <span
                    title={t('Download folder')}
                    className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={() => {
                      const p = `${path === '/' ? '' : path}/${encodeURIComponent(c.name)}`
                      handleFolderDownload(p, c.id, c.name)()
                    }}
                  >
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                  </span>
                )
              ) : (
                <a
                  title={t('Download file')}
                  className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                  href={`/api/raw/?path=${getItemPath(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`}
                >
                  <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                </a>
              )}
            </div>

            {/* 單選勾選框 */}
            <div>
              {!c.folder && !(c.name === '.password') && (
                <Checkbox
                  checked={selected[c.id] ? 2 : 0}
                  onChange={() => toggleItemSelected(c.id)}
                  title={t('Select file')}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default FolderListLayout
