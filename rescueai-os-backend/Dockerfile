# --- Build stage ---
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/rescueai-os-backend-*.jar app.jar

# Render injects PORT at runtime; Spring Boot reads SERVER_PORT
# We also accept the explicit SERVER_PORT env var for docker-compose usage
ENV SERVER_PORT=8081
EXPOSE 8081

ENTRYPOINT ["java", \
  "-Dserver.port=${SERVER_PORT}", \
  "-jar", "app.jar"]
