import Link from 'next/link'

export default function Nav(){
  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">My Contest UI</div>
        <div className="space-x-4">
          <Link href="/" className="text-gray-700 hover:text-gray-900 px-2">Upload</Link>
          <Link href="/dashboard" className="text-gray-700 hover:text-gray-900 px-2">Dashboard</Link>
          <Link href="/about" className="text-gray-700 hover:text-gray-900 px-2">About</Link>
        </div>
      </div>
    </nav>
  )
}
