// VITE_DEPLOYMENT_ENV is set per env at deploy time. Locally it's unset, so we
// fall back to Vite's MODE, same as EnvironmentBanner does.
const NON_PROD_ENVIRONMENTS = new Set(['dev', 'development', 'test']);

// Anything we don't recognise counts as prod. Better to hide pre-release UI by
// mistake than to show it by mistake.
export function isProd(): boolean {
  const env = import.meta.env.VITE_DEPLOYMENT_ENV || import.meta.env.MODE;
  return !NON_PROD_ENVIRONMENTS.has(env);
}
