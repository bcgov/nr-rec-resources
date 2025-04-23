import exec from "k6/execution";
import http from "k6/http";
// eslint-disable-next-line
import checkStatus from "../utils/checkStatus.js";

const stages = [
  { duration: "5m", target: 25 }, // simulate ramp-up of traffic from 1 to 25 users over 5 minutes.
  { duration: "3m", target: 50 }, // ramp-up to 50 users over 3 minutes (peak hour starts)
  { duration: "10m", target: 50 }, // stay at 50 users for 10 mins (peak hour)
  { duration: "3m", target: 25 }, // ramp-down to 25 users over 3 minutes (peak hour ends)
  { duration: "10m", target: 25 }, // continue at 25 for additional 10 minutes
  { duration: "2m", target: 0 }, // ramp-down to 0 users
];

export const options = {
  scenarios: {
    "recreation-resource-get-id": {
      executor: "ramping-vus",
      stages: stages,
    },
    "recreation-resource-search": {
      executor: "ramping-vus",
      stages: stages,
    },
    "recreation-resource-search-paginated": {
      executor: "ramping-vus",
      stages: stages,
    },
    "recreation-resource-search-filtered": {
      executor: "ramping-vus",
      stages: stages,
    },
    "recreation-resource-search-multi-filter": {
      executor: "ramping-vus",
      stages: stages,
    },
  },
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
  // With 250 vus (50 users per scenario) and 5 scenarios, we will assume 1 request per second per user
  rps: 250, // max requests per second
};

const testGetRoute = (route) => {
  const url = __ENV.SERVER_HOST + route;
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = http.get(url, params);
  checkStatus(res, route, 200);
};

export default function () {
  if (exec.scenario.name === "recreation-resource-get-id") {
    testGetRoute("/v1/recreation-resource/REC204117");
  }
  if (exec.scenario.name === "recreation-resource-search") {
    testGetRoute("/v1/recreation-resource/search");
  }
  if (exec.scenario.name === "recreation-resource-search-paginated") {
    testGetRoute("/v1/recreation-resource/search?page=3");
  }
  if (exec.scenario.name === "recreation-resource-search-filtered") {
    testGetRoute("/v1/recreation-resource/search?filter=tofino");
  }
  if (exec.scenario.name === "recreation-resource-search-multi-filter") {
    testGetRoute(
      "/v1/recreation-resource/search?page=1&district=RDMH&type=IF&access=R",
    );
  }
}
