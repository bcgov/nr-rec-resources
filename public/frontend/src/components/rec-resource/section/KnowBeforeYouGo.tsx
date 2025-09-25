import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import '@/components/rec-resource/section/KnowBeforeYouGo.scss';
import recycle from '@/images/icons/recycle.svg';
import celreception from '@/images/icons/cel-reception.svg';
import cash from '@/images/icons/cash.svg';

interface KnowBeforeYouGoProps {
  isAdditionalFeesAvailable: boolean;
  isCampingAvailable: boolean;
  isReservable: boolean;
}

const KnowBeforeYouGo: React.FC<KnowBeforeYouGoProps> = ({
  isAdditionalFeesAvailable,
  isCampingAvailable,
  isReservable,
}) => {
  return (
    <section
      id={SectionIds.KNOW_BEFORE_YOU_GO}
      className="rec-resource-section know-before-you-go"
    >
      <h2 className="section-heading">{SectionTitles.KNOW_BEFORE_YOU_GO}</h2>
      <section className="mb-4">
        {isReservable ? (
          <>
            <h3>Reservable</h3>
            <p>
              This site has some reservations available through our site
              operator (see booking button above). There may also be first come,
              first served spots available to claim upon arrival. Plan to arrive
              early, especially during busy periods as spots are limited.
            </p>
            <div className="row">
              <div className="col-sm-1">
                <img src={cash} alt="Cash Only icon" height={40} width={40} />
              </div>
              <div className="col-sm">
                <p className="small-tittle">Bring Cash</p>
                <p>
                  Most sites operate on a cash-only basis, and fees are often
                  collected directly by site operators unless you have paid
                  through an online reservation ahead of time. Please come
                  prepared with enough cash to cover your stay and any
                  additional services.
                </p>
              </div>
            </div>
          </>
        ) : (
          isCampingAvailable && (
            <>
              <h3>First come, first served</h3>
              <p>
                This site operates on a First Come, First Served (FCFS) basis.
                Reservations are not available - you must arrive to claim an
                available spot in person. Spots are limited. Plan to arrive
                early, especially during busy periods.
              </p>
            </>
          )
        )}
        {(isAdditionalFeesAvailable || isCampingAvailable) && !isReservable && (
          <div className="row">
            <div className="col-sm-1">
              <img src={cash} alt="Cash Only icon" height={40} width={40} />
            </div>
            <div className="col-sm">
              <p className="small-tittle">Cash only</p>
              <p>
                Most sites operate on a cash-only basis, and fees are often
                collected directly by site operators. Please come prepared with
                enough cash to cover your stay and any additional services.
              </p>
            </div>
          </div>
        )}
        <h3>Staying safe</h3>
        <p>
          Recreation sites and trails can be in remote areas with access via
          gravel resource roads. Drive cautiously and watch out for industrial
          traffic and logging trucks. Plan ahead, share your itinerary, and
          carry emergency supplies.
        </p>
        <div className="row">
          <div className="col-sm-1">
            <img src={recycle} alt="Recycle icon" height={40} width={40} />
          </div>
          <div className="col-sm packing-info">
            <p className="small-tittle">Pack in, pack out</p>
            <p>
              Garbage receptacles and potable water are not provided. Be
              prepared to bring your own water and pack out any garbage. Always
              follow Leave no Trace outdoor ethics. For more information, see{' '}
              <a
                href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning"
                target="_blank"
                rel="noreferer noreferrer"
                aria-label="Plan your visit (opens in new window)"
              >
                planning your visit
              </a>
              .
            </p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-1">
            <img
              src={celreception}
              alt="Cel Reception icon"
              height={40}
              width={40}
            />
          </div>
          <div className="col-sm">
            <p className="small-tittle">Limited or no cellular reception</p>
            <p>
              Cell service may be limited or unavailable due to the remoteness
              of many of our rec sites.
            </p>
          </div>
        </div>
        <div className="info-box">
          Review the detailed guides under visit responsibly for more
          information on staying safe and preserving natural spaces
        </div>
        <h3>Visit responsibly</h3>
        <p>
          Follow these guides to ensure your activities are safe, respectful,
          and ecologically friendly:
        </p>
        <ul className="guides">
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/alerts"
              target="_blank"
              rel="noreferer noreferrer"
              aria-label="Alerts, closures, and Warnings (opens in new window)"
            >
              Alerts, closures, and warnings
            </a>{' '}
            {'>'}
          </li>
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/safety/wildfire-status/prevention/fire-bans-and-restrictions"
              target="_blank"
              rel="noreferer noreferrer"
              aria-label="Fire Prohibitions and Restrictions (opens in new window)"
            >
              Fire Prohibitions and Restrictions
            </a>{' '}
            {'>'}
          </li>
          <li>
            <a
              href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/planning/rules"
              target="_blank"
              rel="noreferer noreferrer"
              aria-label="Rules for Recreation Sites and Trails (opens in new window)"
            >
              Rules for Recreation Sites and Trails
            </a>{' '}
            {'>'}
          </li>
          <li>
            <a
              href="https://www.camperscode.com/#9-rules"
              target="_blank"
              rel="noreferer noreferrer"
              aria-label="The Campers Code (opens in new window)"
            >
              The Camper&apos;s Code
            </a>{' '}
            {'>'}
          </li>
        </ul>
        <br />
      </section>
    </section>
  );
};

export default KnowBeforeYouGo;
