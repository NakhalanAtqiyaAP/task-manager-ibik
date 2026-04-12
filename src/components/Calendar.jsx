import { useState } from 'react';

export default function Calendar({ value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleDateClick = (date) => {
    if (date) {
      onChange(date.toISOString().split('T')[0]);
      setIsOpen(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const selectedDate = value ? new Date(value) : null;

  return (
    <div className="relative">
      {/* Input Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 border-4 border-black bg-white text-black font-black text-sm uppercase hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-40 text-left flex items-center justify-between"
      >
        <span className="truncate">{value ? formatDate(selectedDate) : placeholder}</span>
        <span className="ml-2 text-lg">📅</span>
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-3 border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] z-50 min-w-[320px]">
          {/* Header */}
          <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-white">
            <button
              onClick={handlePrevMonth}
              className="text-white font-black text-2xl px-2 py-1 border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              ‹
            </button>
            <span className="font-black uppercase text-lg tracking-wider">
              {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={handleNextMonth}
              className="text-white font-black text-2xl px-2 py-1 border-2 border-white hover:bg-white hover:text-black transition-colors"
            >
              ›
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-2 p-4 bg-purple-600 text-white border-b-4 border-black">
            {days.map(day => (
              <div key={day} className="text-center font-black text-sm uppercase py-2 border-2 border-white">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 p-4">
            {daysInMonth.map((date, index) => (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!date}
                className={`
                  h-12 w-12 text-lg font-black border-4 transition-all duration-200
                  ${!date
                    ? 'border-transparent cursor-default'
                    : selectedDate && date.toDateString() === selectedDate.toDateString()
                      ? 'border-black bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105'
                      : 'border-gray-400 bg-white text-black hover:border-black hover:bg-gray-100 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105'
                  }
                `}
              >
                {date ? date.getDate() : ''}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t-4 border-black bg-gray-100">
            <button
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="w-full py-3 border-4 border-red-500 bg-red-500 text-white font-black text-sm uppercase hover:bg-red-600 hover:border-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              CLEAR DATE
            </button>
          </div>
        </div>
      )}

      {/* Overlay to close calendar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}