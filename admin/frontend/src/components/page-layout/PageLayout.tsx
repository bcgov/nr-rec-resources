/**
 * PageLayout constrains content to a max width and provides responsive padding.
 * Use for all pages except the landing page.
 */
import React from "react";
import "./PageLayout.scss";

export const PageLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="page-layout__container">{children}</div>
);
