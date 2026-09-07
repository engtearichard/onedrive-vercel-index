import type { OdFileObject } from '../../types'

import { FC } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'

import { PreviewContainer, DownloadBtnContainer } from './Containers'
import { DownloadButton } from '../DownloadBtnGtoup'
import { getStoredToken } from '../../utils/protectedRouteHandler'

const ImagePreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)
  const { t } = useTranslation()

  const imageUrl = `/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  return (
    <>
      <PreviewContainer>
        {/* 外層加 flex 置中，img 加上 max-h-[60vh] 限制高度並保持比例 */}
        <div className="flex max-h-[60vh] w-full items-center justify-center overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="mx-auto max-h-[60vh] w-auto object-contain"
            src={imageUrl}
            alt={file.name}
            width={file.image?.width}
            height={file.image?.height}
          />
        </div>
      </PreviewContainer>

      {/* 只保留單一藍色下載按鈕 */}
      <DownloadBtnContainer>
        <div className="flex justify-center">
          <DownloadButton
            onClickCallback={() => window.open(imageUrl)}
            btnColor="blue"
            btnText={t('Download')}
            btnIcon="file-download"
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default ImagePreview
