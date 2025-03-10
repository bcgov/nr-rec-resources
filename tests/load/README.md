# k6 Load Testing

## Steps to run loads tests

1. Install k6 - https://k6.io/docs/get-started/installation/

2. Choose which test you are going to run in `/app/tests/load/`

3. Test it is working correctly by running tests against your local development
   server

   - The frontend server should be running at `http://localhost:3000/`
   - The backend server should be running at `http://localhost:8000/`

4. Run `make load_test_frontend` or `make load_test_backend` to run the test

5. Change variable `SERVER_HOST` or `FRONTEND_URL` value in Makefile to the
   route in AWS being tested

6. Once the proper variables have been set re-run `make load_test_frontend` or
   `make load_test_backend`

7. Monitor deployment

8. Results will be in `k6_results` folder in .csv format
