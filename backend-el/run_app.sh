#!/bin/bash
keytool -list -v -keystore /app/cert/jssecacerts -alias "${DB_HOST}" -storepass "${CERT_SECRET}"
echo "JDBC URL is ${JDBC_URL}"
echo "Starting Java APP"
java -Djavax.net.debug=ssl:handshake -Duser.name=REC-ORACLE-EL -Xms512m -Xmx512m -jar app.jar
