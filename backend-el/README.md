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

This project uses Quarkus, the Supersonic Subatomic Java Framework.

If you want to learn more about Quarkus, please visit its website:
<https://quarkus.io/>.

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_** Quarkus now ships with a Dev UI, which is available in dev mode
> only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the
`target/quarkus-app/lib/` directory.

The application is now runnable using
`java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using
`java -jar target/*-runner.jar`.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build
in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with:
`./target/rst-fta-oracle-csv-importer-1.0.0-SNAPSHOT-runner`

If you want to learn more about building native executables, please consult
<https://quarkus.io/guides/maven-tooling>.

## Related Guides

- REST ([guide](https://quarkus.io/guides/rest)): A Jakarta REST implementation
  utilizing build time processing and Vert.x. This extension is not compatible
  with the quarkus-resteasy extension, or any of the extensions that depend on
  it.
- REST Jackson ([guide](https://quarkus.io/guides/rest#json-serialisation)):
  Jackson serialization support for Quarkus REST. This extension is not
  compatible with the quarkus-resteasy extension, or any of the extensions that
  depend on it
- Hibernate ORM with Panache
  ([guide](https://quarkus.io/guides/hibernate-orm-panache)): Simplify your
  persistence code for Hibernate ORM via the active record or the repository
  pattern
- Amazon S3
  ([guide](https://docs.quarkiverse.io/quarkus-amazon-services/dev/amazon-s3.html)):
  Connect to Amazon S3 cloud storage
- JDBC Driver - Oracle ([guide](https://quarkus.io/guides/datasource)): Connect
  to the Oracle database via JDBC

## Provided Code

### Hibernate ORM

Create your first JPA entity

[Related guide section...](https://quarkus.io/guides/hibernate-orm)

[Related Hibernate with Panache section...](https://quarkus.io/guides/hibernate-orm-panache)

### REST

Easily start your REST Web Services

[Related guide section...](https://quarkus.io/guides/getting-started-reactive#reactive-jax-rs-resources)
