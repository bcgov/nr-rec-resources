# Stage 1: Build the application
FROM maven:3-eclipse-temurin-21@sha256:933900d8738eab72ddebb7ad971fc9bca91ae6bc4c7b6d6bbc17fb3609f5e64b AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests
# Stage 2: Run the application
FROM eclipse-temurin:21@sha256:459772aa6b6e65953bac0496e319b8d4d719e1c05826f8495c99796cef5d2f49
WORKDIR /app
ARG DEPENDENCY=/app/target/
COPY --from=build ${DEPENDENCY}/*.jar /app/app.jar
COPY run_app.sh .
RUN apt-get update && apt-get install -y --no-install-recommends
RUN chmod -R 777 /opt && chmod -R 777 /etc/ca-certificates && chmod -R 777 "${JAVA_HOME}"/lib/security
RUN useradd -ms /bin/bash appuser
USER appuser
ENTRYPOINT ["sh", "run_app.sh"]
