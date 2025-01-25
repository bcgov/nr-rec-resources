- This README file provides information on using the backend-el folder to read
  data from an Oracle database, create CSV files from the retrieved data, and
  upload the generated CSV files to AWS S3.

- The main functionalities include:

  1. Connecting to an Oracle database and executing queries to fetch data.
  2. Processing the fetched data and writing it into CSV files.
  3. Uploading the generated CSV files to a specified AWS S3 bucket.

- Dependencies:

  - Quarkus framework for building the application.
  - Oracle JDBC driver for database connectivity.
  - AWS SDK for Java for interacting with AWS S3.
  - Apache Commons CSV or similar library for CSV file creation.

- Usage:

  - Configure the Oracle database connection details and AWS S3 credentials in
    the application properties.
  - Invoke the appropriate methods to fetch data, generate CSV files, and upload
    them to S3.

- Note:
  - Ensure that the necessary permissions are granted for accessing the Oracle
    database and AWS S3 bucket.
  - Handle exceptions and errors appropriately to ensure robust and reliable
    operation.

# Backend EL

### IAM User

https://developer.gov.bc.ca/docs/default/component/public-cloud-techdocs/aws/design-build-and-deploy-an-application/iam-user-service/
