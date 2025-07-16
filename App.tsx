
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CheckInData, Settings } from './types';
import { INITIAL_SETTINGS } from './constants';

// --- HELPER HOOK for localStorage ---
function useLocalStorage<T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}


// --- DATE HELPER FUNCTIONS ---
const formatDate = (date: Date, formatStr: 'yyyy-MM-dd' | 'MMMM yyyy') => {
  if (formatStr === 'yyyy-MM-dd') {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (formatStr === 'MMMM yyyy') {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }
  return date.toDateString();
};

const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0);

    // Sunday is 0, Monday is 1, etc.
    const startDayOfWeek = startOfMonth.getDay(); 
    const daysInGrid = [];

    // Days from previous month
    for (let i = 0; i < startDayOfWeek; i++) {
        const day = new Date(startOfMonth);
        day.setDate(day.getDate() - (startDayOfWeek - i));
        daysInGrid.push(day);
    }

    // Days in current month
    for (let i = 1; i <= endOfMonth.getDate(); i++) {
        daysInGrid.push(new Date(year, month, i));
    }
    
    // Days from next month
    const endDayOfWeek = endOfMonth.getDay();
    for (let i = 1; i < 7 - endDayOfWeek; i++) {
        const day = new Date(endOfMonth);
        day.setDate(day.getDate() + i);
        daysInGrid.push(day);
    }

    return daysInGrid;
}


// --- ICON COMPONENT ---
type IconName = 'ChevronLeft' | 'ChevronRight' | 'Settings' | 'X' | 'Plus' | 'Trash2' | 'CheckCircle' | 'Calendar';

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className = "w-6 h-6" }) => {
  const icons: { [key in IconName]: React.ReactNode } = {
    ChevronLeft: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />,
    ChevronRight: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />,
    Settings: <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
    X: <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />,
    Plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    Trash2: <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />,
    CheckCircle: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    Calendar: <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18" />,
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      {icons[name]}
    </svg>
  );
};


// --- UI COMPONENTS ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string; }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <Icon name="X" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-gray-100 hover:bg-gray-700 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <input id={id} {...props} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition" />
    </div>
  );
};

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }> = ({ label, id, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <textarea id={id} {...props} rows={3} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition" />
    </div>
  );
};

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }> = ({ label, id, children, ...props }) => {
  return (
    <div>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>}
      <select id={id} {...props} className="w-full bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition">
        {children}
      </select>
    </div>
  );
};

const ProgressBar: React.FC<{ value: number, label: string }> = ({ value, label }) => {
  const percentage = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm font-medium text-blue-400">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};


// --- FEATURE COMPONENTS ---
const Stats: React.FC<{ checkIns: Record<string, CheckInData>; currentMonth: Date; settings: Settings }> = ({ checkIns, currentMonth, settings }) => {
  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const checkedInDays = Object.keys(checkIns).filter(dateStr => {
      const date = new Date(dateStr);
      return date.getFullYear() === year && date.getMonth() === month;
    }).length;
    return {
      rate: (checkedInDays / daysInMonth) * 100,
      checkedInDays,
      totalDays: daysInMonth
    };
  }, [checkIns, currentMonth]);

  const weeklyStats = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday as start of week
    
    let checkedInThisWeek = 0;
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dateStr = formatDate(day, 'yyyy-MM-dd');
        if (checkIns[dateStr]) {
            checkedInThisWeek++;
        }
    }
    
    return {
        rate: settings.weeklyGoal > 0 ? (checkedInThisWeek / settings.weeklyGoal) * 100 : 0,
        checkedInDays: checkedInThisWeek,
        goal: settings.weeklyGoal
    };
  }, [checkIns, settings.weeklyGoal]);
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-6">
       <h2 className="text-xl font-bold text-white">本周进度 Weekly Progress</h2>
      <ProgressBar value={weeklyStats.rate} label={`本周目标 Goal: ${weeklyStats.checkedInDays} / ${weeklyStats.goal} 次`} />
      <h2 className="text-xl font-bold text-white">本月统计 Monthly Stats</h2>
      <ProgressBar value={monthlyStats.rate} label={`打卡率 Check-in Rate: ${monthlyStats.checkedInDays} / ${monthlyStats.totalDays} 天`} />
    </div>
  );
};


const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void; settings: Settings; onSave: (newSettings: Settings) => void; }> = ({ isOpen, onClose, settings, onSave }) => {
  const [currentSettings, setCurrentSettings] = useState(settings);
  const [newExercise, setNewExercise] = useState("");

  useEffect(() => {
    setCurrentSettings(settings);
  }, [settings, isOpen]);

  const handleAddExercise = () => {
    if (newExercise && !currentSettings.exerciseTypes.includes(newExercise)) {
      setCurrentSettings(prev => ({ ...prev, exerciseTypes: [...prev.exerciseTypes, newExercise] }));
      setNewExercise("");
    }
  };
  
  const handleRemoveExercise = (typeToRemove: string) => {
    setCurrentSettings(prev => ({
        ...prev,
        exerciseTypes: prev.exerciseTypes.filter(t => t !== typeToRemove)
    }));
  };

  const handleSave = () => {
    onSave(currentSettings);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="基础设置 Settings">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">运动类型 Exercise Types</h3>
          <div className="space-y-2">
            {currentSettings.exerciseTypes.map(type => (
              <div key={type} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                <span>{type}</span>
                <button onClick={() => handleRemoveExercise(type)} className="text-red-400 hover:text-red-300">
                    <Icon name="Trash2" className="w-5 h-5"/>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <Input 
                value={newExercise} 
                onChange={e => setNewExercise(e.target.value)}
                placeholder="添加新类型 Add new type" 
            />
            <Button onClick={handleAddExercise} variant="secondary"><Icon name="Plus" className="w-5 h-5"/></Button>
          </div>
        </div>

        <div>
            <Input 
                label="每周目标 (次) Weekly Goal (times)"
                type="number"
                min="1"
                value={currentSettings.weeklyGoal}
                onChange={e => setCurrentSettings(prev => ({...prev, weeklyGoal: Number(e.target.value)}))}
            />
        </div>
        
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave}>保存 Save</Button>
        </div>
      </div>
    </Modal>
  );
};


const CheckInModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  checkInData: CheckInData | null;
  onSave: (data: CheckInData, date: string) => void;
  onDelete: (date: string) => void;
  settings: Settings;
}> = ({ isOpen, onClose, date, checkInData, onSave, onDelete, settings }) => {
  const [exerciseType, setExerciseType] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
        setExerciseType(checkInData?.exerciseType || settings.exerciseTypes[0] || '');
        setDuration(checkInData?.duration || 30);
        setNotes(checkInData?.notes || '');
    }
  }, [isOpen, checkInData, settings.exerciseTypes]);

  if (!isOpen || !date) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ exerciseType, duration, notes }, formatDate(date, 'yyyy-MM-dd'));
    onClose();
  };
  
  const handleDelete = () => {
      onDelete(formatDate(date, 'yyyy-MM-dd'));
      onClose();
  }

  const title = checkInData ? "编辑打卡 Edit Check-in" : "快速打卡 Quick Check-in";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${title} - ${formatDate(date, 'yyyy-MM-dd')}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="运动类型 Exercise Type" value={exerciseType} onChange={(e) => setExerciseType(e.target.value)}>
          {settings.exerciseTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </Select>
        <Input label="时长 (分钟) Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min="1" />
        <Textarea label="备注 (可选) Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., 练肩 40 分钟" />
        <div className="flex justify-between pt-4">
          {checkInData && <Button type="button" variant="danger" onClick={handleDelete}><Icon name="Trash2" className="w-5 h-5"/> 删除</Button>}
          <div className="flex-grow"></div>
          <Button type="submit"><Icon name="CheckCircle" className="w-5 h-5"/> 确认</Button>
        </div>
      </form>
    </Modal>
  );
};

const Calendar: React.FC<{
    currentMonth: Date;
    onMonthChange: (newMonth: Date) => void;
    onDateClick: (date: Date) => void;
    checkIns: Record<string, CheckInData>;
}> = ({ currentMonth, onMonthChange, onDateClick, checkIns }) => {
    const monthDays = useMemo(() => getDaysInMonth(currentMonth), [currentMonth]);
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const isToday = (date: Date) => formatDate(date, 'yyyy-MM-dd') === formatDate(new Date(), 'yyyy-MM-dd');
    const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth.getMonth();

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white tabular-nums">
                    {formatDate(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => onMonthChange(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <Icon name="ChevronLeft" />
                    </button>
                    <button onClick={() => onMonthChange(new Date())} className="px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-700 transition-colors">
                        Today
                    </button>
                    <button onClick={() => onMonthChange(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <Icon name="ChevronRight" />
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                    <div key={day} className="text-center font-semibold text-xs text-gray-400 py-2">{day}</div>
                ))}

                {monthDays.map((day, index) => {
                    const dateStr = formatDate(day, 'yyyy-MM-dd');
                    const hasCheckIn = !!checkIns[dateStr];
                    const dayClasses = `
                        relative flex items-center justify-center h-12 sm:h-16 rounded-lg cursor-pointer transition-colors
                        ${isCurrentMonth(day) ? 'text-white hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-700/50'}
                        ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                    `;

                    return (
                        <div key={index} className={dayClasses} onClick={() => onDateClick(day)}>
                            <span className="z-10">{day.getDate()}</span>
                            {hasCheckIn && (
                                <div className="absolute bottom-1.5 w-1.5 h-1.5 bg-green-400 rounded-full z-20"></div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [checkIns, setCheckIns] = useLocalStorage<Record<string, CheckInData>>('fitnessCheckIns', {});
  const [settings, setSettings] = useLocalStorage<Settings>('fitnessSettings', INITIAL_SETTINGS);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCheckInModalOpen, setCheckInModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCheckInModalOpen(true);
  };

  const handleSaveCheckIn = useCallback((data: CheckInData, dateStr: string) => {
    setCheckIns(prev => ({ ...prev, [dateStr]: data }));
  }, [setCheckIns]);

  const handleDeleteCheckIn = useCallback((dateStr: string) => {
    setCheckIns(prev => {
        const newCheckIns = { ...prev };
        delete newCheckIns[dateStr];
        return newCheckIns;
    });
  }, [setCheckIns]);

  const handleSaveSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, [setSettings]);

  const selectedCheckInData = selectedDate ? checkIns[formatDate(selectedDate, 'yyyy-MM-dd')] : null;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Icon name="Calendar" className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold">健身打卡日历 Fitness Calendar</h1>
          </div>
          <Button variant="secondary" onClick={() => setSettingsModalOpen(true)}>
            <Icon name="Settings" className="w-5 h-5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                 <Calendar 
                    currentMonth={currentMonth} 
                    onMonthChange={setCurrentMonth}
                    onDateClick={handleDateClick}
                    checkIns={checkIns}
                 />
            </div>
            <div className="lg:col-span-1">
                <Stats 
                    checkIns={checkIns} 
                    currentMonth={currentMonth}
                    settings={settings}
                />
            </div>
        </main>
      </div>

      <CheckInModal 
        isOpen={isCheckInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        date={selectedDate}
        checkInData={selectedCheckInData || null}
        onSave={handleSaveCheckIn}
        onDelete={handleDeleteCheckIn}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />
    </div>
  );
}

export default App;
