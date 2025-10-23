"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  errorText?: string | null;
}

export default function PasswordInput({ label, errorText, ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className={[
            "w-full rounded-lg border p-2 pr-10",
            "border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          ].join(" ")}
        />
        <button
          type="button"
          aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {errorText && <p className="mt-1 text-sm text-red-600">{errorText}</p>}
    </div>
  );
}
