// app/page.js
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
          Welcome to NextChat
        </h1>
        <p className="mb-8 text-gray-600 dark:text-gray-300">
          A real-time chat application built with Next.js
        </p>
        <Link
          href="/chat"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Go to Chat
        </Link>
      </div>
    </div>
  )
}