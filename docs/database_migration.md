# Migrating RDS Postgres database between AWS environments

Due to security guardrails in AWS LZA we can't share Aurora RDS Postgres backup
snapshots with other environments. To get around this we will connect to an EC2
bastion host, back up the database with `pg_dump` then connect to the new
database via another bastion host and use `pg_restore` to migrate the database
to the new environment.

## Setting up the basion host

Set up the bastion host by following the instructions here:
[Setup AWS EC2 instance to connect to RDS Postgres Database](https://github.com/bcgov/nr-forests-access-management/wiki/Setup-AWS-EC2-instance-to-connect-to-RDS-Postgres-Database)

Install AWS Session Manager plugin for your terminal:
[AWS Session Manager plugin](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html)

## Backing up the database

> If the database is being actively used you may want to consider shutting down
> the application to ensure a consistent backup.

```bash
aws ssm start-session \
  --target BASTION_HOST_ID \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters '{"host":[RDS_CLUSTER_ENDPOINT],"portNumber":["5432"],"localPortNumber":["15432"]}'
```

To verify the connection is working run this in another terminal:

psql -h 127.0.0.1 -p 15432 -U sysadmin -d rst

> get `rds-db-credentials` password from aws secrets manager

You can either add the password in the prompt or add it to the environment using

`export PGPASSWORD=`

Once the connection to RDS is confirmed run this to backup the database:
`pg_dump -h 127.0.0.1 -p 15432 -U sysadmin -d rst -Fc --exclude-schema=fta -f rst_backup.dump`

## Restore backup

aws ssm start-session \
 --target BASTION_HOST_ID \
 --document-name AWS-StartPortForwardingSessionToRemoteHost \
 --parameters
'{"host":[RDS_CLUSTER_ENDPOINT],"portNumber":["5432"],"localPortNumber":["15432"]}'

> Verify that you are in the correct environment before restoring the database
> or risk breaking the target environment.

manually drop the rst schema and run this to backup the entire database:
`pg_restore -h localhost -p 15432 -U sysadmin  -d rst -v rst_backup.dump`
