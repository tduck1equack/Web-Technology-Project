import type { Metadata } from 'next'
import { motion } from 'framer-motion'
import { VideoIcon, BookOpenIcon, MessageSquareIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Authentication - Teams LMS',
  description: 'Sign in or create an account',
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const features = [
    {
      icon: VideoIcon,
      title: 'Interactive Learning',
      description: 'Giảng dạy trực tuyến với công cụ hiện đại',
    },
    {
      icon: BookOpenIcon,
      title: 'Resource Management',
      description: 'Quản lý tài liệu học tập dễ dàng',
    },
    {
      icon: MessageSquareIcon,
      title: 'Real-time Collaboration',
      description: 'Thảo luận và hợp tác cùng lúc',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex min-h-screen">
        {/* Brand Section - Desktop Only */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
          {/* Animated background elements */}
          <motion.div
            className="absolute top-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl"
            animate={{ x: [0, -30, 0], y: [0, -20, 0] }}
            transition={{ duration: 25, repeat: Infinity }}
          />

          <div className="absolute inset-0 bg-black/10" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <motion.div
              className="max-w-md"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-6 inline-flex rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-sm font-semibold">Teams LMS Platform</span>
              </motion.div>

              <motion.h1
                className="text-5xl font-bold leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Nền tảng học tập hiện đại
              </motion.h1>

              <motion.p
                className="mt-6 text-xl leading-relaxed text-blue-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Kết nối giáo viên và học sinh, tăng cường trải nghiệm học tập với công nghệ tiên tiến
              </motion.p>

              {/* Features List */}
              <motion.div
                className="mt-12 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, staggerChildren: 0.1 }}
              >
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={index}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="mt-1 rounded-lg bg-white/10 p-2">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold">{feature.title}</p>
                        <p className="text-sm text-blue-100">{feature.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Form Section */}
        <motion.div
          className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-full max-w-sm">
            {/* Logo */}
            <motion.div
              className="mb-8 flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600" />
              <span className="text-xl font-bold text-slate-900">Teams LMS</span>
            </motion.div>

            {/* Card */}
            <motion.div
              className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xl backdrop-blur-sm"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              {children}
            </motion.div>

            {/* Footer */}
            <motion.div
              className="mt-8 text-center text-xs text-slate-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p>© 2026 Teams LMS. All rights reserved.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
