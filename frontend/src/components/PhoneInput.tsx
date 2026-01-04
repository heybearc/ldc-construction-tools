'use client';

import React, { useState, useEffect } from 'react';
import { Phone } from 'lucide-react';
import { autoFormatPhone, validateAndFormatPhone } from '@/lib/phone-utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  error?: string;
  showValidation?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  label = 'Phone Number',
  placeholder = '(555) 123-4567',
  required = false,
  className = '',
  error,
  showValidation = true,
}: PhoneInputProps) {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string>('');

  useEffect(() => {
    if (touched && showValidation && value) {
      const result = validateAndFormatPhone(value);
      if (!result.isValid) {
        setValidationError(result.error || 'Invalid phone number');
      } else {
        setValidationError('');
      }
    } else {
      setValidationError('');
    }
  }, [value, touched, showValidation]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = autoFormatPhone(e.target.value);
    onChange(formatted);
  };

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      const result = validateAndFormatPhone(value);
      if (result.isValid && result.formatted) {
        onChange(result.formatted);
      }
    }
  };

  const displayError = error || validationError;
  const hasError = !!displayError && touched;

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Phone className={`h-5 w-5 ${hasError ? 'text-red-400' : 'text-gray-400'}`} />
        </div>
        <input
          type="tel"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full pl-10 pr-3 py-2 border rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500
            ${hasError 
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 text-gray-900 placeholder-gray-400'
            }
          `}
        />
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{displayError}</p>
      )}
      {!hasError && value && touched && showValidation && (
        <p className="mt-1 text-sm text-green-600">✓ Valid phone number</p>
      )}
    </div>
  );
}
