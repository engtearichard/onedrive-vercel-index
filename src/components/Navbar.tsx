import Image from 'next/image'
import siteConfig from '../../config/site.config'

const Navbar = () => {
  return (
    <div className="sticky top-0 z-[100] border-b border-gray-900/10 bg-white/80 backdrop-blur-md dark:border-gray-500/30 dark:bg-gray-900/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center px-4">
        {/* 純靜態 Logo 與標題：無 <a> 或 <Link>，不可點擊，無法返回根目錄 */}
        <div className="flex select-none items-center space-x-2.5">
          <Image
            src={siteConfig.icon}
            alt="icon"
            width={28}
            height={28}
            priority
            className="rounded"
          />
          <span className="font-bold text-gray-900 dark:text-white">
            {siteConfig.title}
          </span>
        </div>
      </div>
    </div>
  )
}

export default Navbar
