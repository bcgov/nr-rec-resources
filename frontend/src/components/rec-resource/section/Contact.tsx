import { forwardRef } from 'react';

const Contact = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section id="contact" ref={ref}>
      <h2 className="section-heading">Contact</h2>
      <figure className="table">
        <table>
          <tbody>
            <tr>
              <th>Site Operator</th>
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
                  <a href="">Contact Us</a>
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
