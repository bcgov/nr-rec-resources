import {
  CustomButton,
  CustomButtonProps,
} from "@/components/custom-button/CustomButton";
import { FC, ReactNode } from "react";

/**
 * IconButton is a wrapper around CustomButton that only uses the leftIcon prop.
 * It hides children and rightIcon for a simplified icon-only button.
 *
 * @param props - All props supported by CustomButton, but only leftIcon is used.
 * @returns A button displaying only the leftIcon.
 */
export interface IconButtonProps
  extends Omit<CustomButtonProps, "children" | "rightIcon" | "leftIcon"> {
  icon: ReactNode;
}

export const IconButton: FC<IconButtonProps> = ({
  icon,
  className,
  ...props
}) => {
  return (
    <CustomButton
      leftIcon={<span className="w-100">{icon}</span>}
      className={className}
      {...props}
    />
  );
};
