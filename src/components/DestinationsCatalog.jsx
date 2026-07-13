
const destinationsData = [
  {
    id: 'boracay',
    name: 'Boracay Island',
    description: 'World-famous for its powder-soft white sand beaches, crystal clear turqouise waters, and legendary vibrant sunset views.',
    rate: 6000,
    tags: ['Beach', 'Nightlife', 'Water Sports'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="1"/>
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
    svgIllustration: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="40" r="18" fill="var(--brand-primary)" opacity="0.8" />
        <path d="M10 80 C 30 75, 70 75, 90 80 L 90 90 L 10 90 Z" fill="#ffa200" opacity="0.3"/>
        <path d="M10 85 C 30 82, 70 82, 90 85 L 90 90 L 10 90 Z" fill="#032757" opacity="0.6"/>
        {/* Palm tree */}
        <path d="M25 80 Q 30 60, 40 45" stroke="#ffa200" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M40 45 Q 45 42, 55 45 M40 45 Q 35 40, 28 42 M40 45 Q 42 35, 48 28 M40 45 Q 36 32, 28 32 M40 45 Q 48 48, 52 56" stroke="var(--brand-primary)" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    )
  },
  {
    id: 'palawan',
    name: 'Palawan (El Nido)',
    description: 'A paradise renowned for majestic towering karst limestone formations, hidden secret lagoons, and underwater marine sanctuaries.',
    rate: 7500,
    tags: ['Island Hopping', 'Nature', 'Lagoons'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
    svgIllustration: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mountains / Limestone cliffs */}
        <path d="M15 80 L35 40 L55 65 L75 35 L90 80 Z" fill="#032757" opacity="0.7"/>
        <path d="M25 80 L45 50 L65 72 L80 48 L95 80 Z" fill="#ffa200" opacity="0.3"/>
        {/* Sun */}
        <circle cx="80" cy="25" r="10" fill="var(--brand-primary)" />
        {/* Sea water */}
        <path d="M5 80 Q 25 78, 50 80 T 95 80 L 95 95 L 5 95 Z" fill="#032757" opacity="0.8"/>
      </svg>
    )
  },
  {
    id: 'siargao',
    name: 'Siargao Island',
    description: 'The surfing capital of the country, boasting world-class waves at Cloud 9, extensive coconut forests, and rock pools.',
    rate: 8000,
    tags: ['Surfing', 'Eco-Tourism', 'Adventure'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 10h20M2 14h20" />
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      </svg>
    ),
    svgIllustration: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Surfing Waves */}
        <path d="M10 80 Q 25 50, 45 60 T 80 75 Q 90 80, 95 80" stroke="var(--brand-primary)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M5 85 Q 20 62, 38 70 T 75 80" stroke="#ffa200" strokeWidth="2.5" fill="none" opacity="0.7"/>
        {/* Cloud 9 Boardwalk silhouette */}
        <path d="M15 80 L30 80 L32 75 L45 75 L47 80 L70 80" stroke="#032757" strokeWidth="2" fill="none"/>
        <line x1="20" y1="80" x2="20" y2="90" stroke="#032757" strokeWidth="1.5"/>
        <line x1="28" y1="80" x2="28" y2="90" stroke="#032757" strokeWidth="1.5"/>
        <line x1="38" y1="75" x2="38" y2="90" stroke="#032757" strokeWidth="1.5"/>
        <line x1="60" y1="80" x2="60" y2="90" stroke="#032757" strokeWidth="1.5"/>
      </svg>
    )
  },
  {
    id: 'bohol',
    name: 'Bohol Province',
    description: 'Home to the bizarre Chocolate Hills geological structures, the miniature tarsier monkeys, and pristine river cruises.',
    rate: 5500,
    tags: ['Heritage', 'Wildlife', 'Countryside'],
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    svgIllustration: (
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Chocolate Hills */}
        <path d="M10 85 C 20 70, 30 70, 40 85" fill="#ffa200" opacity="0.7"/>
        <path d="M30 85 C 42 62, 58 62, 70 85" fill="#032757" opacity="0.6"/>
        <path d="M60 85 C 70 72, 80 72, 90 85" fill="var(--brand-primary)" opacity="0.5"/>
        {/* Flying birds */}
        <path d="M20 30 Q 25 25, 30 30 Q 35 25, 40 30" stroke="var(--brand-primary)" strokeWidth="1.5" fill="none"/>
        <path d="M65 25 Q 68 21, 71 25 Q 74 21, 77 25" stroke="#ffa200" strokeWidth="1.5" fill="none"/>
      </svg>
    )
  }
];

export default function DestinationsCatalog({ bookings, onQuickBook }) {
  
  // Format currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(val);
  };

  // Get active traveler counts for a destination name (case-insensitive substring match)
  const getActiveTravelersCount = (destName) => {
    const matchedBookings = bookings.filter(b => 
      b.status !== 'Cancelled' && 
      (b.destination || '').toLowerCase().includes(destName.split(' ')[0].toLowerCase())
    );
    const count = matchedBookings.reduce((sum, b) => sum + (parseInt(b.pax) || 0), 0);
    return count;
  };

  return (
    <div className="panel active">
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Philippine Destinations Catalog</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Explore packages, standard pricing guidelines, and active guest analytics.</p>
      </div>

      {/* Grid */}
      <div className="destinations-grid">
        {destinationsData.map((dest) => {
          const travelerCount = getActiveTravelersCount(dest.name);
          return (
            <div key={dest.id} className="card destination-card" style={{ padding: 0 }}>
              {/* Image / Vector Backdrop */}
              <div className="destination-image-backdrop">
                {dest.svgIllustration}
                <div className="destination-price-tag">
                  {formatCurrency(dest.rate)} / pax
                </div>
              </div>

              {/* Body */}
              <div className="destination-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '16px', color: '#ffffff' }}>{dest.name}</h3>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5', margin: '4px 0 12px 0', flexGrow: 1 }}>
                  {dest.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {dest.tags.map((tag, idx) => (
                    <span 
                      key={idx} 
                      className="badge" 
                      style={{ 
                        fontSize: '9px', 
                        padding: '3px 8px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                        border: '1px solid var(--border-color)', 
                        color: 'var(--text-muted)' 
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Footer Metrics & Actions */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Guests</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: travelerCount > 0 ? 'var(--status-paid)' : 'var(--text-muted)' }}>
                      {travelerCount} pax traveling
                    </span>
                  </div>

                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                    onClick={() => onQuickBook({
                      destination: dest.name,
                      totalAmount: dest.rate
                    })}
                  >
                    <svg style={{ width: '13px', height: '13px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="12" y1="18" x2="12" y2="12" />
                      <line x1="9" y1="15" x2="15" y2="15" />
                    </svg>
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
