/**
 * EnvironmentBanner component displays the current deployment environment
 * (dev or test) with appropriate styling. It's hidden in production.
 */
export const EnvironmentBanner = () => {
  const env = import.meta.env.VITE_DEPLOYMENT_ENV || import.meta.env.MODE;
  const isLocal =
    import.meta.url.includes('localhost') ||
    import.meta.url.includes('127.0.0.1');

  // Show banner for dev and test environments (app_env from GitHub Actions uses 'dev', not 'development')
  // Also show for local development (MODE = 'development')
  if (env !== 'dev' && env !== 'development' && env !== 'test') {
    return null;
  }

  // Normalize display: 'dev' or 'development' both show as 'Dev'
  const displayEnv = env === 'dev' || env === 'development' ? 'Dev' : 'Test';

  return (
    <span className={`env-identification ${env}`}>
      {displayEnv} <span className="d-none d-md-inline">environment</span>
      {isLocal && '  - Local'}
    </span>
  );
};
