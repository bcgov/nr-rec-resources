import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export const reactQueryWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
);
