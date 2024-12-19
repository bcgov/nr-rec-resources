import { forwardRef } from 'react';

const ThingsToDo = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id="things-to-do" ref={ref}>
      <h2 className="section-heading">Things to do</h2>
      <p>Placeholder</p>
    </section>
  );
});

export default ThingsToDo;
