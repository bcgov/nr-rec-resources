# Postgresql

## Metadata columns

To add created_at, created_by, updated_at, updated_by columns to a table, use
the `upsert_timestamp_columns` util function. This function takes a schema and
table name and adds the columns to the table.

```sql
set upsert_timestamp_columns('rst', 'my_table');
```

For some tables such as `_code` tables we might not want to track all of this
metadata, in this case we can use the `upsert_timestamp_columns` function with
the `updated_at_only` parameter set to `true`:

```sql
set upsert_timestamp_columns('rst', 'my_table', true);
```

## History tracking with temporal tables

To track changes to a table over time we are using an RDS compatible version of
[Temporal Tables](https://www.postgresql.org/docs/14/tables-temporal.html). This
checks for changes to a row and stores the previous version in a history table
prepended with `_history`.

To enable this feature on a table, we have created a util function called
`setup_temporal_table` that is passed a schema and table name. This function
will create the history table and triggers to track changes to the table.

```sql
select setup_temporal_table('rst', 'my_table');
```

To see historical data for the table, make an update to a row in the table and
then query the history table:

```sql
select * from rst.my_table_history;
```

### Schema Synchronization

When you add or modify columns in your source table, you need to synchronize the
history table to ensure new columns are tracked. We provide utility functions
for this:

**Sync a single table:**

```sql
-- Returns JSON with details of columns added
select sync_temporal_table_schema('rst', 'my_table');
```

**Sync all temporal tables in a schema:**

```sql
-- Syncs all tables with history tables in the schema
select sync_all_temporal_tables('rst');
```

**Auto-sync when setting up temporal tracking:**

```sql
-- The third parameter enables auto-sync if history table exists
select setup_temporal_table('rst', 'my_table', true);
```

The sync functions will:

- Detect missing columns in the history table
- Add them with matching data types and constraints
- Display the column names and types that were added
- Return a JSON object with details of all changes

### Best Practices

> After adding or modifying columns in a source table, always run
> `sync_temporal_table_schema` to ensure the history table stays in sync.
> Include this in your migration scripts after schema changes.

## Prisma Generated SQL Functions

The project uses Prisma's
[TypedSQL](https://www.prisma.io/docs/orm/prisma-client/using-raw-sql/typedsql)
capabilities to generate type definitions and functions for SQL files in the
`prisma/sql` folder. These types are essential for type-safe database operations
but are stored deep within the `node_modules` folder. This generation process
requires a working PostgreSQL server with pre-created tables, which poses a
challenge in our CI/CD process. To generate these types during CI, we would need
to extensively modify the build configurations to create proper tables in the
build containers for the backend.

To make these types accessible in our codebase, we've implemented a script that
copies the generated types and functions to the `./src/prisma-generated-sql`
directory. You can run this process using:

```bash
npm run copy-prisma-generated-sql
```

This script will generate the required types and functions and then copy them
over.

> Note: This script should be run after any new raw SQL files are created in the
> `prisma/sql` folder.
