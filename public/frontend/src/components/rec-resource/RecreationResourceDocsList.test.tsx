import { render, screen } from '@testing-library/react';
import { RecreationResourceDetailModel } from '@/service/custom-models';
import { RecreationResourceDocsList } from '@/components/rec-resource/RecreationResourceDocsList';

describe('RecreationResourceDocsList', () => {
  const mockSingleDoc = {
    ref_id: '123',
    url: 'http://example.com/doc1',
    extension: 'pdf',
    title: 'Document 1',
  };

  const mockMultipleDocs = [
    mockSingleDoc,
    {
      ref_id: '456',
      url: 'http://example.com/doc2',
      extension: 'jpg',
      title: 'Document 2',
    },
  ];

  const createMockResource = (
    docs: typeof mockMultipleDocs | (typeof mockSingleDoc)[],
  ) =>
    ({
      name: 'Test Resource',
      recreation_resource_docs: docs,
    }) as RecreationResourceDetailModel;

  test('renders nothing when no docs are present', () => {
    const mockResource = createMockResource([]);
    const { container } = render(
      <RecreationResourceDocsList recResource={mockResource} />,
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders single document with map title format', () => {
    const mockResource = createMockResource([mockSingleDoc]);
    render(<RecreationResourceDocsList recResource={mockResource} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', mockSingleDoc.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent(`Map of ${mockResource.name} [PDF]`);
  });

  test('renders multiple documents with individual titles', () => {
    const mockResource = createMockResource(mockMultipleDocs);
    render(<RecreationResourceDocsList recResource={mockResource} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);

    expect(links[0]).toHaveTextContent('Document 1 [PDF]');
    expect(links[1]).toHaveTextContent('Document 2 [JPG]');
  });

  test('applies correct CSS classes to links', () => {
    const mockResource = createMockResource([mockSingleDoc]);
    render(<RecreationResourceDocsList recResource={mockResource} />);

    const link = screen.getByRole('link');
    expect(link).toHaveClass('text-decoration-underline', 'link-color');
  });

  test('renders correct list structure', () => {
    const mockResource = createMockResource(mockMultipleDocs);
    render(<RecreationResourceDocsList recResource={mockResource} />);

    const list = screen.getByRole('list');
    const listItems = screen.getAllByRole('listitem');

    expect(list).toBeInTheDocument();
    expect(listItems).toHaveLength(2);
  });
});
