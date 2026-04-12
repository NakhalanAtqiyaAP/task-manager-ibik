export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-5xl border-4 border-black bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-purple-600 text-white p-6 border-b-4 border-black flex justify-between items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic">{title}</h2>
          <button onClick={onClose} className="bg-red-500 border-4 border-black px-3 py-1 font-black text-lg hover:bg-white hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            X
          </button>
        </div>
        <div className="p-6 md:p-8 overflow-y-auto max-h-[85vh]">
          {children}
        </div>
      </div>
    </div>
  );
}