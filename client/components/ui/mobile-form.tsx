import { ReactNode, forwardRef } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { useDeviceDetection } from "@/hooks/use-device-detection";
import { cn } from "@/lib/utils";

// Form Container
interface MobileFormProps {
  children: ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

export function MobileForm({ children, className, onSubmit }: MobileFormProps) {
  const device = useDeviceDetection();

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "space-y-6",
        device.isMobile ? "space-y-4" : "",
        className
      )}
    >
      {children}
    </form>
  );
}

// Form Section
interface FormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  const device = useDeviceDetection();

  return (
    <div className={cn("space-y-4", device.isMobile ? "space-y-3" : "", className)}>
      {title && (
        <div className={cn("space-y-1", device.isMobile ? "space-y-0.5" : "")}>
          <h3 className={cn(
            "font-semibold text-white",
            device.isMobile ? "text-lg" : "text-xl"
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "text-gray-400",
              device.isMobile ? "text-sm" : "text-base"
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={cn(
        "space-y-4",
        device.isMobile ? "space-y-3" : ""
      )}>
        {children}
      </div>
    </div>
  );
}

// Field Group
interface FieldGroupProps {
  label: string;
  description?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FieldGroup({ 
  label, 
  description, 
  required, 
  error, 
  children, 
  className 
}: FieldGroupProps) {
  const device = useDeviceDetection();

  return (
    <div className={cn("space-y-2", device.isMobile ? "space-y-1.5" : "", className)}>
      <div className="space-y-1">
        <Label className={cn(
          "text-white font-medium",
          device.isMobile ? "text-sm" : "text-base"
        )}>
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        {description && (
          <p className={cn(
            "text-gray-400",
            device.isMobile ? "text-xs" : "text-sm"
          )}>
            {description}
          </p>
        )}
      </div>
      {children}
      {error && (
        <p className={cn(
          "text-red-400",
          device.isMobile ? "text-xs" : "text-sm"
        )}>
          {error}
        </p>
      )}
    </div>
  );
}

// Mobile-optimized Input
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightIcon?: ReactNode;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ className, icon, rightIcon, ...props }, ref) => {
    const device = useDeviceDetection();

    return (
      <div className="relative">
        {icon && (
          <div className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400",
            device.isMobile ? "left-3" : "left-3"
          )}>
            {icon}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(
            "bg-cinema-dark-lighter border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow",
            icon ? "pl-10" : "",
            rightIcon ? "pr-10" : "",
            device.isMobile ? "h-12 text-base" : "h-10",
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400",
            device.isMobile ? "right-3" : "right-3"
          )}>
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

MobileInput.displayName = "MobileInput";

// Mobile-optimized Textarea
interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  autoResize?: boolean;
}

export const MobileTextarea = forwardRef<HTMLTextAreaElement, MobileTextareaProps>(
  ({ className, autoResize = false, ...props }, ref) => {
    const device = useDeviceDetection();

    return (
      <Textarea
        ref={ref}
        className={cn(
          "bg-cinema-dark-lighter border-cinema-gray-light text-white placeholder:text-gray-400 focus:border-cinema-yellow resize-none",
          device.isMobile ? "min-h-[120px] text-base" : "min-h-[100px]",
          autoResize ? "resize-y" : "",
          className
        )}
        {...props}
      />
    );
  }
);

MobileTextarea.displayName = "MobileTextarea";

// Mobile-optimized Select
interface MobileSelectProps {
  placeholder?: string;
  children: ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function MobileSelect({ 
  placeholder, 
  children, 
  value, 
  onValueChange, 
  className 
}: MobileSelectProps) {
  const device = useDeviceDetection();

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={cn(
        "bg-cinema-dark-lighter border-cinema-gray-light text-white focus:border-cinema-yellow",
        device.isMobile ? "h-12 text-base" : "h-10",
        className
      )}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn(
        "bg-cinema-dark-lighter border-cinema-gray-light",
        device.isMobile ? "max-h-[200px]" : ""
      )}>
        {children}
      </SelectContent>
    </Select>
  );
}

// Form Actions
interface FormActionsProps {
  children: ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

export function FormActions({ children, className, align = "right" }: FormActionsProps) {
  const device = useDeviceDetection();

  return (
    <div className={cn(
      "flex gap-3 pt-6 border-t border-cinema-gray-light",
      device.isMobile ? "flex-col pt-4" : "flex-row",
      {
        "justify-start": align === "left",
        "justify-center": align === "center",
        "justify-end": align === "right",
      },
      className
    )}>
      {children}
    </div>
  );
}

// Mobile-optimized Button
interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "default" | "lg";
  icon?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    icon, 
    loading, 
    fullWidth,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const device = useDeviceDetection();

    return (
      <Button
        ref={ref}
        variant={variant}
        disabled={disabled || loading}
        className={cn(
          device.isMobile ? "h-12 text-base font-medium" : "",
          fullWidth || device.isMobile ? "w-full" : "",
          className
        )}
        {...props}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Carregando...
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {icon}
            {children}
          </div>
        )}
      </Button>
    );
  }
);

MobileButton.displayName = "MobileButton";

// Grid Layout for forms
interface FormGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

export function FormGrid({ children, columns = 2, className }: FormGridProps) {
  const device = useDeviceDetection();

  return (
    <div className={cn(
      "grid gap-4",
      device.isMobile ? "grid-cols-1 gap-3" : {
        "grid-cols-1": columns === 1,
        "grid-cols-2": columns === 2,
        "grid-cols-3": columns === 3,
      },
      className
    )}>
      {children}
    </div>
  );
}

// File Upload component
interface FileUploadProps {
  label: string;
  accept?: string;
  multiple?: boolean;
  onChange?: (files: FileList | null) => void;
  className?: string;
}

export function FileUpload({ label, accept, multiple, onChange, className }: FileUploadProps) {
  const device = useDeviceDetection();

  return (
    <div className={cn(
      "border-2 border-dashed border-cinema-gray-light rounded-lg p-6 text-center hover:border-cinema-yellow/50 transition-colors",
      device.isMobile ? "p-4" : "",
      className
    )}>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => onChange?.(e.target.files)}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className={cn(
          "cursor-pointer flex flex-col items-center gap-2",
          device.isMobile ? "gap-1" : ""
        )}
      >
        <div className={cn(
          "w-12 h-12 bg-cinema-gray/50 rounded-lg flex items-center justify-center",
          device.isMobile ? "w-10 h-10" : ""
        )}>
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <p className={cn(
            "text-white font-medium",
            device.isMobile ? "text-sm" : ""
          )}>
            {label}
          </p>
          <p className={cn(
            "text-gray-400",
            device.isMobile ? "text-xs" : "text-sm"
          )}>
            Clique aqui ou arraste arquivos
          </p>
        </div>
      </label>
    </div>
  );
}
