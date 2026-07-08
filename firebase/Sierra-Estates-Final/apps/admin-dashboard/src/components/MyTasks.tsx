import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ClipboardList } from 'lucide-react';

interface TaskItem {
  id: string;
  text: string;
  timeframe: 'today' | 'week';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  createdAt: number;
}

export default function MyTasks() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [timeframe, setTimeframe] = useState<'today' | 'week'>('today');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Load tasks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sierra_admin_personal_tasks');
      if (stored) {
        setTasks(JSON.parse(stored));
      } else {
        // Seed some default onboarding tasks
        const defaultTasks: TaskItem[] = [
          {
            id: '1',
            text: 'Verify PropertyFinder sync logs for new Cairo listings',
            timeframe: 'today',
            priority: 'high',
            completed: false,
            createdAt: Date.now() - 3600000
          },
          {
            id: '2',
            text: 'Approve pending staging deployment for Client Portal',
            timeframe: 'today',
            priority: 'medium',
            completed: false,
            createdAt: Date.now() - 7200000
          },
          {
            id: '3',
            text: 'Configure Twilio SMS messaging templates for elite brokers',
            timeframe: 'week',
            priority: 'low',
            completed: false,
            createdAt: Date.now() - 10000000
          }
        ];
        setTasks(defaultTasks);
        localStorage.setItem('sierra_admin_personal_tasks', JSON.stringify(defaultTasks));
      }
    } catch (e) {
      console.error('Failed to load local tasks:', e);
    }
  }, []);

  // Save to localStorage whenever tasks change
  const saveTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('sierra_admin_personal_tasks', JSON.stringify(newTasks));
    } catch (e) {
      console.error('Failed to save tasks:', e);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTask: TaskItem = {
      id: Math.random().toString(36).substring(2, 9),
      text: inputText.trim(),
      timeframe,
      priority,
      completed: false,
      createdAt: Date.now()
    };

    saveTasks([newTask, ...tasks]);
    setInputText('');
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
  };

  const clearCompleted = () => {
    const updated = tasks.filter(t => !t.completed);
    saveTasks(updated);
  };

  // Filter & segment tasks
  const filteredTasks = tasks.filter(t => {
    // 1. Timeframe filter (Today vs Week)
    if (t.timeframe !== timeframe) return false;
    // 2. Status filter
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const pendingCount = tasks.filter(t => t.timeframe === timeframe && !t.completed).length;

  const priorityColors = {
    high: 'text-rose-400 bg-rose-950/30 border-rose-500/20',
    medium: 'text-amber-400 bg-amber-950/30 border-amber-500/20',
    low: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/20'
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] text-slate-100 rounded-xl overflow-hidden border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center select-none shrink-0">
        <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold flex items-center gap-1.5">
          <ClipboardList className="w-4 h-4" /> Personal Task Planner
        </span>
        {pendingCount > 0 && (
          <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse">
            {pendingCount} Pending
          </span>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddTask} className="p-4 border-b border-slate-800/40 bg-slate-950/40 space-y-3 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-1.5 rounded transition duration-150 active:scale-95 shrink-0 flex items-center justify-center cursor-pointer"
            title="Add Task"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Filters and parameters */}
        <div className="flex justify-between items-center text-[10px] font-mono">
          <div className="flex gap-2.5">
            {/* Timeframe Select */}
            <div className="flex bg-slate-900 border border-slate-800 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => setTimeframe('today')}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${timeframe === 'today' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setTimeframe('week')}
                className={`px-2 py-0.5 transition-colors cursor-pointer ${timeframe === 'week' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Weekly
              </button>
            </div>

            {/* Priority Select */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500">Priority:</span>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-1 py-0.5 text-slate-350 outline-none cursor-pointer focus:border-cyan-500"
              >
                <option value="high">High</option>
                <option value="medium">Med</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-1 py-0.5 rounded cursor-pointer ${filter === 'all' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('pending')}
              className={`px-1 py-0.5 rounded cursor-pointer ${filter === 'pending' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilter('completed')}
              className={`px-1 py-0.5 rounded cursor-pointer ${filter === 'completed' ? 'text-cyan-400 font-bold' : 'text-slate-500 hover:text-slate-350'}`}
            >
              Done
            </button>
          </div>
        </div>
      </form>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[300px] min-h-[220px]">
        {filteredTasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <ClipboardList className="w-8 h-8 text-slate-700 mb-2" />
            <p className="text-slate-500 text-xs font-mono">No tasks found for {timeframe === 'today' ? 'today' : 'this week'}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all duration-150 ${
                task.completed 
                  ? 'bg-slate-900/30 border-slate-900 text-slate-500' 
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80'
              }`}
            >
              {/* Checkbox */}
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 shrink-0 transition-colors cursor-pointer ${task.completed ? 'text-emerald-500' : 'text-slate-500 hover:text-cyan-400'}`}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-4 h-4 fill-emerald-500/10" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>

              {/* Task Text */}
              <span className={`text-[11px] leading-relaxed flex-1 font-sans ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                {task.text}
              </span>

              {/* Meta information & Delete */}
              <div className="flex items-center gap-1.5 shrink-0 self-center">
                {/* Priority Badge */}
                {!task.completed && (
                  <span className={`text-[8px] font-mono font-bold tracking-wider px-1 py-0.2 rounded border uppercase shrink-0 ${priorityColors[task.priority]}`}>
                    {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Med' : 'Low'}
                  </span>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-600 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                  title="Delete Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer controls */}
      {tasks.some(t => t.completed) && (
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-900 flex justify-end shrink-0 select-none">
          <button
            type="button"
            onClick={clearCompleted}
            className="text-[9px] font-mono text-slate-500 hover:text-red-400 transition cursor-pointer"
          >
            Clear Completed Tasks
          </button>
        </div>
      )}
    </div>
  );
}
