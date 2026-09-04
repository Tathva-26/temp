import React from 'react';

const filterCategories = ['All', 'Competition', 'Workshop', 'Lecture'];

export function EventPanel({
  panelView,
  activeLocation,
  allEvents,
  allLocations,
  onClose,
  onNavigate,
  onViewChange, // This prop is now used for the back button
}) {
  const isOpen = panelView !== null;
  const [isDesktop, setIsDesktop] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState('All');

  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  // ✅ NEW: Wrapped navigation handler
  // This function calls the original navigation logic AND closes the panel on mobile.
  const handleNavigationClick = (id) => {
    // 1. Call the original navigation prop (e.g., to move the map camera)
    onNavigate(id);

    // 2. If on mobile, also call onClose to hide the panel
    if (!isDesktop) {
      onClose();
    }
  };

  // --- Logic for 'events' and 'location' views ---
  const locationFilteredEvents =
    panelView === 'location' && activeLocation
      ? allEvents.filter((event) => event.locationId === activeLocation.id)
      : allEvents;

  const eventsToShow =
    activeFilter === 'All'
      ? locationFilteredEvents
      : locationFilteredEvents.filter(
          (event) =>
            event.type &&
            event.type.toLowerCase() === activeFilter.toLowerCase()
        );

  const isDetailView = panelView === 'location' && activeLocation;
  const isTabView = panelView === 'events' || panelView === 'locations';
  const title = isDetailView ? activeLocation.name : 'Campus Guide';

  return (
    <>
      {/* Mobile backdrop */}
      {!isDesktop && (
        <div
          className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed z-50 flex flex-col overflow-hidden bg-black/95 backdrop-blur-3xl transition-all duration-500 ease-in-out 
    ${
      isDesktop
        ? `top-0 right-0 bottom-0 w-96 border-l border-white/10 shadow-[ -8px_0_32px_rgba(0,0,0,0.4)] ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`
        : `bottom-0 left-0 right-0 h-[70vh] rounded-t-3xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.4)] ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`
    }
    `}
      >
        {/* Drag indicator for mobile */}
        {!isDesktop && (
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 rounded-full bg-white/20" />
          </div>
        )}

        {/* MODIFIED: Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            {/* NEW: Back button / Title Area */}
            <div className="flex items-center gap-2 min-w-0">
              {isDetailView && (
                <button
                  onClick={() => onViewChange('events')} // Go back to 'events' tab
                  className="flex-shrink-0 flex items-center justify-center w-8 h-8 -ml-2 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
                  title="Back to Campus Guide"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}
              <div className="min-w-0">
                {' '}
                {/* Wrapper to allow title truncation */}
                <h2 className="text-white text-lg font-bold tracking-tight m-0 truncate">
                  {title}
                </h2>
                {/* Subtitle with count */}
                <p className="text-sm text-gray-400 mt-1">
                  {panelView === 'locations' ? (
                    <>
                      {allLocations.length}{' '}
                      {allLocations.length === 1 ? 'location' : 'locations'}{' '}
                      found
                    </>
                  ) : (
                    <>
                      {eventsToShow.length}{' '}
                      {eventsToShow.length === 1 ? 'event' : 'events'} found
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tab UI (unchanged) */}
          {isTabView && (
            <div className="flex gap-2 mb-4">
              <TabButton
                label="Events"
                isActive={panelView === 'events'}
                onClick={() => onViewChange('events')}
              />
              <TabButton
                label="Locations"
                isActive={panelView === 'locations'}
                onClick={() => onViewChange('locations')}
              />
            </div>
          )}

          {/* Filter buttons (unchanged) */}
          {panelView !== 'locations' && (
            <div className="flex flex-wrap gap-2 -mb-1">
              {filterCategories.map((category) => {
                const isActive = activeFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveFilter(category)}
                    className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium mb-1 transition-colors duration-200
                ${
                  isActive
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-white/70 border-white/20 hover:bg-white/10 hover:border-white/30'
                }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main List Area (unchanged) */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {panelView === 'locations' ? (
            // --- Locations View ---
            allLocations.length > 0 ? (
              <div className="flex flex-col gap-3">
                {allLocations.map((location, index) => {
                  const eventCount = allEvents.filter(
                    (event) => event.locationId === location.id
                  ).length;
                  return (
                    <LocationCard
                      key={location.id}
                      location={location}
                      eventCount={eventCount}
                      // ✅ MODIFIED: Use the new handler
                      onNavigate={() => handleNavigationClick(location.id)}
                      delay={index * 50}
                      isVisible={isOpen}
                    />
                  );
                })}
              </div>
            ) : (
              <NoItemsPlaceholder
                text="No locations found"
                iconType="building"
              />
            )
          ) : eventsToShow.length > 0 ? (
            // --- Events View ---
            <div className="flex flex-col gap-3">
              {eventsToShow.map((event, index) => {
                const eventLocation = allLocations.find(
                  (loc) => loc.id === event.locationId
                );
                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    locationName={eventLocation?.name || 'Unknown'}
                    showLocationName={panelView === 'events'}
                    // ✅ MODIFIED: Use the new handler
                    onNavigate={() => handleNavigationClick(event.locationId)}
                    delay={index * 50}
                    isVisible={isOpen}
                  />
                );
              })}
            </div>
          ) : (
            // --- No Events View ---
            <NoItemsPlaceholder
              text="No events for this category"
              iconType="calendar"
            />
          )}
        </div>
      </div>
    </>
  );
}

// --- (Helper Components below are unchanged) ---

function TabButton({ label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-white text-black'
          : 'bg-white/10 text-white/80 hover:bg-white/20'
      }`}
    >
      {label}
    </button>
  );
}

function EventCard({
  event,
  locationName,
  showLocationName,
  onNavigate,
  delay,
  isVisible,
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${isVisible ? delay : 0}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isHovered
            ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
            : 'bg-gradient-to-br from-blue-500/0 to-purple-500/0'
        }`}
      />

      <div className="relative p-4 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-base font-semibold truncate mb-1">
            {event.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="truncate">{event.committee}</span>
            <span className="text-white/20">•</span>
            <span className="flex-shrink-0">{event.time}</span>
          </div>

          {showLocationName && (
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-blue-400 truncate">{locationName}</span>
            </div>
          )}
        </div>

        <button
          onClick={onNavigate}
          className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 hover:border-blue-500/50 hover:text-blue-200 transition"
        >
          Navigate
        </button>
      </div>
    </div>
  );
}

function LocationCard({ location, eventCount, onNavigate, delay, isVisible }) {
  const [isHovered, setIsHovered] = React.useState(false);
  const eventText = eventCount === 1 ? '1 event' : `${eventCount} events`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        transitionDelay: `${isVisible ? delay : 0}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 transition-all duration-300 ${
          isHovered
            ? 'bg-gradient-to-br from-blue-500/5 to-purple-500/5'
            : 'bg-gradient-to-br from-blue-500/0 to-purple-500/0'
        }`}
      />
      <div className="relative p-4 flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-base font-semibold truncate mb-1">
            {location.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-40Type">
            <svg
              className="w-3.5 h-3.5 text-white/40 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4M8 11V9m8 2V9"
              />
            </svg>
            <span className={eventCount === 0 ? 'text-gray-500' : ''}>
              {eventText}
            </span>
          </div>
        </div>
        <button
          onClick={onNavigate}
          className="flex-shrink-0 px-4 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium hover:bg-blue-500/30 hover:border-blue-500/50 hover:text-blue-200 transition"
        >
          View
        </button>
      </div>
    </div>
  );
}

function NoItemsPlaceholder({ text, iconType = 'calendar' }) {
  const iconPath =
    iconType === 'calendar'
      ? 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
      : 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-4a2 2 0 012-2h6a2 2 0 012 2v4M8 11V9m8 2V9';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-white/20"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={iconPath}
          />
        </svg>
      </div>
      <p className="text-gray-400">{text}</p>
    </div>
  );
}