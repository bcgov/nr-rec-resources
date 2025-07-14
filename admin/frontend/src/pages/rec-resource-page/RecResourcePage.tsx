import { useParams } from "react-router-dom";
import { RecResourcePageContent } from "@/pages/rec-resource-page/components";
import { useGetRecreationResourceById } from "@/services/hooks/recreation-resource-admin/useGetRecreationResourceById";
import { useEffect } from "react";
import { setRecResourceDetail } from "@/pages/rec-resource-page/store/recResourceDetailStore";

export const RecResourcePage = () => {
  const { id: rec_resource_id } = useParams();

  const { data: recResource } = useGetRecreationResourceById(rec_resource_id);

  useEffect(() => {
    setRecResourceDetail(recResource);
  }, [recResource]);

  return <RecResourcePageContent />;
};
