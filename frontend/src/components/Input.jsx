import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
    label,
    error,
    hint,
    icon: Icon,
    className = '',
    ...props 
}, ref) => {
    const inputClasses = [
        'form-input',
        error ? 'error' : '',
        Icon ? 'pl-10' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className="form-group">
            {label && (
                <label className="form-label" htmlFor={props.id || props.name}>
                    {label}
                </label>
            )}
            <div className="input-group">
                {Icon && <Icon className="input-icon" />}
                <input
                    ref={ref}
                    className={inputClasses}
                    {...props}
                />
            </div>
            {error && <span className="form-error">{error}</span>}
            {hint && !error && <span className="form-hint">{hint}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;