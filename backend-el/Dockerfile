# Stage 1: Build the application
FROM maven:3-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests
# Stage 2: Run the application
FROM eclipse-temurin:21
WORKDIR /app
ARG DEPENDENCY=/app/target/
COPY --from=build ${DEPENDENCY}/*.jar /app/app.jar
COPY run_app.sh .
RUN apt-get update && apt-get install -y --no-install-recommends

# RELAX SECURITY: Enable legacy TLS versions and algorithms (e.g., TLS 1.0/1.1, SHA1, DH keys).
# This replaces the entire multi-line 'jdk.tls.disabledAlgorithms' block with a minimal
# restriction (SSLv3 only) to allow connections to legacy servers/databases.
RUN sed -i '/jdk.tls.disabledAlgorithms=/,/[^\\]$/c jdk.tls.disabledAlgorithms=SSLv3' "$JAVA_HOME/conf/security/java.security"

RUN chmod -R 777 /opt && chmod -R 777 /etc/ca-certificates && chmod -R 777 "${JAVA_HOME}"/lib/security
RUN useradd -ms /bin/bash appuser
USER appuser
ENTRYPOINT ["sh", "run_app.sh"]
