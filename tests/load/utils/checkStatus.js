import { check } from 'k6';
import { Rate } from 'k6/metrics';
export const errorRate = new Rate('errors');

const checkStatus = (response, checkName, statusCode = 200) => {
  const success = check(response, {
    [checkName]: (r) => {
      if (r.status === statusCode) {
        return true;
      } else {
        console.error(
          checkName + ' failed. Incorrect response code.' + r.status,
        );
        return false;
      }
    },
  });
  errorRate.add(!success, { tag1: checkName });
};

export default checkStatus;
