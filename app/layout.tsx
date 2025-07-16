import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: '健身打卡日历 - 科学记录你的健身历程',
    template: '%s | 健身打卡日历'
  },
  description: '专业的健身打卡日历应用，帮助你科学记录健身数据，追踪训练进度，建立健康生活习惯。支持自定义训练计划，数据可视化分析。',
  keywords: ['健身打卡', '健身日历', '训练记录', '健身追踪', '健康管理', '运动计划', '健身数据'],
  authors: [{ name: 'Fitness Calendar Team' }],
  creator: 'Fitness Calendar',
  publisher: 'Fitness Calendar',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://fitness-calendar-three.vercel.app'), 
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://your-domain.com',
    title: '健身打卡日历 - 科学记录你的健身历程',
    description: '专业的健身打卡日历应用，帮助你科学记录健身数据，追踪训练进度，建立健康生活习惯。',
    siteName: '健身打卡日历',
    images: [
      {
        url: '/og-image.jpg', // 需要添加这个图片
        width: 1200,
        height: 630,
        alt: '健身打卡日历应用界面',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '健身打卡日历 - 科学记录你的健身历程',
    description: '专业的健身打卡日历应用，帮助你科学记录健身数据，追踪训练进度。',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code', // 添加Google Search Console验证码
    yandex: 'your-yandex-verification-code', // 如果需要
    yahoo: 'your-yahoo-verification-code', // 如果需要
  },
}

export default function RootLayout ({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='zh-CN'>
      <head>
        {/* 简化favicon配置 */}
        <link rel="icon" href="/favicon/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        
        {/* 添加结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "健身打卡日历",
              "description": "专业的健身打卡日历应用，帮助你科学记录健身数据",
              "url": "https://your-domain.com",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "CNY"
              }
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
