import { useNavigate } from 'react-router';
import '@/components/NotFound.scss';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="not-found-container">
      <div className="not-found-content-container">
        <h1>404</h1>
        <p>The page you’re looking for does not exist.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </div>
    </div>
  );
}
