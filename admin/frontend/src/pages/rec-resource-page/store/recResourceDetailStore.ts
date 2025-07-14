import { RecreationResourceDetailModel } from "@/custom-models";
import { Store } from "@tanstack/store";

export interface RecResourceDetailState {
  recResource?: RecreationResourceDetailModel;
}

export const recResourceDetailStore = new Store<RecResourceDetailState>({
  recResource: undefined,
});

export function setRecResourceDetail(recResource?: any) {
  recResourceDetailStore.setState((prev) => ({
    ...prev,
    recResource,
  }));
}
