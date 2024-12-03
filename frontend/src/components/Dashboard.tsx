import apiService from '@/service/api-service';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from '~/axios';

export default function Dashboard() {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    apiService
      .getAxiosInstance()
      .get('/v1/recreation-resource')
      .then((response: AxiosResponse) => {
        const recreationResources = [];
        for (const resource of response.data) {
          console.log(response);
          const recreationResourceDto = {
            forst_file_id: resource.forst_file_id,
            name: resource.name,
            description: resource.description,
          };
          recreationResources.push(recreationResourceDto);
        }
        setData(recreationResources);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return <div>{JSON.stringify(data)}</div>;
}
