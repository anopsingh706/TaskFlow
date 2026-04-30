import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Logo from '../components/ui/Logo'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <Logo size="md" className="mb-10" />
      <div className="w-24 h-24 bg-violet-50 border border-violet-100 rounded-3xl flex items-center justify-center mb-6 text-5xl">
        🔍
      </div>
      <h1 className="font-display font-semibold text-4xl text-gray-900 mb-2">Page not found</h1>
      <p className="text-gray-400 text-base mb-8 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-secondary">
          <ArrowLeft size={16} /> Go home
        </Link>
        <Link to="/dashboard" className="btn-primary">
          Open app
        </Link>
      </div>
    </div>
  )
}
