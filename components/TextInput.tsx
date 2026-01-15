"use client";

import { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function TextInput({
  label,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <div className="w-full md:flex-1">
      {label && (
        <label className="text-xs text-gray-500 block mb-1">{label}</label>
      )}
      <input
        type="text"
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:bg-primary/5 transition-colors ${className}`}
        {...props}
      />
    </div>
  );
}
