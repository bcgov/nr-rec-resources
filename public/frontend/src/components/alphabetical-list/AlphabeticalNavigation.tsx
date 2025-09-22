import { Button, Stack } from 'react-bootstrap';
import './AlphabeticalNavigation.scss';

interface AlphabeticalNavigationProps {
  selectedLetter: string;
  onLetterSelect: (letter: string) => void;
}

export const AlphabeticalNavigation = ({
  selectedLetter,
  onLetterSelect,
}: AlphabeticalNavigationProps) => {
  // Generate A-Z letters
  const letters = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i),
  );

  return (
    <div className="alphabetical-navigation">
      <h2 className="h5 mb-3">Select a letter:</h2>
      <Stack direction="horizontal" gap={1} className="flex-wrap">
        {/* # for numerical resources */}
        <Button
          variant={selectedLetter === '#' ? 'primary' : 'outline-primary'}
          size="sm"
          onClick={() => onLetterSelect('#')}
          className="alphabetical-nav-btn"
        >
          #
        </Button>

        {/* A-Z letters */}
        {letters.map((letter) => (
          <Button
            key={letter}
            variant={selectedLetter === letter ? 'primary' : 'outline-primary'}
            size="sm"
            onClick={() => onLetterSelect(letter)}
            className="alphabetical-nav-btn"
          >
            {letter}
          </Button>
        ))}
      </Stack>
    </div>
  );
};
