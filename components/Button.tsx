```tsx
import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, children, type = 'button', className }) => (
  <button
    onClick={onClick}
    type={type}
    className={`${styles.button} ${className}`}
  >
    {children}
  </button>
);

export default Button;
```