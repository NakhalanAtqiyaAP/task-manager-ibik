import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function MediaSlider({ urls, types }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) return null;

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % urls.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));

  return (
    /* h-full w-full agar mengikuti ukuran kolom di Modal atau Gallery */
    <div className="relative bg-neutral-900 w-full h-full flex justify-center items-center overflow-hidden group">
      
      {/* Media Content */}
      <div className="w-full h-full flex items-center justify-center bg-black">
        {types[currentIndex] === 'image' ? (
          <img 
            src={urls[currentIndex]} 
            /* object-contain memastikan gambar tidak terpotong (zoom) */
            className="max-w-full max-h-full object-contain" 
            alt={`Slide ${currentIndex + 1}`} 
          />
        ) : (
          <video 
            src={urls[currentIndex]} 
            controls 
            className="max-w-full max-h-full" 
          />
        )}
      </div>

      {/* Tombol Navigasi */}
      {urls.length > 1 && (
        <>
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); prevSlide(); }} 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-1 md:p-2 hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronLeft size={20} strokeWidth={4} />
          </button>
          
          <button 
            type="button"
            onClick={(e) => { e.stopPropagation(); nextSlide(); }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white border-2 border-black p-1 md:p-2 hover:bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all opacity-0 group-hover:opacity-100 z-10"
          >
            <ChevronRight size={20} strokeWidth={4} />
          </button>

          {/* Indikator Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/90 border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {urls.map((_, idx) => (
              <div 
                key={idx} 
                className={`w-2 h-2 border border-black transition-colors ${idx === currentIndex ? 'bg-black' : 'bg-gray-300'}`} 
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}