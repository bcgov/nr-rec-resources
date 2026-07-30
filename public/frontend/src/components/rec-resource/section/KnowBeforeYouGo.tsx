import { SectionIds, SectionTitles } from '@/components/rec-resource/enum';
import '@/components/rec-resource/section/KnowBeforeYouGo.scss';
import recycle from '@/images/icons/recycle.svg';
import celreception from '@/images/icons/cel-reception.svg';
import wildlife from '@/images/icons/wildlife-animal-safety.svg';
import wildlifeForest from '@/images/icons/wildlife-animal-forest.svg';
import toilet from '@/images/icons/toilet.svg';
import forestServiceRoads from '@/images/icons/forest-service-roads.svg';
import campfire from '@/images/icons/campfires-safety.svg';
import cash from '@/images/icons/cash.svg';
import trailConditions from '@/images/icons/trail-conditions.svg';
import stayOnTrails from '@/images/icons/stray-on-trails.svg';
import respect from '@/images/icons/respect-learning.svg';
import { forwardRef } from 'react';
import InfoRow from '@/components/rec-resource/section/InfoRow';
import { AdvisoryDto } from '@/service/recreation-resource';
import AdvisoriesList from './AdvisoriesList';

interface KnowBeforeYouGoProps {
  advisories: AdvisoryDto[] | null;
  isAdditionalFeesAvailable: boolean;
  isCampingAvailable: boolean;
  isReservable: boolean;
  isRecreationSite: boolean;
  isRecreationTrail: boolean;
  isInterpretiveForest: boolean;
}

const BringCashRow = () => (
  <InfoRow icon={cash} iconAlt="Cash Only icon" title="Bring cash">
    <p>
      Most sites operate on a cash-only basis, and fees are often collected
      directly by site operators unless you have paid in advance through an
      online reservation system. While some site operators may be able to accept
      card payments on site, this is not guaranteed. Please arrive prepared with
      enough cash to cover your stay and any additional services.
    </p>
  </InfoRow>
);

const KnowBeforeYouGo = forwardRef<HTMLElement, KnowBeforeYouGoProps>(
  (
    {
      isAdditionalFeesAvailable,
      isCampingAvailable,
      isReservable,
      advisories,
      isRecreationSite,
      isRecreationTrail,
      isInterpretiveForest,
    },
    ref,
  ) => {
    return (
      <section
        id={SectionIds.KNOW_BEFORE_YOU_GO}
        ref={ref}
        className="rec-resource-section know-before-you-go"
      >
        <h2 className="section-heading">{SectionTitles.KNOW_BEFORE_YOU_GO}</h2>
        <section className="mb-4">
          {advisories && <AdvisoriesList advisories={advisories} />}
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
              <BringCashRow />
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
            !isReservable && <BringCashRow />}
          <h3>Staying safe</h3>
          {isRecreationSite && (
            <p>
              Generally located in remote areas and accessed by gravel forestry
              roads, most recreation sites provide basic facilities, such as
              outhouses, fire rings and picnic tables.
            </p>
          )}
          {isRecreationTrail && (
            <p>
              Most recreation trails travel through remote or natural areas and
              may involve uneven terrain, steep sections, river crossings,
              changing weather, or limited services. Plan ahead, stay on
              designated trails, and be prepared for changing conditions. Before
              heading out, check for trail alerts, closures, and current
              conditions.
            </p>
          )}
          {isInterpretiveForest && (
            <p>
              Interpretive forests offer opportunities to explore and learn
              about British Columbia's natural and cultural heritage.
              <br /> <br />
              While many interpretive forests are designed for day use and
              educational experiences, visitors may still encounter uneven
              terrain, changing weather, wildlife, and natural hazards. Plan
              ahead, stay on designated trails and boardwalks where provided,
              and follow all posted signs.
            </p>
          )}
          {(isRecreationSite || isRecreationTrail) && (
            <InfoRow
              icon={recycle}
              iconAlt="Recycle icon"
              title="Pack in, pack out"
              className="safety-item"
            >
              {isRecreationSite && (
                <p>
                  The majority of recreation sites and trails don't offer
                  garbage receptacles or have potable water. Be prepared and
                  bring your own water, and pack out any garbage.
                </p>
              )}
              {isRecreationTrail && (
                <>
                  <p>
                    Garbage receptacles and potable water are rarely available
                    on recreation trails.
                  </p>
                  <p>
                    Bring enough water, food, and essential supplies for your
                    trip, and pack out all garbage and waste. Always follow
                    Leave No Trace outdoor ethics
                  </p>
                </>
              )}
              <p>
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
            </InfoRow>
          )}
          {isInterpretiveForest && (
            <InfoRow
              icon={stayOnTrails}
              iconAlt="Stay on Trail icon"
              title="Stay on designated trails"
              className="safety-item"
            >
              <p>
                Trails, boardwalks, and viewing areas help protect sensitive
                ecosystems and cultural values.
              </p>
              <p>
                For your safety and to minimize environmental impacts, remain on
                designated trails and avoid entering restricted or
                environmentally sensitive areas. This reduces erosion and
                ecosystem damage.
              </p>
            </InfoRow>
          )}
          <InfoRow
            icon={celreception}
            iconAlt="Cel Reception icon"
            title="Limited or no cellular reception"
          >
            {isRecreationSite && (
              <p>
                Cell service may be limited or unavailable in many of our rec
                sites — plan ahead, share your itinerary, and carry emergency
                supplies.
              </p>
            )}
            {isRecreationTrail && (
              <p>
                Cell service may be limited or unavailable on many recreation
                trails.
                <br /> <br />
                Do not rely on your phone for navigation or emergencies. Share
                your itinerary with someone you trust and consider carrying a
                map, GPS device, or satellite communication device.
              </p>
            )}
            {isInterpretiveForest && (
              <p>
                Some interpretive forests are located in remote or rural areas
                where cell service may be limited or unavailable.
                <br /> <br />
                Download maps or directions before you visit and let someone
                know your plans if travelling to a more remote location. Visitor
                guidance for parks and recreation areas notes that mobile
                coverage should not be relied upon for emergencies.
              </p>
            )}
          </InfoRow>
          <InfoRow
            icon={isInterpretiveForest ? wildlifeForest : wildlife}
            iconAlt="Wildlife and Animal Safety icon"
            title="Wildlife and animal safety"
            className="safety-item"
          >
            {isRecreationSite && (
              <>
                <p>
                  You may encounter wildlife, including bears, at or near this
                  site.
                </p>
                <p>
                  Store food, garbage, and scented items securely. Keep a safe
                  distance from all animals, never feed wildlife, and follow
                  posted safety guidance. Learn what to do if you encounter a
                  bear or other wildlife before your trip.
                </p>
              </>
            )}
            {isRecreationTrail && (
              <>
                <p>
                  You may encounter wildlife, including bears, cougars, and
                  other animals.
                </p>
                <p>
                  Stay alert, make noise when travelling through dense
                  vegetation, keep a safe distance from wildlife, and never feed
                  animals. Store food and scented items securely where
                  appropriate.
                </p>
              </>
            )}
            {isInterpretiveForest && (
              <>
                <p>Wildlife may be present at any time of year.</p>
                <p>
                  Keep a safe distance from all animals, never feed wildlife,
                  and supervise children closely. Respect wildlife by observing
                  from afar and following posted guidance.
                </p>
              </>
            )}
          </InfoRow>
          {isInterpretiveForest && (
            <InfoRow
              icon={recycle}
              iconAlt="Recycle icon"
              title="Pack in, pack out"
              className="safety-item"
            >
              <p>
                Garbage and recycling facilities may be limited or unavailable.
              </p>
              <p>
                Please help keep interpretive forests clean by packing out
                everything you bring with you and leaving natural and cultural
                features undisturbed. Responsible recreation guidance encourages
                visitors to leave places as they found them and dispose of waste
                properly.
              </p>
            </InfoRow>
          )}
          {isRecreationTrail && (
            <InfoRow
              icon={trailConditions}
              iconAlt="Trail Conditions icon"
              title="Trail conditions and hazards"
              className="safety-item"
            >
              <p>
                Trail conditions can change quickly due to weather, erosion,
                fallen trees, flooding, wildfire impacts, or maintenance
                activities.
              </p>
              <p>
                Check for trail reports, advisories, and closures before your
                visit. Choose routes appropriate for your experience level and
                available daylight.
              </p>
            </InfoRow>
          )}
          {isRecreationTrail && (
            <InfoRow
              icon={stayOnTrails}
              iconAlt="Stay on Trail icon"
              title="Stay on designated trails"
              className="safety-item"
            >
              <p>
                For your safety and to help protect natural and cultural values,
                remain on marked or designated trails.
              </p>
              <p>
                Leaving established trails can damage sensitive ecosystems,
                increase erosion, and make it harder to navigate safely.
              </p>
            </InfoRow>
          )}
          {(isRecreationSite || isRecreationTrail) && (
            <InfoRow
              icon={toilet}
              iconAlt="Toilet icon"
              title="Toilets and sanitation"
              className="safety-item"
            >
              <p>
                Toilet facilities may be limited or unavailable at this{' '}
                {isRecreationSite ? 'site' : 'trail'}.
              </p>
              <p>
                Bring your own toilet paper and be prepared to pack out all
                waste where required. Help protect the environment by following
                Leave No Trace practices.
              </p>
            </InfoRow>
          )}
          {(isRecreationSite || isRecreationTrail) && (
            <InfoRow
              icon={forestServiceRoads}
              iconAlt="Forest Service Roads icon"
              title="Forest Service Roads"
              className="safety-item"
            >
              <p>
                Access to this {isRecreationSite ? 'site' : 'trail'} may involve
                driving on Forest Service Roads (FSRs) or other natural resource
                roads.
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
            </InfoRow>
          )}
          <InfoRow
            icon={campfire}
            iconAlt="Campfires and fire safety icon"
            title={
              isInterpretiveForest ? 'Fire safety' : 'Campfires and fire safety'
            }
            className="safety-item"
          >
            <p>Campfire bans or restrictions may be in place.</p>
            {isRecreationSite && (
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
            )}
            {isRecreationTrail && (
              <p>
                Before your trip, check{' '}
                <a
                  href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/alerts#wildfire-info"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="BC Wildfire Service (opens in new window)"
                >
                  current restrictions
                </a>{' '}
                and wildfire conditions. Follow all posted signs and trail
                closures, and never leave a fire unattended.
              </p>
            )}
            {isInterpretiveForest && (
              <p>
                Check{' '}
                <a
                  href="https://www2.gov.bc.ca/gov/content/sports-culture/recreation/camping-hiking/sites-trails/alerts#wildfire-info"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="BC Wildfire Service (opens in new window)"
                >
                  current restrictions
                </a>{' '}
                before your visit and follow all posted signs. Help protect
                forests and surrounding communities by preventing wildfires and
                reporting concerns when appropriate.
              </p>
            )}
          </InfoRow>
          {isInterpretiveForest && (
            <InfoRow
              icon={respect}
              iconAlt="Respect learning icon"
              title="Respect learning and cultural features"
              className="safety-item"
            >
              <p>
                Interpretive forests are places for discovery, learning, and
                stewardship.
              </p>
              <p>
                Please respect interpretive signs, educational displays,
                research areas, cultural features, and natural objects. Leave
                plants, rocks, historical features, and artifacts where you find
                them so others can enjoy and learn from them.
              </p>
            </InfoRow>
          )}
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
