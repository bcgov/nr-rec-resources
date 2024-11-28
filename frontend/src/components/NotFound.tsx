import { useNavigate } from 'react-router';
import './NotFound.css'; // Import the CSS file

export default function NotFound() {
  const navigate = useNavigate();
  const buttonClicked = () => {
    navigate('/', { state: { data: undefined } }); // reset the state
  };

  return (
    <div className="not-found-container">
      <div className="content-container">
        <h1 className="title">404</h1>
        <p className="subtitle">The page you’re looking for does not exist.</p>
        <button
          name="homeBtn"
          id="homeBtn"
          className="back-home-btn"
          onClick={buttonClicked}
        >
          Back Home
        </button>
      </div>
    </div>
  );
}
