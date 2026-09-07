import type { OdFileObject } from '../../types'

import { FC, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import toast from 'react-hot-toast'

import axios from 'axios'
import dynamic from 'next/dynamic'
const Plyr = dynamic(() => import('plyr-react'), { ssr: false })
import { useAsync } from 'react-async-hook'

import { getExtension } from '../../utils/getFileIcon'
import { getStoredToken } from '../../utils/protectedRouteHandler'

import { DownloadButton } from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import FourOhFour from '../FourOhFour'
import Loading from '../Loading'

import 'plyr-react/plyr.css'

const VideoPlayer: FC<{
  videoName: string
  videoUrl: string
  width?: number
  height?: number
  thumbnail: string
  subtitle: string
  isFlv: boolean
  mpegts: any
}> = ({ videoName, videoUrl, width, height, thumbnail, subtitle, isFlv, mpegts }) => {
  useEffect(() => {
    axios
      .get(subtitle, { responseType: 'blob' })
      .then(resp => {
        const track = document.querySelector('track')
        track?.setAttribute('src', URL.createObjectURL(resp.data))
      })
      .catch(() => {
        console.log('Could not load subtitle.')
      })

    if (isFlv) {
      const loadFlv = () => {
        const video = document.getElementById('plyr')
        const flv = mpegts.createPlayer({ url: videoUrl, type: 'flv' })
        flv.attachMediaElement(video)
        flv.load()
      }
      loadFlv()
    }
  }, [videoUrl, isFlv, mpegts, subtitle])

  const plyrSource = {
    type: 'video',
    title: videoName,
    poster: thumbnail,
    tracks: [{ kind: 'captions', label: videoName, src: '', default: true }],
  }

  const isPortrait = width && height ? height > width : false
  const plyrOptions: Plyr.Options = {
    ratio: width && height ? `${width}:${height}` : isPortrait ? '9:16' : '16:9',
    fullscreen: { iosNative: true },
  }

  if (!isFlv) {
    plyrSource['sources'] = [{ src: videoUrl }]
  }

  return (
    <div className="flex max-h-[60vh] w-full items-center justify-center overflow-hidden rounded bg-black">
      <div className="h-full w-full max-w-full">
        <Plyr id="plyr" source={plyrSource as Plyr.SourceInfo} options={plyrOptions} />
      </div>
    </div>
  )
}

const VideoPreview: FC<{ file: OdFileObject }> = ({ file }) => {
  const { asPath } = useRouter()
  const hashedToken = getStoredToken(asPath)
  const { t } = useTranslation()

  const thumbnail = `/api/thumbnail/?path=${asPath}&size=large${hashedToken ? `&odpt=${hashedToken}` : ''}`
  const vtt = `${asPath.substring(0, asPath.lastIndexOf('.'))}.vtt`
  const subtitle = `/api/raw/?path=${vtt}${hashedToken ? `&odpt=${hashedToken}` : ''}`
  const videoUrl = `/api/raw/?path=${asPath}${hashedToken ? `&odpt=${hashedToken}` : ''}`

  const isFlv = getExtension(file.name) === 'flv'
  const {
    loading,
    error,
    result: mpegts,
  } = useAsync(async () => {
    if (isFlv) {
      return (await import('mpegts.js')).default
    }
  }, [isFlv])

  // 下載邏輯：帶 toast 提示與跨裝置安全觸發
  const handleDownload = () => {
    const toastId = toast.loading(t('準備下載中...'))
    const el = document.createElement('a')
    el.href = videoUrl
    el.target = '_blank'
    el.rel = 'noopener noreferrer'
    el.download = file.name
    document.body.appendChild(el)
    el.click()
    el.remove()
    setTimeout(() => {
      toast.success(t('已開始下載影片！'), { id: toastId })
    }, 800)
  }

  return (
    <>
      <PreviewContainer>
        {error ? (
          <FourOhFour errorMsg={error.message} />
        ) : loading && isFlv ? (
          <Loading loadingText={t('Loading FLV extension...')} />
        ) : (
          <VideoPlayer
            videoName={file.name}
            videoUrl={videoUrl}
            width={file.video?.width}
            height={file.video?.height}
            thumbnail={thumbnail}
            subtitle={subtitle}
            isFlv={isFlv}
            mpegts={mpegts}
          />
        )}
      </PreviewContainer>

      {/* 只保留單一下載按鈕，附帶下載提示 */}
      <DownloadBtnContainer>
        <div className="flex justify-center">
          <DownloadButton
            onClickCallback={handleDownload}
            btnColor="blue"
            btnText={t('Download')}
            btnIcon="file-download"
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default VideoPreview
