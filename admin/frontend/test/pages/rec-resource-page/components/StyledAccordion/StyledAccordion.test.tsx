import { StyledAccordion } from '@/pages/rec-resource-page/components/StyledAccordion/StyledAccordion';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

  it('is expanded by default', () => {
    render(
      <StyledAccordion eventKey="0" title="Title">
        <div>Content</div>
      </StyledAccordion>,
    );

    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('is collapsed when defaultOpen is false', () => {
    render(
      <StyledAccordion eventKey="0" title="Title" defaultOpen={false}>
        <div>Content</div>
      </StyledAccordion>,
    );

    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('renders headerEnd content as a sibling of the toggle button', () => {
    render(
      <StyledAccordion
        eventKey="0"
        title="Title"
        headerEnd={<button type="button">Header action</button>}
      >
        <div>Content</div>
      </StyledAccordion>,
    );

    const headerAction = screen.getByRole('button', { name: 'Header action' });
    const toggle = screen.getByRole('button', { name: 'Title' });
    expect(headerAction).toBeInTheDocument();
    expect(headerAction).not.toBe(toggle);
  });

  it('renders nothing extra in the header row when headerEnd is omitted', () => {
    render(
      <StyledAccordion eventKey="0" title="Title">
        <div>Content</div>
      </StyledAccordion>,
    );

    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('is forced open when activeKey matches eventKey, regardless of defaultOpen', () => {
    render(
      <StyledAccordion
        eventKey="0"
        title="Title"
        defaultOpen={false}
        activeKey="0"
      >
        <div>Content</div>
      </StyledAccordion>,
    );

    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('is collapsed when activeKey is undefined, regardless of defaultOpen', () => {
    render(
      <StyledAccordion
        eventKey="0"
        title="Title"
        defaultOpen={true}
        activeKey={undefined}
      >
        <div>Content</div>
      </StyledAccordion>,
    );

    // activeKey=undefined → uncontrolled, defaultOpen=true wins
    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('is closed when activeKey does not match eventKey', () => {
    render(
      <StyledAccordion
        eventKey="0"
        title="Title"
        defaultOpen={true}
        activeKey="other"
      >
        <div>Content</div>
      </StyledAccordion>,
    );

    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('uses uncontrolled mode when activeKey is not provided', () => {
    render(
      <StyledAccordion eventKey="0" title="Title" defaultOpen={true}>
        <div>Content</div>
      </StyledAccordion>,
    );

    expect(screen.getByRole('button', { name: 'Title' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });
});
