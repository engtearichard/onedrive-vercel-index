import type { OdFolderChildren } from '../types'

import Link from 'next/link'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'next-i18next'

import { formatModifiedDateTime } from '../utils/fileDetails'
import { Checkbox, ChildIcon, ChildName, Downloading } from './FileListing'
import { getStoredToken } from '../utils/protectedRouteHandler'

const GridItem = ({ c, path }: { c: OdFolderChildren; path: string }) => {
  const hashedToken = getStoredToken(path)
  const thumbnailUrl =
    'folder' in c ? null : `/api/thumbnail/?path=${path}&size=medium${hashedToken ? `&odpt=${hashedToken}` : ''}`

  const [brokenThumbnail, setBrokenThumbnail] = useState(false)

  return (
    <div className="space-y-2">
      <div className="h-32 overflow-hidden rounded border border-gray-900/10 dark:border-gray-500/30">
        {thumbnailUrl && !brokenThumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-full w-full object-cover object-top"
            src={thumbnailUrl}
            alt={c.name}
            onError={() => setBrokenThumbnail(true)}
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center rounded-lg">
            <ChildIcon child={c} />
            <span className="absolute bottom-0 right-0 m-1 font-medium text-gray-700 dark:text-gray-500">
              {c.folder?.childCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-center space-x-2">
        <span className="w-5 flex-shrink-0 text-center">
          <ChildIcon child={c} />
        </span>
        <ChildName name={c.name} folder={Boolean(c.folder)} />
      </div>
      <div className="truncate text-center font-mono text-xs text-gray-700 dark:text-gray-500">
        {formatModifiedDateTime(c.lastModifiedDateTime)}
      </div>
    </div>
  )
}

const FolderGridLayout = ({
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
  const { t } = useTranslation()

  const getItemPath = (name: string) => `${path === '/' ? '' : path}/${encodeURIComponent(name)}`

  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center justify-between border-b border-gray-900/10 px-3 py-1.5 text-xs font-medium text-gray-600 dark:border-gray-500/30 dark:text-gray-400">
        <div>{t('{{count}} item(s)', { count: folderChildren.length })}</div>

        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300">
          {/* 全選 */}
          <label className="flex cursor-pointer items-center space-x-1 rounded px-1.5 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Checkbox
              checked={totalSelected}
              onChange={toggleTotalSelected}
              indeterminate={true}
              title={t('Select all files')}
            />
            <span className="text-xs font-medium">{t('全選')}</span>
          </label>

          {/* 只有在選取至少 1 個項目時，才高亮顯示下載按鈕 */}
          {totalGenerating ? (
            <Downloading title={t('Downloading selected files, refresh page to cancel')} style="px-1.5 py-1" />
          ) : (
            <button
              title={t('Download selected files')}
              className="flex cursor-pointer items-center space-x-1 rounded px-1.5 py-1 font-semibold text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:opacity-40 disabled:hover:bg-transparent dark:text-blue-400 dark:hover:bg-gray-800"
              disabled={totalSelected === 0}
              onClick={handleSelectedDownload}
            >
              <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
              <span className="text-xs">{t('下載')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4">
        {folderChildren.map((c: OdFolderChildren) => (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
          >
            {/* 若為資料夾，保留整包下載按鈕；若是單一檔案，則完全不放個別下載鍵 */}
            {c.folder && (
              <div className="absolute top-0 right-0 z-10 m-1 rounded bg-white/70 py-0.5 opacity-90 transition-all group-hover:opacity-100 dark:bg-gray-900/70">
                {folderGenerating[c.id] ? (
                  <Downloading title={t('Downloading folder, refresh page to cancel')} style="px-1.5 py-1" />
                ) : (
                  <span
                    title={t('Download folder')}
                    className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={handleFolderDownload(getItemPath(c.name), c.id, c.name)}
                  >
                    <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
                  </span>
                )}
              </div>
            )}

            {/* 左上方多選勾選框 */}
            <div
              className={`${
                selected[c.id] ? 'opacity-100' : 'opacity-80 md:opacity-0'
              } absolute top-0 left-0 z-10 m-1 rounded bg-white/70 py-0.5 group-hover:opacity-100 dark:bg-gray-900/70`}
            >
              {!c.folder && !(c.name === '.password') && (
                <Checkbox
                  checked={selected[c.id] ? 2 : 0}
                  onChange={() => toggleItemSelected(c.id)}
                  title={t('Select file')}
                />
              )}
            </div>

            <Link href={getItemPath(c.name)} passHref>
              <GridItem c={c} path={getItemPath(c.name)} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FolderGridLayout
