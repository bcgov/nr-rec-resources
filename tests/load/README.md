# k6 Load

## Steps to run loads tests

1. Install k6 - https://k6.io/docs/get-started/installation/

2. Make `k6_results` folder in project root

3. Choose which test you are going to run in `/app/tests/perf/script.js`.

4. Test it is working correctly by running tests against your local backend
   server running at `http://localhost:8000/`.

5. Change variable `SERVER_HOST` value in Makefile to the route being tested

6. Run `make load_test_backend` to run the test

7. Monitor deployment

8. Results will be in `k6_results` folder in .csv format
