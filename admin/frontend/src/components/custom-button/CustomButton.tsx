import classNames from "classnames";
import React from "react";
import {
  Button as BootstrapButton,
  ButtonProps as BootstrapButtonProps,
  Stack,
} from "react-bootstrap";
import "./CustomButton.scss";

export interface CustomButtonProps extends BootstrapButtonProps {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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
export const CustomButton: React.FC<CustomButtonProps> = ({
  className,
  leftIcon,
  rightIcon,
  children,
  ...props
}) => {
  return (
    <BootstrapButton {...props} className={classNames("custom-btn", className)}>
      <Stack direction="horizontal" gap={2} className="custom-btn__stack">
        {leftIcon && (
          <span className="custom-btn__icon custom-btn__icon--left">
            {leftIcon}
          </span>
        )}
        <span className="custom-btn__content">{children}</span>
        {rightIcon && (
          <span className="custom-btn__icon custom-btn__icon--right">
            {rightIcon}
          </span>
        )}
      </Stack>
    </BootstrapButton>
  );
};
