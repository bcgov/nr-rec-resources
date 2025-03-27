# k6 Load Testing

## Steps to run loads tests

1. Install k6 - https://k6.io/docs/get-started/installation/

2. Test it is working correctly by running tests against your local development
   server

   - The backend server should be running at `http://localhost:8000/`
   - Run `cd tests/load && make load_test` to run the tests

3. Change variable `SERVER_HOST` value in Makefile to the API Gateway route in
   AWS

   - You may have to disable rate limiting on the API Gateway to run the tests

   - `SAVE_RESULTS` variable can be set to `true` to save the results in a .csv
     file located in the `k6_results` folder

4. Once the proper variable has been set re-run `make load_test`

5. Monitor deployment

6. Results will be in `k6_results` folder in .csv format
