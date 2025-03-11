create schema if not exists public;

create extension if not exists "postgis" with schema public;

set search_path to public;

create schema if not exists rst;
