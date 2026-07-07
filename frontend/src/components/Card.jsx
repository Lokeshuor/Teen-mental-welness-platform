import React from 'react';

const Card = ({ 
    children, 
    className = '',
    hoverable = false,
    padding = 'lg',
    ...props 
}) => {
    const paddings = {
        none: '',
        sm: 'p-sm',
        md: 'p-md',
        lg: 'p-lg',
        xl: 'p-xl',
    };

    const classes = [
        'card',
        hoverable ? 'card-hoverable' : '',
        paddings[padding] || 'p-lg',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};

export default Card;