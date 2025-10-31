import { useNavigate } from '@tanstack/react-router';
import './AlphabeticalNavigation.scss';

interface AlphabeticalNavigationProps {
  selectedLetter: string;
  selectedType?: string;
}

export const AlphabeticalNavigation = ({
  selectedLetter,
  selectedType,
}: AlphabeticalNavigationProps) => {
  const navigate = useNavigate({ from: '/search/a-z-list' });

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
    navigate({
      search: (prev) => {
        const newParams = { ...prev };

        if (updates.letter !== undefined) {
          newParams.letter = updates.letter;
        }

        if (updates.type === null) {
          delete newParams.type;
        } else if (updates.type !== undefined) {
          newParams.type = updates.type;
        }

        return newParams;
      },
    });
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="h5 mb-3">Select a letter</h2>
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
        <h2 className="h5 mb-3">Filter by type</h2>
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
