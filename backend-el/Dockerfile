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
COPY --from=build /app/target/*.jar /app/app.jar
RUN java -Djarmode=layertools -jar app.jar extract
ENTRYPOINT ["java", "-cp", "BOOT-INF/classes:BOOT-INF/lib/*", "com.example.YourMainClass"]
