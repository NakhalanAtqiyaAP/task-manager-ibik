import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Overlay dengan blur tipis */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel}></div>
      
      {/* Box Modal */}
      <div className="relative bg-white border-4 border-black p-6 max-w-sm w-full shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-500 p-2 border-2 border-black">
            <AlertTriangle className="text-white" size={24} />
          </div>
          <h2 className="font-black uppercase italic text-xl leading-none">{title}</h2>
        </div>
        
        <p className="font-bold text-gray-700 mb-6 leading-tight uppercase text-sm">
          {message}
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className="border-2 border-black py-2 font-black uppercase text-xs hover:bg-gray-100 transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="bg-red-500 text-white border-2 border-black py-2 font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            Ya, Hapus!
          </button>
        </div>
      </div>
    </div>
  );
}