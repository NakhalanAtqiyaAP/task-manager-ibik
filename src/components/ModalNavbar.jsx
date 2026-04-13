import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react'; // Menggunakan ikon Lucide agar lebih konsisten

export default function Modal({ isOpen, onClose, title, children }) {
  // Konfigurasi Variabel Animasi
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9, 
      y: 20,
      rotate: -1 // Sedikit miring saat muncul untuk kesan brutalist
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 10,
      transition: { duration: 0.2 } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Overlay / Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-5xl border-8 border-black bg-white shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-purple-600 text-white p-6 border-b-8 border-black flex justify-between items-center gap-4 shrink-0">
              <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                // {title}
              </h2>
              <button 
                onClick={onClose} 
                className="bg-red-500 border-4 border-black w-12 h-12 flex items-center justify-center font-black text-xl hover:bg-white hover:text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
              >
                <X size={28} strokeWidth={4} />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 md:p-8 overflow-y-auto max-h-[80vh] bg-[#fdfdfd]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}