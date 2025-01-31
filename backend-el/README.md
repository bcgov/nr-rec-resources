# Backend EL

## FTA Oracle to Rec Resources S3 Exporter Using Spring Boot

- This README file provides information on using the backend-el folder to read
  data from an Oracle database, create CSV files from the retrieved data, and
  upload the generated CSV files to AWS S3.

- The main functionalities include:

  1. Connecting to an Oracle database and executing queries to fetch data.
  2. Processing the fetched data and writing it into CSV files.
  3. Uploading the generated CSV files to a specified AWS S3 bucket.

- Dependencies:

  - Spring Boot framework for building the application.
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

### Project Structure

```
backend-el/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── ca/bc/gov/nrs/environment
│   │   │       ├── entities/         # DB entities
│   │   │       ├── repositories/     # DB repositories to do crud against entities
│   │   │       ├── service/          # Main logic to go through each entity and process them
│   │   │       ├── AWSConfig.java    # Contains the logic to provide a reusable s3 instance.
|   |   |       └── FtaRstExporterApplication.java # main entry of applicaton
│   │   └── resources/
│   │       ├── application.properties             # Main configuration file
│   │       ├── application-local.properties       # Local configuration (gitignored)
│   │       └── application-openshift.properties   # OpenShift configuration
├── uploads/                                       # Local CSV output directory for generated files
├── Dockerfile                                     # Container build configuration
├── pom.xml                                        # Maven project configuration
└── README.md                                      # Project documentation
```

### Running Locally using docker

- switch to `backend-el` folder.
- create application-local.properties file(copy application.properties file and
  replace env vars with actual values from looking at openshift), this file is
  ignored in git
- Build the image with command `docker build -t backend-el:latest .`
- Make sure you are on VPN and the oracle credentials are set which has proper
  read access to objects
- Run this command to run the docker image
  `docker run -e spring_profiles_active=local -v ./uploads:/uploads backend-el:latest`

### OpenShift Deployment.

- The recent upgrade had broken the pipeline token creation which the GHA
  workflow uses to deploy to OpenShift.
- The following secret yaml needs to be run manually in the oc namespace for
  pipeline token to be created, <b><u>if there is no `pipeline-token-<name>` in
  the secrets</u></b>

```yaml
kind: Secret
apiVersion: v1
metadata:
  name: pipeline-token-<name>
  namespace: <ns>-<env>
  annotations:
    kubernetes.io/service-account.name: "pipeline"
type: kubernetes.io/service-account-token
```

- Once the token is populated that is copied to GHA secrets which is used in the
  [workflow](../.github/workflows/build-deploy-el-openshift.yml)
- [The AWS secret is created outside of this helm chart, as it is managed differently and auto rotated](../.github/workflows/openshift-oracle-s3-sync.yml)

### IAM User

- This Extract process relies on this IAM user creation and also associated
  roles and permission given to the user.
  https://developer.gov.bc.ca/docs/default/component/public-cloud-techdocs/aws/design-build-and-deploy-an-application/iam-user-service/
