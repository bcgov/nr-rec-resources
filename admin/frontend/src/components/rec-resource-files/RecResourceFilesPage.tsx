import { useGetRecreationResourceDocs } from "@/services/hooks/recreation-resource-admin/useRecreationResourceDocs";
import { RecreationResourceDocDto } from "@/services/recreation-resource-admin/models";
import { useParams } from "react-router-dom";

export const RecResourceFilesPage = () => {
  const params = useParams();
  const {
      data: docs,
      isFetching,
      error,
    } = useGetRecreationResourceDocs(`${params.id}`);

  console.log(docs);
  return (
    <>
      <h2>Files from: {params.id}</h2>
      {docs.map((doc: RecreationResourceDocDto) => {
        return (
          <div>{`${doc.title}`}</div>
        );
      })}
    </>
  );
}
