import { useState, useEffect, useRef } from 'react';

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const DAYS_SHORT = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

function toKey(date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

function fromKey(key) {
  if (!key) return null;
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function fmtFull(date) {
  if (!date) return null;
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function fmtShort(date) {
  if (!date) return null;
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}`;
}

function MiniCalendar({ viewDate, selectedKey, otherKey, isStart, onSelect, onNav }) {
  const y = viewDate.getFullYear();
  const m = viewDate.getMonth();
  const firstDay = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const todayKey = toKey(new Date());
  const startK = isStart ? selectedKey : otherKey;
  const endK   = isStart ? otherKey : selectedKey;

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b-2 border-black bg-purple-50">
        <button
          onClick={() => onNav(-1)}
          className="font-black text-lg leading-none hover:text-purple-600 transition-colors"
        >‹</button>
        <span className="font-black text-[10px] uppercase tracking-widest">
          {MONTHS[m]} {y}
        </span>
        <button
          onClick={() => onNav(1)}
          className="font-black text-lg leading-none hover:text-purple-600 transition-colors"
        >›</button>
      </div>

      {/* Grid */}
      <div className="p-1.5">
        <div className="grid grid-cols-7 mb-1">
          {DAYS_SHORT.map(d => (
            <div key={d} className="text-center text-[9px] font-black text-gray-400 uppercase py-0.5">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
            const key = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const isSelected = key === selectedKey;
            const isToday = key === todayKey;
            const inRange = startK && endK && key > startK && key < endK;

            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={`text-[11px] font-bold text-center py-1 leading-tight border transition-colors
                  ${isSelected
                    ? 'bg-purple-600 text-white border-black'
                    : inRange
                    ? 'bg-purple-100 text-purple-900 border-transparent'
                    : isToday
                    ? 'border-purple-600 text-purple-600 bg-white'
                    : 'border-transparent hover:bg-purple-50 hover:border-purple-300'
                  }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DateRangePicker({ startDate, endDate, onStartDateChange, onEndDateChange, onClear }) {
  const [isOpen, setIsOpen] = useState(false);
  const [startSel, setStartSel] = useState(startDate || null);
  const [endSel, setEndSel]     = useState(endDate   || null);
  const [startView, setStartView] = useState(new Date());
  const [endView, setEndView]     = useState(new Date());
  const ref = useRef(null);

  useEffect(() => {
    setStartSel(startDate || null);
    setEndSel(endDate || null);
  }, [startDate, endDate]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleStartSelect = (key) => {
    setStartSel(key);
    if (endSel && endSel < key) setEndSel(null);
  };

  const handleEndSelect = (key) => {
    setEndSel(key);
    if (startSel && startSel > key) setStartSel(null);
  };

  const setQuick = (s, e) => {
    setStartSel(toKey(s));
    setEndSel(toKey(e));
    setStartView(new Date(s));
    setEndView(new Date(e));
  };

  const handleApply = () => {
    onStartDateChange(startSel);
    onEndDateChange(endSel);
    setIsOpen(false);
  };

  const handleClear = () => {
    setStartSel(null);
    setEndSel(null);
    onClear();
    setIsOpen(false);
  };

  const formatLabel = () => {
    const s = fromKey(startSel), e = fromKey(endSel);
    if (s && e) {
      const days = Math.round((e - s) / 86400000);
      return `${fmtShort(s)} — ${fmtFull(e)} (${days} hari)`;
    }
    if (s) return `Dari ${fmtFull(s)}`;
    if (e) return `Sampai ${fmtFull(e)}`;
    return 'PILIH DEADLINE';
  };

  return (
    <div className="relative" ref={ref}>

      {/* TRIGGER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 px-3 py-2 bg-white border-[3px] border-black font-black text-xs uppercase tracking-wide
          transition-all min-w-[220px] text-left
          ${isOpen
            ? 'shadow-none translate-x-[3px] translate-y-[3px]'
            : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
          }`}
      >
        <span className="truncate text-black">{formatLabel()}</span>
        <span className={`shrink-0 text-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* PANEL */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 z-50 bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-[360px] max-w-[calc(100vw-32px)] text-black">

          {/* Header */}
          <div className="bg-black flex items-center justify-between px-4 py-2.5">
            <span className="text-white font-black text-[11px] uppercase tracking-[.12em]">
              Set Rentang Waktu
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white font-black text-base leading-none hover:text-red-400 transition-colors"
            >✕</button>
          </div>

          {/* Range preview */}
          <div className="px-4 pt-3 pb-0">
            <div className="border-2 border-purple-600 bg-purple-50 px-3 py-2 font-black text-[11px] uppercase tracking-wide text-purple-900 min-h-[34px] flex items-center">
              {startSel || endSel ? formatLabel() : (
                <span className="text-purple-400">Belum ada rentang deadline dipilih</span>
              )}
            </div>
          </div>

          {/* Calendars */}
          <div className="grid grid-cols-2 gap-0 p-4 pb-2">
            {/* Start */}
            <div className="border-2 border-black">
              <div className="bg-purple-600 px-2 py-1.5">
                <div className="text-[9px] font-black uppercase tracking-widest text-purple-200">Dari Tanggal</div>
                <div className="text-white font-black text-[11px]">
                  {startSel ? fmtFull(fromKey(startSel)) : '— Pilih Awal'}
                </div>
              </div>
              <MiniCalendar
                viewDate={startView}
                selectedKey={startSel}
                otherKey={endSel}
                isStart={true}
                onSelect={handleStartSelect}
                onNav={(d) => setStartView(new Date(startView.getFullYear(), startView.getMonth() + d, 1))}
              />
            </div>

            {/* End */}
            <div className="border-2 border-black border-l-0">
              <div className="bg-purple-600 px-2 py-1.5">
                <div className="text-[9px] font-black uppercase tracking-widest text-purple-200">Sampai Tanggal</div>
                <div className="text-white font-black text-[11px]">
                  {endSel ? fmtFull(fromKey(endSel)) : '— Pilih Akhir'}
                </div>
              </div>
              <MiniCalendar
                viewDate={endView}
                selectedKey={endSel}
                otherKey={startSel}
                isStart={false}
                onSelect={handleEndSelect}
                onNav={(d) => setEndView(new Date(endView.getFullYear(), endView.getMonth() + d, 1))}
              />
            </div>
          </div>

          {/* Quick select */}
          <div className="flex flex-wrap gap-2 px-4 py-3 border-t-2 border-black">
            {[
              { label: '7 Hari Terakhir', fn: () => { const e=new Date(),s=new Date(); s.setDate(s.getDate()-7); setQuick(s,e); }},
              { label: '30 Hari Terakhir', fn: () => { const e=new Date(),s=new Date(); s.setDate(s.getDate()-30); setQuick(s,e); }},
              { label: 'Minggu Depan', fn: () => { const s=new Date(),e=new Date(); e.setDate(e.getDate()+7); setQuick(s,e); }},
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={fn}
                className="text-[10px] font-black uppercase tracking-wide px-2.5 py-1.5 bg-white border-2 border-black
                  shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white
                  hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="grid grid-cols-3 border-t-2 border-black">
            <button
              onClick={handleClear}
              className="py-3 font-black text-xs uppercase tracking-wide text-red-600 border-r-2 border-black hover:bg-red-50 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="col-span-2 py-3 bg-green-400 font-black text-xs uppercase tracking-wide hover:bg-black hover:text-green-400 transition-colors"
            >
              Terapkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}