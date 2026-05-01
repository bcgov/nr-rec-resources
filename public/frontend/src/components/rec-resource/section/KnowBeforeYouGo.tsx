import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import '@/components/rec-resource/section/KnowBeforeYouGo.scss';
import recycle from '@/images/icons/recycle.svg';
import celreception from '@/images/icons/cel-reception.svg';
import wildlife from '@/images/icons/wildlife-animal-safety.svg';
import toilet from '@/images/icons/toilet.svg';
import forestServiceRoads from '@/images/icons/forest-service-roads.svg';
import campfire from '@/images/icons/campfires-safety.svg';
import cash from '@/images/icons/cash.svg';
import { forwardRef } from 'react';

interface KnowBeforeYouGoProps {
  isAdditionalFeesAvailable: boolean;
  isCampingAvailable: boolean;
  isReservable: boolean;
}

const KnowBeforeYouGo = forwardRef<HTMLElement, KnowBeforeYouGoProps>(
  ({ isAdditionalFeesAvailable, isCampingAvailable, isReservable }, ref) => {
    return (
      <section
        id={SectionIds.KNOW_BEFORE_YOU_GO}
        ref={ref}
        className="rec-resource-section know-before-you-go"
      >
        <h2 className="section-heading">{SectionTitles.KNOW_BEFORE_YOU_GO}</h2>
        <section className="mb-4">
          {isReservable ? (
            <>
              <h3>Reservable</h3>
              <p>
                This site has some reservations available through our site
                operator (see booking button above). There may also be first
                come, first served spots available to claim upon arrival. Plan
                to arrive early, especially during busy periods as spots are
                limited.
              </p>
              <div className="row">
                <div className="col-sm-1">
                  <img src={cash} alt="Cash Only icon" height={40} width={40} />
                </div>
                <div className="col-sm">
                  <p className="small-tittle">Bring cash</p>
                  <p>
                    Most sites operate on a cash-only basis, and fees are often
                    collected directly by site operators unless you have paid in
                    advance through an online reservation system. While some
                    site operators may be able to accept card payments on site,
                    this is not guaranteed. Please arrive prepared with enough
                    cash to cover your stay and any additional services.
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
          {(isAdditionalFeesAvailable || isCampingAvailable) &&
            !isReservable && (
              <div className="row">
                <div className="col-sm-1">
                  <img src={cash} alt="Cash Only icon" height={40} width={40} />
                </div>
                <div className="col-sm">
                  <p className="small-tittle">Bring cash</p>
                  <p>
                    Most sites operate on a cash-only basis, and fees are often
                    collected directly by site operators unless you have paid in
                    advance through an online reservation system. While some
                    site operators may be able to accept card payments on site,
                    this is not guaranteed. Please arrive prepared with enough
                    cash to cover your stay and any additional services.
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
                prepared to bring your own water and pack out any garbage.
                Always follow Leave no Trace outdoor ethics. For more
                information, see{' '}
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
          <div className="row">
            <div className="col-sm-1">
              <img
                src={wildlife}
                alt="Wildlife & Animal Safety icon"
                height={40}
                width={40}
              />
            </div>
            <div className="col-sm safety-item">
              <p className="small-tittle">Wildlife &amp; Animal Safety</p>
              <p>
                You may encounter wildlife, including bears, at or near this
                site.
              </p>
              <p>
                Store food, garbage, and scented items securely. Keep a safe
                distance from all animals, never feed wildlife, and follow
                posted safety guidance. Learn what to do if you encounter a bear
                or other wildlife before your trip.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-1">
              <img src={toilet} alt="Toilet icon" height={40} width={40} />
            </div>
            <div className="col-sm safety-item">
              <p className="small-tittle">Toilets &amp; Sanitation</p>
              <p>
                Toilet facilities may be limited or unavailable at this site.
              </p>
              <p>
                Bring your own toilet paper and be prepared to pack out all
                waste where required. Help protect the environment by following
                Leave No Trace practices.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-1">
              <img
                src={forestServiceRoads}
                alt="Forest Service Roads icon"
                height={40}
                width={40}
              />
            </div>
            <div className="col-sm safety-item">
              <p className="small-tittle">Forest Service Roads</p>
              <p>
                Access to this site may involve driving on Forest Service Roads
                (FSRs) or other natural resource roads.
              </p>
              <p>
                These roads are often gravel, unmaintained, and shared with
                industrial traffic. Conditions can change quickly due to weather
                or active use. Drive with caution and check{' '}
                <a
                  href="https://www2.gov.bc.ca/gov/content/industry/natural-resource-use/resource-roads/local-road-safety-information"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Local road safety information (opens in new window)"
                >
                  local road safety information
                </a>{' '}
                before you go.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-1">
              <img
                src={campfire}
                alt="Campfires & Fire Safety icon"
                height={40}
                width={40}
              />
            </div>
            <div className="col-sm safety-item">
              <p className="small-tittle">Campfires &amp; Fire Safety</p>
              <p>Campfire bans or restrictions may be in place.</p>
              <p>
                Before lighting a fire, check current restrictions with{' '}
                <a
                  href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/alerts#wildfire-info"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="BC Wildfire Service (opens in new window)"
                >
                  BC Wildfire Service
                </a>{' '}
                and on local or Indigenous government websites. Always follow
                posted signs, use designated fire rings where provided, and
                fully extinguish fires.
              </p>
            </div>
          </div>
          <div className="know-before-you-go__info-box">
            <strong>
              Review the detailed guides under visit responsibly for more
              information on staying safe and preserving natural spaces
            </strong>
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
  },
);

export default KnowBeforeYouGo;
