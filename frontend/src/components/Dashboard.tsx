import apiService from '@/service/api-service';
import { useEffect, useState } from 'react';
import type { AxiosResponse } from '~/axios';

export default function Dashboard() {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    apiService
      .getAxiosInstance()
      .get('/v1/users')
      .then((response: AxiosResponse) => {
        const users = [];
        for (const user of response.data) {
          const userDto = {
            id: user.id,
            name: user.name,
            email: user.email,
          };
          users.push(userDto);
        }
        setData(users);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <>
      <h2>CDK Deployment working</h2>
      <p>Random build number: {Math.floor(Math.random() * 90000) + 10000}</p>

      <div>{JSON.stringify(data)}</div>
    </>
  );
}
