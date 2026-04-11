export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative w-full max-w-2xl border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className="bg-purple-600 text-white p-4 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic">{title}</h2>
          <button onClick={onClose} className="bg-red-500 border-2 border-black px-2 font-black hover:bg-white hover:text-black transition-colors">
            X
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}