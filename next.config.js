const { i18n } = require('./next-i18next.config')

module.exports = {
  // 保留原本既有的其他設定...
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // 允許被其他網頁嵌入
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *", // 允許所有外部來源嵌入
          },
        ],
      },
    ]
  },
}
