import { forwardRef } from 'react';
import { EXTERNAL_LINKS } from '@/data/urls';
import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';

const Contact = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id={SectionIds.CONTACT} ref={ref}>
      <h2 className="section-heading">{SectionTitles.CONTACT}</h2>
      <figure className="table">
        <table>
          <tbody>
            <tr>
              <th>Site operator</th>
              <td>
                <p>Placeholder</p>
              </td>
            </tr>
            <tr>
              <th>
                General questions and feedback for Recreation Sites & Trails BC
              </th>
              <td>
                <p>We answer emails weekdays from 9 am to 5 pm Pacific Time.</p>
                <p>
                  <a href={EXTERNAL_LINKS.CONTACT}>Contact Us</a>
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </figure>
    </section>
  );
});

export default Contact;
