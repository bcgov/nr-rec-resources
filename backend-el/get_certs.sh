#!/bin/bash

#check for environment variables
if [ -z "$DB_HOST" ]; then
  echo "DB_HOST is not set"
  exit 1
fi
if [ -z "$DB_PORT" ]; then
  echo "DB_PORT is not set"
  exit 1
fi
cert_folder="/app/cert"
cert_file="jssecacerts"
certSecret=$CERT_SECRET
echo "The certSecret is $certSecret"
mkdir -p $cert_folder
#The DB_SECRET is a secret that you have to set in the environment variables of the container, it is stored in github secrets and created manually and is not linked to the Database credentials.
generate_cert() {

  echo "I will try to get the ${DB_HOST}-1 cert"
  echo "Connecting to ${DB_HOST}:${DB_PORT}"

  openssl s_client -connect "${DB_HOST}:${DB_PORT}" -showcerts </dev/null | openssl x509 -outform pem >"$cert_folder/${DB_HOST}.pem" || exit 1
  openssl x509 -outform der -in "$cert_folder/${DB_HOST}.pem" -out "$cert_folder/${DB_HOST}.der" || exit 1
  keytool -import -alias "${DB_HOST}" -keystore $cert_folder/$cert_file -file "$cert_folder/${DB_HOST}.der" -storepass "${certSecret}" -noprompt || exit 1

  echo "Generated $cert_file and copied it to $cert_folder."
}

if [ "$(ls -A $cert_folder)" ]; then
  echo "The $cert_folder folder is not empty."
  if [ -e "$cert_folder/$cert_file" ]; then
    echo "The "$cert_folder/$cert_file" certificate file is present."
  else
    generate_cert
  fi
else
  generate_cert
fi
