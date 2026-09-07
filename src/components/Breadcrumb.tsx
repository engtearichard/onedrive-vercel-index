import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Breadcrumb = () => {
  const router = useRouter()
  // 排除 query 參數並解碼
  const asPath = decodeURIComponent(router.asPath.split('?')[0])

  // 將路徑以 '/' 切分，過濾掉前後空字串
  const pathSegments = asPath
    .split('/')
    .filter(segment => segment.trim().length > 0)

  // 關鍵防護判斷：
  // 0 層: 最上層根目錄 (/)
  // 1 層: 小孩專屬資料夾 (/Katherine 林品妤)
  // 當層級小於等於 1 時，強制隱藏返回鍵！
  const canGoBack = pathSegments.length > 1

  // 當前資料夾或檔案名稱
  const currentTitle = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : ''

  // 計算上一層的路徑
  const parentPath = '/' + pathSegments.slice(0, -1).map(s => encodeURIComponent(s)).join('/')

  return (
    <div className="flex items-center justify-between border-b border-gray-150 bg-white/50 px-4 py-2.5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/50">
      <div className="flex items-center space-x-3 truncate">
        {/* 只有在第 2 層（K班資料夾）或照片預覽時，才允許返回上一層 */}
        {canGoBack && (
          <Link
            href={parentPath}
            className="flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            title="返回上一層"
          >
            <FontAwesomeIcon icon="chevron-left" className="h-3 w-3" />
            <span>返回</span>
          </Link>
        )}

        {/* 頂端清楚顯示目前所在的資料夾名稱 */}
        <div className="flex items-center space-x-2 truncate">
          <FontAwesomeIcon icon={['far', 'folder-open']} className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
            {currentTitle || '學員影像目錄'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Breadcrumb
