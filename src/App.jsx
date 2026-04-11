import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TaskTable from './components/TaskTable'
import Footer from './components/Footer' // Komponen baru

export default function App() {
  return (
    <div className="min-h-screen selection:bg-green-400 selection:text-black font-sans bg-white relative">
      
      {/* Background Grid Pattern (Thin Lines) */}
      <div className="fixed inset-0 z-[-1] opacity-[0.03]" 
           style={{ 
             backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
             backgroundSize: '40px 40px' 
           }}>
      </div>

      <Navbar />
      <main className="max-w-7xl mx-auto pt-8">
        <Hero />
        <TaskTable />
      </main>

      <Footer />
    </div>
  )
}