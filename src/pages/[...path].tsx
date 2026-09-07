import type { ParsedUrlQuery } from 'querystring'
import Link from 'next/link'
import { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Breadcrumb: FC<{ query?: ParsedUrlQuery }> = ({ query }) => {
  // 從 query 中取得 path 陣列
  const rawPath = query?.path
  const segments = Array.isArray(rawPath) ? rawPath : typeof rawPath === 'string' ? [rawPath] : []

  // 關鍵防護邏輯：
  // 長度 <= 1 代表在全站根目錄 (0) 或小孩專屬首頁 (1，如 Katherine 林品妤)，強制不顯示返回鍵！
  // 長度 >= 2 代表進入子活動資料夾或照片預覽，顯示返回鍵。
  const canGoBack = segments.length > 1

  // 目前開啟的資料夾或檔案名稱
  const currentTitle = segments.length > 0 ? segments[segments.length - 1] : ''

  // 計算上一層目錄的路徑（去掉最後一個項目）
  const parentPath = '/' + segments.slice(0, -1).map(s => encodeURIComponent(s)).join('/')

  return (
    <div className="flex items-center space-x-2 truncate">
      {/* 只有在第 2 層（含）以上才顯示「返回」按鈕 */}
      {canGoBack && (
        <Link
          href={parentPath}
          className="flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          title="返回上一層"
        >
          <FontAwesomeIcon icon="chevron-left" className="h-3 w-3" />
          <span>返回</span>
        </Link>
      )}

      {/* 頂端即時顯示目前所在的資料夾名稱 */}
      {currentTitle && (
        <div className="flex items-center space-x-1.5 truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
          <FontAwesomeIcon icon={['far', 'folder-open']} className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <span className="truncate">{currentTitle}</span>
        </div>
      )}
    </div>
  )
}

export default Breadcrumb
