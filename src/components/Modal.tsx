import type { ReactNode } from 'react';
import { Icons } from '../icons';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: string;
}

export function Modal({ title, onClose, children, width = 'max-w-lg' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`bg-card rounded-2xl shadow-2xl w-full ${width} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-[16px] text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {Icons.x}
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, required, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-slate-700">
        {label}
        {required && <span className="text-danger ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[12px] text-slate-400">{hint}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 text-[14px] border rounded-lg bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors ${error ? 'border-danger' : 'border-border'} ${className}`}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-[14px] border rounded-lg bg-white text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors resize-none ${error ? 'border-danger' : 'border-border'} ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 text-[14px] border rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-colors appearance-none ${error ? 'border-danger' : 'border-border'} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
}

export function Btn({ variant = 'primary', size = 'md', className = '', children, ...props }: BtnProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-[13px]', md: 'px-4 py-2 text-[14px]' };
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
    danger: 'bg-danger-bg text-danger border border-danger/20 hover:bg-red-100',
    ghost: 'text-slate-600 hover:bg-slate-100',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
