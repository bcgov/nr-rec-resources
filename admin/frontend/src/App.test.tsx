import { it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "./App";

it("renders heading", () => {
  const { getByText } = render(<App />);
  expect(getByText("Vite + React")).toBeTruthy();
});
