-- Mapping helpers shared by every path that imports FTA notes.

-- FTA timestamps arrive as two-digit-year YY-MM-DD strings, pivoted at 50.
create or replace function fta_note_pivot_date(yymmdd text)
returns date
language sql
immutable
as $$
    select case
        when yymmdd is null or btrim(yymmdd) = '' then null
        else make_date(
            case
                when split_part(yymmdd, '-', 1)::int <= 49
                    then 2000 + split_part(yymmdd, '-', 1)::int
                else 1900 + split_part(yymmdd, '-', 1)::int
            end,
            split_part(yymmdd, '-', 2)::int,
            split_part(yymmdd, '-', 3)::int
        )
    end;
$$;

comment on function fta_note_pivot_date(text) is 'Converts an FTA YY-MM-DD string to a date, pivoting two-digit years at 50.';

-- body holds HTML, so FTA plain text has to be escaped before its line breaks
-- become <br>.
create or replace function fta_note_to_html(src text)
returns text
language sql
immutable
as $$
    select '<p>' ||
        regexp_replace(
            replace(
                replace(
                    replace(coalesce(src, ''), '&', '&amp;'),
                    '<', '&lt;'
                ),
                '>', '&gt;'
            ),
            E'\r\n|\r|\n', '<br>', 'g'
        )
    || '</p>';
$$;

comment on function fta_note_to_html(text) is 'Escapes FTA plain text and converts its line breaks to <br>, wrapped in a single paragraph.';
