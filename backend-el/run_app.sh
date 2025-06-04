#!/bin/bash
cert_folder="/opt"
openssl s_client -connect "${DB_HOST}:${DB_PORT}" -showcerts </dev/null 2>/dev/null | openssl x509 -outform pem >"$cert_folder/${DB_HOST}.pem" 2>/dev/null || exit 1
openssl x509 -outform der -in "$cert_folder/${DB_HOST}.pem" -out "$cert_folder/${DB_HOST}.der" 2>/dev/null || exit 1
keytool -import -alias "orakey-${DB_HOST}-1" -keystore "${JAVA_HOME}"/lib/security/cacerts -storepass changeit -file "$cert_folder/${DB_HOST}.der" -noprompt >/dev/null 2>&1 || exit 1
# if debug ssl handshake is true add -Djavax.net.debug=ssl:handshake else not needed.
if [ -n "${SSL_DEBUG}" ]; then
  java -Djavax.net.debug=ssl:handshake -Duser.name=REC-ORACLE-EL -Xms512m -Xmx512m -XX:TieredStopAtLevel=4 -XX:+UseParallelGC -XX:MinHeapFreeRatio=20 -XX:MaxHeapFreeRatio=40 -XX:GCTimeRatio=4 -XX:AdaptiveSizePolicyWeight=90 -XX:MaxMetaspaceSize=350m -XX:+ExitOnOutOfMemoryError -jar app.jar
else
  java -Duser.name=REC-ORACLE-EL -Xms512m -Xmx512m -XX:TieredStopAtLevel=4 -XX:+UseParallelGC -XX:MinHeapFreeRatio=20 -XX:MaxHeapFreeRatio=40 -XX:GCTimeRatio=4 -XX:AdaptiveSizePolicyWeight=90 -XX:MaxMetaspaceSize=350m -XX:+ExitOnOutOfMemoryError -jar app.jar
fi
