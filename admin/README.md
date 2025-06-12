# NR Rec Resources Admin

This repository contains the administration interface for the NR Rec Resources
system.

## Authentication & Authorization

- [Doc link](docs/auth/auth.md) - Details about the authentication
  implementation using BC Gov SSO (Keycloak)

## Data Fetching

This project uses
[TanStack React Query](https://tanstack.com/query/latest/docs/framework/react/overview)
for data fetching and caching. The `QueryClientProvider` is set up in
`src/App.tsx`.
