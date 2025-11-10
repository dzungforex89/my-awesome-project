import { useState } from 'react'

const DEFAULT_URL = 'https://lookerstudio.google.com/reporting/b49f8f13-883f-4f8f-8662-de0e738af36d'

export default function Dashboard(){
  const [url, setUrl] = useState(DEFAULT_URL)
  const [input, setInput] = useState('')

  function applyUrl(){
    if(input.trim()) setUrl(input.trim())
  }

  return (
    <div>
      <div className="hero mb-6" style={{backgroundImage: `url('https://images.unsplash.com/photo-1531497865149-68b8b4b8a4b3?auto=format&fit=crop&w=1400&q=80')`}}>
        <div className="hero-content container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm md:text-base">Xem báo cáo nhúng. Dán link nhúng mới vào ô thay đổi phía dưới.</p>
        </div>
      </div>

      <div className="card-bg p-4 rounded shadow-sm mb-4">
        <div className="mb-3 text-sm text-gray-600">Báo cáo nhúng (mặc định là Looker mà bạn cung cấp). Đặt link nhúng khác vào ô dưới để thay đổi.</div>
        <div className="w-full h-[600px] border">
          <iframe src={url} title="Dashboard" className="w-full h-full" />
        </div>
        <div className="mt-4 flex gap-2">
          <input value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Dán link nhúng mới vào đây" className="flex-1 px-3 py-2 border rounded" />
          <button onClick={applyUrl} className="bg-green-600 text-white px-4 py-2 rounded">Áp dụng</button>
          <button onClick={()=>{setInput(''); setUrl(DEFAULT_URL)}} className="px-3 py-2 border rounded">Khôi phục mặc định</button>
        </div>
      </div>
    </div>
  )
}
