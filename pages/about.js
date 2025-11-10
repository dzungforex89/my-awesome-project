export default function About(){
  return (
    <div>
      <div className="hero mb-6" style={{backgroundImage: `url('https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1400&q=80')`}}>
        <div className="hero-content container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold">About us</h1>
          <p className="mt-2 text-sm md:text-base">Tìm hiểu về cuộc thi và đội ngũ tổ chức.</p>
        </div>
      </div>

      <div className="card-bg p-6 rounded shadow-sm">
        <p className="mb-2">Đây là giao diện đơn giản phục vụ cho cuộc thi: gửi ảnh hoá đơn để trigger webhook, xem dashboard và thông tin liên hệ.</p>
        <p className="text-sm text-gray-600">Bạn có thể chỉnh sửa mã nguồn để thay đổi webhook, link dashboard mặc định hoặc giao diện.</p>
      </div>
    </div>
  )
}
