import { useNavigate } from 'react-router';
import styles from './NotFound.module.css';

export default function NotFound() {
  const navigate = useNavigate();
  const buttonClicked = () => {
    navigate('/', { state: { data: undefined } });
  };

  return (
    <div className={styles['not-found-container']}>
      <div className={styles['content-container']}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.subtitle}>
          The page you’re looking for does not exist.
        </p>
        <button
          name="homeBtn"
          id="homeBtn"
          className={styles['back-home-btn']}
          onClick={buttonClicked}
        >
          Back Home
        </button>
      </div>
    </div>
  );
}
