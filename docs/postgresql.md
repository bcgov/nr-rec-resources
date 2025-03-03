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
set setup_temporal_table('rst', 'my_table');
```

To see historical data for the table, make an update to a row in the table and
then query the history table:

```sql
select * from rst.my_table_history;
```

> [!CAUTION] > `setup_temporal_table` sets up a table for history tracking at
> that point in time. If you add or change a column you will have to manually
> update the history table as well. If you add a column and forget to add it to
> the history table then it won't be tracked.

> [!NOTE] Useful information that users should know, even when skimming content.
