import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';

export function ThemeToggle() {
  const { theme, actualTheme, setTheme, toggleTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="relative w-10 h-10 rounded-full overflow-hidden"
        >
          <div className="relative w-6 h-6">
            <Sun 
              className={`absolute inset-0 h-6 w-6 transition-all duration-500 ${
                actualTheme === 'dark' 
                  ? 'rotate-90 scale-0 opacity-0' 
                  : 'rotate-0 scale-100 opacity-100'
              }`}
            />
            <Moon 
              className={`absolute inset-0 h-6 w-6 transition-all duration-500 ${
                actualTheme === 'dark' 
                  ? 'rotate-0 scale-100 opacity-100' 
                  : '-rotate-90 scale-0 opacity-0'
              }`}
            />
          </div>
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className={theme === 'light' ? 'bg-accent' : ''}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Claro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className={theme === 'dark' ? 'bg-accent' : ''}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Escuro</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className={theme === 'system' ? 'bg-accent' : ''}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Sistema</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Versão simples (apenas toggle)
export function ThemeToggleSimple() {
  const { actualTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-8 rounded-full bg-slate-700 dark:bg-slate-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900"
      aria-label="Alternar tema"
    >
      {/* Track background */}
      <span className="absolute inset-0 rounded-full overflow-hidden">
        <span 
          className={`absolute inset-0 transition-transform duration-500 ${
            actualTheme === 'dark' ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
          }}
        />
        <span 
          className={`absolute inset-0 transition-transform duration-500 ${
            actualTheme === 'light' ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 100%)'
          }}
        />
      </span>
      
      {/* Toggle circle */}
      <span 
        className={`absolute top-1 w-6 h-6 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          actualTheme === 'dark' 
            ? 'left-1 bg-slate-800' 
            : 'left-7 bg-white'
        }`}
      >
        {actualTheme === 'dark' ? (
          <Moon className="h-4 w-4 text-amber-400" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500" />
        )}
      </span>
      
      {/* Stars (dark mode) */}
      <span className={`absolute top-2 right-2 transition-opacity duration-300 ${actualTheme === 'dark' ? 'opacity-100' : 'opacity-0'}`}>
        <span className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: 0, right: 0 }} />
        <span className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ top: 4, right: 4, animationDelay: '0.5s' }} />
      </span>
    </button>
  );
}

