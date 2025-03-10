import exec from "k6/execution";
import http from "k6/http";
// eslint-disable-next-line
import checkStatus from "../utils/checkStatus.js";

const stages = [
  { duration: "5m", target: 20 }, // simulate ramp-up of traffic from 1 to 20 users over 5 minutes.
  { duration: "10m", target: 20 }, // stay at 20 users for 10 minutes
  { duration: "3m", target: 40 }, // ramp-up to 40 users over 3 minutes (peak hour starts)
  { duration: "2m", target: 40 }, // stay at 40 users for short amount of time (peak hour)
  { duration: "3m", target: 15 }, // ramp-down to 20 users over 3 minutes (peak hour ends)
  { duration: "10m", target: 15 }, // continue at 20 for additional 10 minutes
  { duration: "2m", target: 0 }, // ramp-down to 0 users
];

export const options = {
  scenarios: {
    "recreation-resource": {
      executor: "ramping-vus",
      stages: stages,
    },
    "recreation-resource-search": {
      executor: "ramping-vus",
      stages: stages,
    },
    "recreation-resource-by-id": {
      executor: "ramping-vus",
      stages: stages,
    },
  },
  thresholds: {
    http_req_duration: ["p(99)<1500"], // 99% of requests must complete below 1.5s
  },
  rps: 50,
};

const testGetRoute = (route) => {
  const url = __ENV.FRONTEND_URL + route;
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const res = http.get(url, params);
  checkStatus(res, route, 200);
};

export default function () {
  if (exec.scenario.name === "recreation-resource") {
    testGetRoute("/");
  }
  if (exec.scenario.name === "recreation-resource-search") {
    testGetRoute("/search");
  }
  if (exec.scenario.name === "recreation-resource-by-id") {
    testGetRoute("/resource/REC204117");
  }
}
