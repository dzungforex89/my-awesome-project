import { useState, useEffect, useRef } from 'react'

const FUN_FACTS = [
  'NOVATECH team loves coffee and code ☕️👨‍💻',
  'We built this demo in React + Tailwind — fast prototyping!',
  'Pro tip: try dragging multiple invoices into the OCR area 😎',
  'Fun fact: this app can preview XLSX returned inside JSON from n8n.'
]

export default function About(){
  const [fact, setFact] = useState('')
  const [showCard, setShowCard] = useState(true)
  const confettiRef = useRef(null)

  useEffect(()=>{
    // small starter effect: pick one fact after mount
    setFact(FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)])
  }, [])

  function revealFact(){
    setFact(FUN_FACTS[Math.floor(Math.random()*FUN_FACTS.length)])
  }

  // simple confetti: create colored spans and animate then remove
  function burstConfetti(){
    const container = confettiRef.current
    if(!container) return
    const colors = ['#ff6b6b','#ffd93d','#6bcB77','#4d96ff','#b86bff']
    const count = 40
    for(let i=0;i<count;i++){
      const el = document.createElement('span')
      el.className = 'confetti'
      const size = Math.floor(Math.random()*10)+6
      el.style.background = colors[Math.floor(Math.random()*colors.length)]
      el.style.width = size + 'px'
      el.style.height = size + 'px'
      el.style.left = Math.floor(Math.random()*80 + 10) + '%'
      el.style.top = '0%'
      el.style.transform = `rotate(${Math.random()*360}deg)`
      container.appendChild(el)
      // remove after animation
      setTimeout(()=>{ try{ container.removeChild(el) }catch(e){} }, 2200)
    }
  }

  return (
    <div className="relative overflow-hidden">
      {/* Decorative hero using an unusual abstract background */}
      <div className="hero mb-6" style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1511765224389-37f0e77cf0eb?auto=format&fit=crop&w=1600&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '48vh'
      }}>
        {/* floating blobs */}
        <div className="absolute left-8 top-8 blob bg-purple-500 opacity-30"></div>
        <div className="absolute right-8 top-20 blob bg-yellow-400 opacity-30"></div>
        <div className="absolute left-1/2 top-12 blob bg-teal-400 opacity-25"></div>

        <div className="hero-content container mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow">About NOVATECH</h1>
          <p className="mt-3 text-lg text-white/90">A playful demo: OCR workflows, previews and small interactions.</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button onClick={revealFact} className="px-4 py-2 bg-white/90 rounded-md font-semibold hover:scale-105 transition">Reveal Fun Fact</button>
            <button onClick={burstConfetti} className="px-4 py-2 bg-pink-500 text-white rounded-md font-semibold hover:scale-105 transition">Celebrate 🎉</button>
            <button onClick={()=>setShowCard(!showCard)} className="px-4 py-2 bg-white/20 text-white rounded-md font-medium border border-white/25">{showCard? 'Hide' : 'Show'} Info</button>
          </div>

          <div className="mt-4 text-white/90">
            <strong>Fun:</strong> {fact}
          </div>
        </div>
      </div>

      {/* confetti container (absolutely positioned) */}
      <div ref={confettiRef} aria-hidden style={{position:'absolute', inset:0, pointerEvents:'none'}} />

      {/* Info card (toggleable) */}
      {showCard && (
        <div className="card-bg p-6 rounded shadow-sm container mx-auto -mt-12 relative z-10 max-w-3xl">
          <p className="mb-3 text-gray-800 font-medium">Đây là giao diện đơn giản phục vụ cho cuộc thi của đội NOVATECH: Workflow OCR và Simple Workflow.</p>
          <p className="text-sm text-gray-600 mb-2">Liên hệ: 0375477846 (Dũng Rùa).</p>
          <div className="mt-3 text-sm text-gray-500">Mẹo: thử kéo nhiều hóa đơn vào phần OCR chính để gửi hàng loạt.</div>
        </div>
      )}

      <style jsx>{`
        .blob{ width:220px; height:220px; filter: blur(40px); border-radius: 9999px; transform: translate3d(0,0,0); }
        .hero{ position: relative; }
        .confetti{ position:absolute; border-radius:2px; animation: confetti-fall 2s linear forwards; opacity:0.95 }
        @keyframes confetti-fall{
          0%{ transform: translateY(-10vh) rotate(0); opacity:1 }
          100%{ transform: translateY(110vh) rotate(540deg); opacity:0 }
        }
        /* small responsive tweak for card overlap */
        @media (min-width: 768px){ .card-bg{ margin-top: -2rem } }
      `}</style>
    </div>
  )
}
