import Link from 'next/link'
import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Breadcrumb = () => {
  const router = useRouter()

  // 安全解碼路徑，避免 URI malformed 報錯
  let rawPath = router.asPath.split('?')[0] || ''
  try {
    rawPath = decodeURIComponent(rawPath)
  } catch (e) {
    // 若解碼失敗則退回原始字串
  }

  // 將路徑切分：以 Katherine 為例
  // 網址：/Katherine 林品妤 -> segments: ['Katherine 林品妤'] (長度 1)
  // 網址：/Katherine 林品妤/K班_0831-0904 -> segments: ['Katherine 林品妤', 'K班_0831-0904'] (長度 2)
  const segments = rawPath.split('/').filter(s => s.trim().length > 0)

  // 關鍵防護判斷：
  // 長度 <= 1 代表在「全站首頁」或「小孩專屬首頁」，絕對不顯示返回按鈕！
  // 長度 >= 2 代表進入活動資料夾或照片預覽，顯示返回鍵。
  const canGoBack = segments.length > 1

  // 取得當前資料夾或檔案標題
  const currentTitle = segments.length > 0 ? segments[segments.length - 1] : ''

  // 計算上一層目錄路徑
  const parentPath = '/' + segments.slice(0, -1).map(s => encodeURIComponent(s)).join('/')

  return (
    <div className="flex items-center space-x-3 py-1">
      {/* 只有在第二層（包含）以上，才顯示返回按鈕 */}
      {canGoBack && (
        <Link
          href={parentPath}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100 hover:text-black dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          <FontAwesomeIcon icon="chevron-left" className="h-3 w-3" />
          <span>返回</span>
        </Link>
      )}

      {/* 顯示目前所在資料夾名稱 */}
      {currentTitle && (
        <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 dark:text-gray-200 md:text-sm">
          <FontAwesomeIcon icon={['far', 'folder-open']} className="h-4 w-4 text-amber-500" />
          <span className="max-w-[200px] truncate sm:max-w-xs md:max-w-md">
            {currentTitle}
          </span>
        </div>
      )}
    </div>
  )
}

export default Breadcrumb
