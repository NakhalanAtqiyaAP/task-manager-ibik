export default function OAuthBootOverlay({ userName }) {
  return (
    <div className="fixed inset-0 z-50 bg-purple-900 flex flex-col items-center justify-center text-white font-mono p-4 overflow-hidden">
      <div className="space-y-8 text-center">
        <h2 className="text-xl md:text-2xl uppercase tracking-[0.2em] opacity-0 animate-text-seq" style={{ animationDelay: '0.5s' }}>
          Welcome <span className="text-green-400 font-black">{userName}</span>...
        </h2>
        <p className="text-lg uppercase tracking-widest opacity-0 animate-text-seq" style={{ animationDelay: '1.8s' }}>
          To Website...
        </p>
        <h1 className="text-5xl md:text-7xl font-black italic underline decoration-green-400 opacity-0 animate-text-seq" style={{ animationDelay: '2.8s' }}>
          TI-25-KA
        </h1>
      </div>

      <div className="absolute bottom-20 w-full max-w-xs px-4" style={{ maxWidth: '250px' }}>
        <div className="h-1 bg-gray-900 w-full overflow-hidden border border-white/10">
          <div className="h-full bg-green-500 animate-progress"></div>
        </div>
        <div className="flex justify-between mt-2">
          <p className="text-[10px] text-gray-500 animate-pulse uppercase">Loading_to_website...</p>
          <p className="text-[10px] text-green-500 font-bold uppercase">Ready</p>
        </div>
      </div>
      <div className="absolute inset-0 bg-black opacity-0 animate-final-fade z-50 pointer-events-none" style={{ animationDelay: '4s' }}></div>
    </div>
  );
}
