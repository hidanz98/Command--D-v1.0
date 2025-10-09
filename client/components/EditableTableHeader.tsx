import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditableTableHeaderProps {
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const EditableTableHeader: React.FC<EditableTableHeaderProps> = ({
  value,
  onSave,
  className,
  placeholder = "Digite o texto...",
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
    setEditValue(value);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleDoubleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  if (disabled) {
    return (
      <span className={cn("select-none", className)}>
        {value}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "relative group min-h-[24px] flex items-center",
        !isEditing && "cursor-pointer",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <div className="flex items-center gap-2 w-full">
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            placeholder={placeholder}
            className="bg-cinema-dark-lighter border border-cinema-yellow/50 text-white rounded px-2 py-1 text-sm min-w-0 flex-1 focus:outline-none focus:border-cinema-yellow"
          />
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1 text-green-400 hover:text-green-300 transition-colors"
              title="Salvar (Enter)"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
              title="Cancelar (Esc)"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 w-full group">
          <span className="select-none flex-1">
            {value || placeholder}
          </span>
          {(isHovered || isEditing) && (
            <button
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 text-cinema-yellow/70 hover:text-cinema-yellow transition-all"
              title="Clique duplo para editar"
            >
              <Edit className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
