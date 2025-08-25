import clsx from 'clsx';
import { FC, ReactNode } from 'react';
import {
  Button as BootstrapButton,
  ButtonProps as BootstrapButtonProps,
  Stack,
} from 'react-bootstrap';

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
 * @returns A styled button component.
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
          <span className="d-flex custom-btn__icon custom-btn__icon--left flex-grow-1">
            {leftIcon}
          </span>
        )}
        {children ? (
          <span className="custom-btn__content">{children}</span>
        ) : null}

        {rightIcon && (
          <span className="d-flex custom-btn__icon custom-btn__icon--right flex-grow-1">
            {rightIcon}
          </span>
        )}
      </Stack>
    </BootstrapButton>
  );
};
