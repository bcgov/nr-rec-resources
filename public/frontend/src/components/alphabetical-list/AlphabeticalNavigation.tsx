import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/routes/constants';
import './AlphabeticalNavigation.scss';

interface AlphabeticalNavigationProps {
  selectedLetter: string;
}

export const AlphabeticalNavigation = ({
  selectedLetter,
}: AlphabeticalNavigationProps) => {
  // Generate A-Z letters
  const letters = [
    '#',
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ];

  return (
    <div>
      <h2 className="h5 mb-3">Select a letter:</h2>
      <div className="alphabetical-navigation">
        {letters.map((letter) => {
          const isActive = selectedLetter === letter;
          const url = `${ROUTE_PATHS.ALPHABETICAL}?letter=${encodeURIComponent(letter)}`;

          return (
            <Link key={letter} to={url} className={isActive ? 'active' : ''}>
              {letter}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
