import clsx from 'clsx';
import { FC, ReactNode } from 'react';
import {
  Button as BootstrapButton,
  ButtonProps as BootstrapButtonProps,
  Stack,
} from 'react-bootstrap';
import './CustomButton.scss';
export interface CustomButtonProps extends BootstrapButtonProps {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/**
 * CustomButton extends React Bootstrap's Button with project-specific styles and behaviors.
 *
 * @remarks
 * Use this component instead of the default Button for consistent styling across the app.
 *
 * @param props - All props supported by React Bootstrap's Button, plus any custom props.
 * @returns A styled button component.d
 */
export const CustomButton: FC<CustomButtonProps> = ({
  className,
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  return (
    <BootstrapButton {...props} className={clsx('custom-btn', className)}>
      <Stack direction="horizontal" gap={2} className="custom-btn__stack">
        {leftIcon && (
          <span className="d-flex custom-btn__icon custom-btn__icon--left">
            {leftIcon}
          </span>
        )}
        {children ? (
          <span
            className={clsx('custom-btn__content', {
              'ms-auto': leftIcon,
              'me-auto': rightIcon,
              'flex-grow-1': rightIcon && leftIcon,
            })}
          >
            {children}
          </span>
        ) : null}

        {rightIcon && (
          <span className="d-flex custom-btn__icon custom-btn__icon--right ms-auto">
            {rightIcon}
          </span>
        )}
      </Stack>
    </BootstrapButton>
  );
};
