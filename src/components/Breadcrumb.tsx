import type { ParsedUrlQuery } from 'querystring'
import Link from 'next/link'
import { FC } from 'react'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Breadcrumb: FC<{ query?: ParsedUrlQuery }> = () => {
  const router = useRouter()

  // 1. 安全取得純路徑字串
  let asPath = router.asPath || ''
  asPath = asPath.split('?')[0].split('#')[0]

  // 2. 移除語系前綴 (例如 /en/ 或 /zh-CN/)
  if (router.locale && asPath.startsWith(`/${router.locale}`)) {
    asPath = asPath.substring(router.locale.length + 1)
  }

  // 3. 安全切分並解碼每個路徑節點
  const segments = asPath
    .split('/')
    .filter(s => s && s.trim().length > 0)
    .map(s => {
      try {
        return decodeURIComponent(s)
      } catch (e) {
        return s
      }
    })

  // 4. 關鍵安全層級判斷：
  // 0 層: 最上層 (/)
  // 1 層: 小朋友個人資料夾 (/Katherine 林品妤)
  // 小於等於 1 層時，絕對不顯示「返回」按鈕！
  const canGoBack = segments.length > 1

  // 目前開啟的資料夾或檔案名稱
  const currentTitle = segments.length > 0 ? segments[segments.length - 1] : ''

  // 計算安全返回上一層的路徑
  const parentSegments = segments.slice(0, -1)
  const parentPath = parentSegments.length === 0 ? '/' : '/' + parentSegments.map(s => encodeURIComponent(s)).join('/')

  return (
    <div className="flex items-center space-x-2 truncate">
      {/* 只有在第 2 層（活動資料夾）或照片預覽時，才顯示返回按鈕 */}
      {canGoBack && (
        <Link
          href={parentPath}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
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
