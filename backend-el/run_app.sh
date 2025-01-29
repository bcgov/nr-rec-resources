#!/bin/bash
cert_folder="/opt"
openssl s_client -connect "${DB_HOST}:${DB_PORT}" -showcerts </dev/null | openssl x509 -outform pem >"$cert_folder/${DB_HOST}.pem" || exit 1
openssl x509 -outform der -in "$cert_folder/${DB_HOST}.pem" -out "$cert_folder/${DB_HOST}.der" || exit 1
keytool -import -alias "orakey-${DB_HOST}-1" -keystore "${JAVA_HOME}"/lib/security/cacerts -storepass changeit -file "$cert_folder/${DB_HOST}.der" -noprompt || exit 1
echo "JDBC URL is ${JDBC_URL}"
echo "Starting Java APP"
# if debug ssl handshake is true add -Djavax.net.debug=ssl:handshake else not needed.
if [ -n "${SSL_DEBUG}" ]; then
  java -Djavax.net.debug=ssl:handshake -Duser.name=REC-ORACLE-EL -Xms512m -Xmx512m -jar app.jar
else
  java -Duser.name=REC-ORACLE-EL -Xms512m -Xmx512m -jar app.jar
fi
