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
RUN useradd -ms /bin/bash appuser
USER appuser
ENTRYPOINT ["java","-Duser.name=REC-ORACLE-EL","-Xms512m","-Xmx512m" ,"-jar","app.jar"]
