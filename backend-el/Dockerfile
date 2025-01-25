# Stage 1: Build the application
FROM maven:3.8.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21
WORKDIR /app
RUN useradd -ms /bin/bash appuser
USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD curl -f http://localhost:8090/actuator/health || exit 1
COPY --from=build /app/target/*.jar /app/app.jar
RUN java -Djarmode=layertools -jar app.jar extract
ENTRYPOINT ["java", "-cp", "BOOT-INF/classes:BOOT-INF/lib/*", "com.example.YourMainClass"]
