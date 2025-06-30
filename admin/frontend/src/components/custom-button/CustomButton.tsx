import React from "react";
import {
  Button as BootstrapButton,
  ButtonProps as BootstrapButtonProps,
} from "react-bootstrap";
import classNames from "classnames";
import "./CustomButton.scss";

/**
 * CustomButton extends React Bootstrap's Button with project-specific styles and behaviors.
 *
 * @remarks
 * Use this component instead of the default Button for consistent styling across the app.
 *
 * @param props - All props supported by React Bootstrap's Button, plus any custom props.
 * @returns A styled button component.
 */
export const CustomButton: React.FC<BootstrapButtonProps> = ({
  className,
  ...props
}) => {
  return (
    <BootstrapButton
      {...props}
      className={classNames("custom-btn", className)}
    />
  );
};
