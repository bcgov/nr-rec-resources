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
RUN useradd -ms /bin/bash appuser
USER appuser
ENTRYPOINT ["sh", "run_app.sh"]
