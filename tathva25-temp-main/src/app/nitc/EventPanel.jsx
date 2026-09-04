import React from 'react';

// Main Panel Component
export function EventPanel({ 
  panelView, 
  activeLocation, 
  allEvents, 
  allLocations, 
  onClose, 
  onNavigate 
}) {
  const isOpen = panelView !== null;
  const [isDesktop, setIsDesktop] = React.useState(false);
  
  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);
  
  // Filter events based on the current view
  const eventsToShow = panelView === 'location' && activeLocation
    ? allEvents.filter(event => event.locationId === activeLocation.id)
    : allEvents;
  
  // Set the title based on the view
  const title = panelView === 'location' && activeLocation
    ? activeLocation.name
    : 'All Events';
    
  return (
    <>
      {/* Backdrop for mobile */}
      {!isDesktop && (
        <div
          className={`
            fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={onClose}
        />
      )}
      
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(24px)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          
          // Mobile styles
          ...(isDesktop ? {} : {
            bottom: 0,
            left: 0,
            right: 0,
            height: '70vh',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4)',
            transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          }),
          
          // Desktop styles
          ...(isDesktop ? {
            top: 0,
            right: 0,
            bottom: 0,
            width: '384px',
            height: '100%',
            borderRadius: 0,
            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.4)',
            transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          } : {}),
        }}
      >
        {/* Drag indicator for mobile */}
        {!isDesktop && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '8px' }}>
            <div style={{ width: '48px', height: '4px', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
          </div>
        )}
        
        {/* Header */}
        <div style={{ 
          flexShrink: 0, 
          padding: '16px 24px', 
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: 'white', 
                margin: 0,
                letterSpacing: '-0.025em'
              }}>
                {title}
              </h2>
              <p style={{ 
                fontSize: '14px', 
                color: '#9ca3af', 
                margin: '4px 0 0 0' 
              }}>
                {eventsToShow.length} {eventsToShow.length === 1 ? 'event' : 'events'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: 'rgba(255, 255, 255, 0.6)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Event List */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px 24px' 
        }}>
          {eventsToShow.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {eventsToShow.map((event, index) => {
                const eventLocation = allLocations.find(
                  loc => loc.id === event.locationId
                );
                
                return (
                  <EventCard 
                    key={event.id}
                    event={event}
                    locationName={eventLocation?.name || 'Unknown'}
                    showLocationName={panelView === 'events'}
                    onNavigate={() => onNavigate(event.locationId)}
                    delay={index * 50}
                    isVisible={isOpen}
                  />
                );
              })}
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              textAlign: 'center' 
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginBottom: '16px' 
              }}>
                <svg style={{ width: '32px', height: '32px', color: 'rgba(255, 255, 255, 0.2)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p style={{ color: '#9ca3af' }}>No events scheduled</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Event Card Component
function EventCard({ event, locationName, showLocationName, onNavigate, delay, isVisible }) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${isVisible ? delay : 0}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(16px)',
        ...(isHovered && {
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
        })
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0), rgba(168, 85, 247, 0))',
        ...(isHovered && {
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))',
        }),
        transition: 'all 0.3s',
      }} />
      
      <div style={{ 
        position: 'relative', 
        padding: '16px', 
        display: 'flex', 
        alignItems: 'start', 
        justifyContent: 'space-between', 
        gap: '16px' 
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: 'white', 
            margin: '0 0 4px 0',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {event.name}
          </h3>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '14px', 
            color: '#9ca3af', 
            marginBottom: '8px' 
          }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.committee}</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>•</span>
            <span style={{ flexShrink: 0 }}>{event.time}</span>
          </div>
          
          {showLocationName && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
              <svg style={{ width: '14px', height: '14px', color: '#60a5fa', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ color: '#60a5fa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{locationName}</span>
            </div>
          )}
        </div>
        
        <button
          onClick={onNavigate}
          style={{
            flexShrink: 0,
            padding: '8px 16px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            fontSize: '14px',
            fontWeight: '500',
            color: '#93c5fd',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.color = '#bfdbfe';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
            e.currentTarget.style.color = '#93c5fd';
          }}
        >
          Navigate
        </button>
      </div>
    </div>
  );
}

