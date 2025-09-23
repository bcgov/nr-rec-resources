import { useSearchParams } from 'react-router-dom';
import './AlphabeticalNavigation.scss';

interface AlphabeticalNavigationProps {
  selectedLetter: string;
  selectedType?: string;
}

export const AlphabeticalNavigation = ({
  selectedLetter,
  selectedType,
}: AlphabeticalNavigationProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Generate A-Z letters
  const letters = [
    '#',
    ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  ];

  const typeFilters = [
    { label: 'Recreation site', code: 'SIT' },
    { label: 'Recreation trail', code: 'RTR' },
    { label: 'Interpretive forest', code: 'IF' },
  ];

  const updateSearchParams = (updates: {
    letter?: string;
    type?: string | null;
  }) => {
    const newParams = new URLSearchParams(searchParams);

    if (updates.letter !== undefined) {
      newParams.set('letter', updates.letter);
    }

    if (updates.type === null) {
      newParams.delete('type');
    } else if (updates.type !== undefined) {
      newParams.set('type', updates.type);
    }

    setSearchParams(newParams);
  };

  return (
    <div>
      <div>
        <h2 className="h5 mb-3">Select a letter:</h2>
        <div className="alphabetical-navigation">
          {letters.map((letter) => {
            const isActive = selectedLetter === letter;
            return (
              <button
                key={letter}
                onClick={() => updateSearchParams({ letter })}
                className={isActive ? 'active' : ''}
                type="button"
              >
                {letter}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h2 className="h5 mt-4">Filter by type</h2>
        <div className="alphabetical-navigation types">
          <button
            onClick={() => updateSearchParams({ type: null })}
            className={!selectedType ? 'active' : ''}
            type="button"
          >
            All types
          </button>
          {typeFilters.map((t) => {
            const isActiveType = selectedType === t.code;
            return (
              <button
                key={t.code}
                onClick={() => updateSearchParams({ type: t.code })}
                className={isActiveType ? 'active' : ''}
                type="button"
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
