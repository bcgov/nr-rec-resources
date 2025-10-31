import { useNavigate } from '@tanstack/react-router';
import '@/components/NotFound.scss';

export default function NotFound() {
  const navigate = useNavigate();
  const lastSearch = sessionStorage.getItem('lastSearch');

  return (
    <div className="not-found-container">
      <div className="not-found-content-container">
        <img
          src="/images/404-pic.png"
          alt="404 not found image"
          className="image"
        />
        <p className="title">404 - Uh oh ! Page not found.</p>
        <p className="message">
          The page you’re looking for can&apos;t be found. It may have moved, or
          no longer exists.
        </p>
        <div className="button-footer d-flex justify-content-between">
          <button
            type="button"
            className="btn btn-outline-primary not-found-btn"
            onClick={() => navigate({ to: '/' })}
          >
            Return to home
          </button>
          <button
            type="button"
            className="btn btn-outline-primary not-found-btn"
            onClick={() => {
              navigate({
                to: `/search${lastSearch || ''}`,
              });
            }}
          >
            Find a rec site or trail
          </button>
        </div>
      </div>
    </div>
  );
}
