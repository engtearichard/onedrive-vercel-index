import type { OdFileObject, OdFolderChildren, OdFolderObject } from '../../types'

import { FC, useEffect, useMemo } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import toast from 'react-hot-toast'

import { PreviewContainer, DownloadBtnContainer } from './Containers'
import { DownloadButton } from '../DownloadBtnGtoup'
import { getStoredToken } from '../../utils/protectedRouteHandler'
import { useProtectedSWRInfinite } from '../../utils/fetchWithSWR'
import { getPreviewType, preview } from '../../utils/getPreviewType'
import { getExtension } from '../../utils/getFileIcon'

const ImagePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const router = useRouter()
  const { asPath } = router
  const hashedToken = getStoredToken(asPath)
  const { t } = useTranslation()

  // 取得當前檔案所在的上層資料夾路徑
  const parentFolder = asPath.substring(0, asPath.lastIndexOf('/')) || '/'

  // 取得上層資料夾的所有檔案
  const { data } = useProtectedSWRInfinite(parentFolder)

  // 整理出同一資料夾中所有支援照片預覽的檔案清單
  const siblingImages = useMemo(() => {
    if (!data) return []
    const responses: any[] = [].concat(...data)
    if (!responses[0] || !('folder' in responses[0])) return []

    const children = ([].concat(...responses.map(r => r.folder.value)) as OdFolderObject['value']).sort((a, b) =>
      b.name.localeCompare(a.name)
    )

    return children.filter(
      (c: OdFolderChildren) => !c.folder && getPreviewType(getExtension(c.name)) === preview.image
    )
  }, [data])

  // 找出目前照片的索引位置、上一張與下一張
  const currentIndex = siblingImages.findIndex(img => img.name === file.name)
  const prevImage = currentIndex > 0 ? siblingImages[currentIndex - 1] : null
  const nextImage = currentIndex >= 0 && currentIndex < siblingImages.length - 1 ? siblingImages[currentIndex + 1] : null

  // 點擊切換路徑
  const navigateTo = (imageName: string) => {
    const nextPath = `${parentFolder === '/' ? '' : parentFolder}/${encodeURIComponent(imageName)}`
    router.push(nextPath)
  }

  // 支援鍵盤左右箭頭切換
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && prevImage) {
        navigateTo(prevImage.name)
      } else if (e.key === 'ArrowRight' && nextImage) {
        navigateTo(nextImage.name)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [prevImage, nextImage])

  const imageUrl = `/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  // 下載邏輯：帶 toast 提示與跨裝置安全觸發
  const handleDownload = () => {
    const toastId = toast.loading(t('準備下載中...'))
    const el = document.createElement('a')
    el.href = imageUrl
    el.target = '_blank'
    el.rel = 'noopener noreferrer'
    el.download = file.name
    document.body.appendChild(el)
    el.click()
    el.remove()
    setTimeout(() => {
      toast.success(t('已開始下載照片！'), { id: toastId })
    }, 800)
  }

  return (
    <>
      <PreviewContainer>
        <div className="relative flex max-h-[60vh] w-full items-center justify-center overflow-hidden">
          {/* 左側：上一張懸浮按鈕 */}
          {prevImage && (
            <button
              onClick={() => navigateTo(prevImage.name)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-black/70 focus:outline-none"
              title={t('Previous')}
            >
              <FontAwesomeIcon icon="chevron-left" className="h-5 w-5" />
            </button>
          )}

          {/* 照片本體 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mx-auto max-h-[60vh] w-auto object-contain"
            src={imageUrl}
            alt={file.name}
            width={file.image?.width}
            height={file.image?.height}
          />

          {/* 右側：下一張懸浮按鈕 */}
          {nextImage && (
            <button
              onClick={() => navigateTo(nextImage.name)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 p-2.5 text-white transition hover:bg-black/70 focus:outline-none"
              title={t('Next')}
            >
              <FontAwesomeIcon icon="chevron-right" className="h-5 w-5" />
            </button>
          )}
        </div>
      </PreviewContainer>

      {/* 底部功能群 */}
      <DownloadBtnContainer>
        <div className="flex items-center justify-center space-x-3">
          <button
            onClick={() => prevImage && navigateTo(prevImage.name)}
            disabled={!prevImage}
            className="flex items-center space-x-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FontAwesomeIcon icon="chevron-left" className="h-3 w-3" />
            <span>{t('上一張')}</span>
          </button>

          <DownloadButton
            onClickCallback={handleDownload}
            btnColor="blue"
            btnText={t('Download')}
            btnIcon="file-download"
          />

          <button
            onClick={() => nextImage && navigateTo(nextImage.name)}
            disabled={!nextImage}
            className="flex items-center space-x-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>{t('下一張')}</span>
            <FontAwesomeIcon icon="chevron-right" className="h-3 w-3" />
          </button>
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default ImagePreview
