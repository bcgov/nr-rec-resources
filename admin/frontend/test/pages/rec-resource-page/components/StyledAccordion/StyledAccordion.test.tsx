import { StyledAccordion } from '@/pages/rec-resource-page/components/StyledAccordion/StyledAccordion';
import { render, screen } from '@testing-library/react';

describe('StyledAccordion', () => {
  it('renders the title and children', () => {
    render(
      <StyledAccordion eventKey="0" title="Accordion Title">
        <div>Accordion Content</div>
      </StyledAccordion>,
    );
    expect(screen.getByText('Accordion Title')).toBeInTheDocument();
    expect(screen.getByText('Accordion Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <StyledAccordion eventKey="1" title="Title" className="custom-class">
        <div>Content</div>
      </StyledAccordion>,
    );
    const accordion = screen.getByText('Title').closest('.styled-accordion');
    expect(accordion).toHaveClass('custom-class');
  });
});
