import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Accessible Form Component
 * WCAG 2.2 compliant form with validation, error handling, and screen reader support
 * 
 * Features:
 * - Keyboard navigation
 * - ARIA labels and descriptions
 * - Live validation feedback
 * - Error message announcements
 * - Focus management
 */

export default function AccessibleForm({ onSubmit, fields, submitLabel = "Submit" }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

  /**
   * Validate individual field based on field configuration
   */
  const validateField = (field, value) => {
    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.minLength && value && value.length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }

    if (field.maxLength && value && value.length > field.maxLength) {
      return `${field.label} must be no more than ${field.maxLength} characters`;
    }

    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return field.patternMessage || `${field.label} format is invalid`;
      }
    }

    if (field.validate) {
      return field.validate(value);
    }

    return null;
  };

  /**
   * Handle field change with live validation
   */
  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate if field has been touched
    if (touched[fieldName]) {
      const field = fields.find(f => f.name === fieldName);
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  /**
   * Handle field blur - mark as touched and validate
   */
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const field = fields.find(f => f.name === fieldName);
    const value = formData[fieldName];
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  /**
   * Handle form submission with full validation
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    let hasErrors = false;

    fields.forEach(field => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}));

    if (hasErrors) {
      setSubmitStatus('error');
      // Announce error to screen readers
      const errorMessage = Object.values(newErrors).join('. ');
      announceToScreenReader(`Form submission failed. ${errorMessage}`);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      await onSubmit(formData);
      setSubmitStatus('success');
      announceToScreenReader('Form submitted successfully');
      
      // Reset form after success
      setTimeout(() => {
        setFormData({});
        setTouched({});
        setSubmitStatus(null);
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      announceToScreenReader('Form submission failed. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Announce message to screen readers using live region
   */
  const announceToScreenReader = (message) => {
    const liveRegion = document.getElementById('form-live-region');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  };

  /**
   * Render individual form field based on type
   */
  const renderField = (field) => {
    const hasError = touched[field.name] && errors[field.name];
    const fieldId = `field-${field.name}`;
    const errorId = `error-${field.name}`;
    const descriptionId = field.description ? `desc-${field.name}` : undefined;

    const commonProps = {
      id: fieldId,
      name: field.name,
      value: formData[field.name] || '',
      onChange: (e) => handleChange(field.name, e.target.value),
      onBlur: () => handleBlur(field.name),
      required: field.required,
      disabled: isSubmitting,
      'aria-invalid': hasError ? 'true' : 'false',
      'aria-describedby': [descriptionId, hasError ? errorId : null].filter(Boolean).join(' ') || undefined,
      className: hasError ? 'border-red-500' : ''
    };

    return (
      <div key={field.name} className="space-y-2">
        <label htmlFor={fieldId} className="block text-sm font-semibold text-gray-300">
          {field.label}
          {field.required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
        </label>

        {field.description && (
          <p id={descriptionId} className="text-xs text-gray-500">
            {field.description}
          </p>
        )}

        {field.type === 'textarea' ? (
          <Textarea {...commonProps} rows={field.rows || 4} />
        ) : field.type === 'select' ? (
          <Select
            value={formData[field.name] || ''}
            onValueChange={(value) => handleChange(field.name, value)}
            onOpenChange={(open) => !open && handleBlur(field.name)}
            required={field.required}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id={fieldId}
              aria-invalid={hasError ? 'true' : 'false'}
              aria-describedby={hasError ? errorId : undefined}
              className={hasError ? 'border-red-500' : ''}
            >
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            {...commonProps}
            type={field.type || 'text'}
            placeholder={field.placeholder}
            minLength={field.minLength}
            maxLength={field.maxLength}
          />
        )}

        {hasError && (
          <div
            id={errorId}
            className="flex items-center gap-2 text-sm text-red-400"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{errors[field.name]}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Screen reader live region for announcements */}
      <div
        id="form-live-region"
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {/* Form fields */}
      {fields.map(field => renderField(field))}

      {/* Submit button */}
      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary flex-1"
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>

        {submitStatus === 'success' && (
          <div className="flex items-center gap-2 text-green-400" role="status">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm">Success!</span>
          </div>
        )}
      </div>

      {/* General form error */}
      {submitStatus === 'error' && Object.keys(errors).length > 0 && (
        <div
          className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-sm text-red-400">
            {Object.values(errors).filter(Boolean).map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}

/**
 * Example usage:
 * 
 * const fields = [
 *   {
 *     name: 'email',
 *     label: 'Email Address',
 *     type: 'email',
 *     required: true,
 *     description: 'We will never share your email'
 *   },
 *   {
 *     name: 'message',
 *     label: 'Message',
 *     type: 'textarea',
 *     required: true,
 *     minLength: 10,
 *     maxLength: 500
 *   }
 * ];
 * 
 * <AccessibleForm
 *   fields={fields}
 *   onSubmit={async (data) => { ... }}
 *   submitLabel="Send Message"
 * />
 */