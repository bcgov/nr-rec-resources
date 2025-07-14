import {
  recResourceDetailStore,
  setRecResourceDetail,
} from "@/pages/rec-resource-page/store/recResourceDetailStore";
import { describe, it, expect, beforeEach } from "vitest";

describe("recResourceDetailStore", () => {
  beforeEach(() => {
    recResourceDetailStore.setState({ recResource: undefined });
  });

  it("sets recResource detail", () => {
    const detail = { id: 1, name: "Test Resource" };
    setRecResourceDetail(detail);
    expect(recResourceDetailStore.state.recResource).toEqual(detail);
  });

  it("sets recResource detail to undefined", () => {
    setRecResourceDetail(undefined);
    expect(recResourceDetailStore.state.recResource).toBeUndefined();
  });
});
