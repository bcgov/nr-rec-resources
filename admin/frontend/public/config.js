// Runtime config — overwritten by entrypoint.sh in Docker.
// During local dev (npm run dev), window.__CONFIG__ remains undefined
// and AuthService falls back to import.meta.env.VITE_* values.
