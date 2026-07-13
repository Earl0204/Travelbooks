import { useState, useEffect } from 'react';

export default function FBParser({ 
  inputText, 
  setInputText, 
  onPopulateBookingDrawer 
}) {
  const [isParsing, setIsParsing] = useState(false);
  const [extractedData, setExtractedData] = useState({
    clientName: '',
    fbLink: '',
    email: '',
    phone: '',
    destination: '',
    travelDates: '',
    pax: '',
    totalAmount: '',
    amountPaid: ''
  });

  const parseRegex = (text) => {
    if (!text) return;

    // Helper regex rules
    const nameRegex = /(?:Name|Client|Customer)(?:\s*Name)?\s*[:-]\s*([^\n]+)/i;
    const fbLinkRegex = /(?:FB|Facebook|Profile)(?:\s*Link)?\s*[:-]\s*([^\n]+)/i;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const phoneRegex = /(?:Phone|Contact|Mobile|Number)\s*[:-]\s*([\d+\s-]+)/i;
    // Standalone fallback for 11 digit numbers
    const phoneFallbackRegex = /(09\d{9}|\+63\d{10})/;
    const destRegex = /(?:Destination|Location|Place|To)\s*[:-]\s*([^\n]+)/i;
    const datesRegex = /(?:Dates|Travel Dates|Date|Itinerary|Duration)\s*[:-]\s*([^\n]+)/i;
    const paxRegex = /(?:Pax|Guests|Headcount|No\. of pax|People)\s*[:-]\s*(\d+)/i;
    const totalRegex = /(?:Total Amount|Total Bill|Price|Bill|Total|Rate)\s*[:-]\s*(?:PHP|₱)?\s*([\d,]+)/i;
    const paidRegex = /(?:Amount Paid|Deposit|Paid|Downpayment|Down)\s*[:-]\s*(?:PHP|₱)?\s*([\d,]+)/i;

    // Execution
    const clientName = (text.match(nameRegex)?.[1] || '').trim();
    const fbLink = (text.match(fbLinkRegex)?.[1] || '').trim();
    const email = (text.match(emailRegex)?.[1] || '').trim();
    
    let phone = (text.match(phoneRegex)?.[1] || '').trim();
    if (!phone) {
      phone = (text.match(phoneFallbackRegex)?.[1] || '').trim();
    }
    
    const destination = (text.match(destRegex)?.[1] || '').trim();
    const travelDates = (text.match(datesRegex)?.[1] || '').trim();
    const pax = (text.match(paxRegex)?.[1] || '').trim();
    
    const totalAmountStr = (text.match(totalRegex)?.[1] || '').replace(/,/g, '').trim();
    const amountPaidStr = (text.match(paidRegex)?.[1] || '').replace(/,/g, '').trim();

    setExtractedData({
      clientName: clientName || '',
      fbLink: fbLink || '',
      email: email || '',
      phone: phone || '',
      destination: destination || '',
      travelDates: travelDates || '',
      pax: pax ? parseInt(pax) : '',
      totalAmount: totalAmountStr ? parseFloat(totalAmountStr) : '',
      amountPaid: amountPaidStr ? parseFloat(amountPaidStr) : ''
    });
  };

  // Trigger parsing automatically if inputText changes from external triggers (like simulated toast click)
  useEffect(() => {
    if (inputText) {
      // Defer state updates to prevent synchronous render warnings
      const timer = setTimeout(() => {
        parseRegex(inputText);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [inputText]);

  const handleAnalyze = () => {
    if (!inputText.trim()) {
      alert("Please paste facebook conversation thread text to analyze!");
      return;
    }
    setIsParsing(true);
    // Simulate loading for premium experience
    setTimeout(() => {
      parseRegex(inputText);
      setIsParsing(false);
    }, 800);
  };

  const handleClear = () => {
    setInputText('');
    setExtractedData({
      clientName: '',
      fbLink: '',
      email: '',
      phone: '',
      destination: '',
      travelDates: '',
      pax: '',
      totalAmount: '',
      amountPaid: ''
    });
  };

  const handleCreateBooking = () => {
    if (!extractedData.clientName && !extractedData.destination) {
      alert("No significant client details found. Please parse details first.");
      return;
    }
    onPopulateBookingDrawer(extractedData);
  };

  return (
    <div className="panel active">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Facebook DM Lead Extractor</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Paste raw messaging chat threads here. The system extracts travel criteria using customized regex filters.</p>
      </div>

      <div className="parser-layout">
        {/* Input Textbox Card */}
        <div className="card parser-input-card">
          <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)' }}>Raw chat transcript / copied message:</label>
          <textarea
            className="parser-textarea"
            placeholder={`Example copied content:
Name: John Doe
FB Profile: fb.com/johndoe
Phone: 09176543210
Email: john@gmail.com
Destination: Siargao Island
Dates: July 15-20, 2026
Pax: 3 pax
Total Rate: 18,500
Paid Deposit: 5,000`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyze} 
              style={{ flexGrow: 1, justifyContent: 'center' }}
              disabled={isParsing}
            >
              {isParsing ? (
                <>
                  <span className="spinner" style={{ marginRight: '8px' }} />
                  Extracting leads...
                </>
              ) : (
                'Extract Details with Regex'
              )}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleClear}
              disabled={isParsing}
            >
              Reset Text
            </button>
          </div>
        </div>

        {/* Extracted Details Outputs */}
        <div className="card parser-results-card">
          <div>
            <h3 style={{ fontSize: '15px', color: '#ffffff', marginBottom: '16px' }}>Extracted Entities</h3>
            
            <div className="parser-extracted-list">
              <div className="extracted-item">
                <span className="extracted-label">Client Full Name</span>
                <span className={`extracted-value ${extractedData.clientName ? 'highlighted' : ''}`}>
                  {extractedData.clientName || 'Not found'}
                </span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">FB Profile/Link</span>
                <span className="extracted-value">{extractedData.fbLink || 'Not found'}</span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Contact Number</span>
                <span className="extracted-value">{extractedData.phone || 'Not found'}</span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Email Address</span>
                <span className="extracted-value">{extractedData.email || 'Not found'}</span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Destination Location</span>
                <span className={`extracted-value ${extractedData.destination ? 'highlighted' : ''}`}>
                  {extractedData.destination || 'Not found'}
                </span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Travel Itinerary Dates</span>
                <span className="extracted-value">{extractedData.travelDates || 'Not found'}</span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Passenger Count (Pax)</span>
                <span className="extracted-value">{extractedData.pax || 'Not found'}</span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Quoted Price (PHP)</span>
                <span className="extracted-value">
                  {extractedData.totalAmount ? `₱${extractedData.totalAmount.toLocaleString()}` : 'Not found'}
                </span>
              </div>

              <div className="extracted-item">
                <span className="extracted-label">Deposit Received (PHP)</span>
                <span className="extracted-value">
                  {extractedData.amountPaid ? `₱${extractedData.amountPaid.toLocaleString()}` : 'Not found'}
                </span>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', marginTop: '24px' }}
            onClick={handleCreateBooking}
            disabled={!extractedData.clientName && !extractedData.destination}
          >
            <svg style={{ width: '16px', height: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
            Pre-populate & Open Booking Form
          </button>
        </div>
      </div>
    </div>
  );
}
