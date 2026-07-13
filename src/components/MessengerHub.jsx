import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

export default function MessengerHub({ 
  conversations, 
  setConversations,
  activeThreadId,
  setActiveThreadId,
  onPopulateBookingDrawer 
}) {
  const [replyText, setReplyText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  
  // Extracted data for currently selected thread
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

  const chatEndRef = useRef(null);

  // Auto-scroll chat window to bottom when messages list changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeThreadId]);

  // Find active thread
  const activeThread = conversations.find(c => c.id === activeThreadId) || conversations[0];

  // Mark active thread as read
  useEffect(() => {
    async function markAsRead() {
      if (activeThread && activeThread.unread && supabase) {
        try {
          const { error } = await supabase
            .from('conversations')
            .update({ unread: false })
            .eq('id', activeThread.id);

          if (error) throw error;
        } catch (err) {
          console.error('Failed to update unread status:', err);
        }
      }
      
      if (activeThread && activeThread.unread) {
        setConversations(prev => prev.map(c => 
          c.id === activeThread.id ? { ...c, unread: false } : c
        ));
      }
    }

    markAsRead();

    // Auto-parse on thread selection
    if (activeThread) {
      parseThreadText(activeThread);
    }
  }, [activeThreadId, activeThread, setConversations]);

  // Regex Parsing Logic (Hoisted to avoid accessed-before-declaration errors)
  function parseThreadText(thread) {
    if (!thread || !thread.messages) return;

    // Combine all client messages to extract data
    const clientText = thread.messages
      .filter(m => m.sender === 'client')
      .map(m => m.text)
      .join('\n');

    const nameRegex = /(?:Name|Client|Customer)(?:\s*Name)?\s*[:-]\s*([^\n]+)/i;
    const fbLinkRegex = /(?:FB|Facebook|Profile)(?:\s*Link)?\s*[:-]\s*([^\n]+)/i;
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
    const phoneRegex = /(?:Phone|Contact|Mobile|Number)\s*[:-]\s*([\d+\s-]+)/i;
    const phoneFallbackRegex = /(09\d{9}|\+63\d{10})/;
    const destRegex = /(?:Destination|Location|Place|To)\s*[:-]\s*([^\n]+)/i;
    const datesRegex = /(?:Dates|Travel Dates|Date|Itinerary|Duration)\s*[:-]\s*([^\n]+)/i;
    const paxRegex = /(?:Pax|Guests|Headcount|No\. of pax|People)\s*[:-]\s*(\d+)/i;
    const totalRegex = /(?:Total Amount|Total Bill|Price|Bill|Total|Rate)\s*[:-]\s*(?:PHP|₱)?\s*([\d,]+)/i;
    const paidRegex = /(?:Amount Paid|Deposit|Paid|Downpayment|Down)\s*[:-]\s*(?:PHP|₱)?\s*([\d,]+)/i;

    const clientName = (clientText.match(nameRegex)?.[1] || '').trim();
    const fbLink = (clientText.match(fbLinkRegex)?.[1] || '').trim();
    const email = (clientText.match(emailRegex)?.[1] || '').trim();
    
    let phone = (clientText.match(phoneRegex)?.[1] || '').trim();
    if (!phone) {
      phone = (clientText.match(phoneFallbackRegex)?.[1] || '').trim();
    }
    
    const destination = (clientText.match(destRegex)?.[1] || '').trim();
    const travelDates = (clientText.match(datesRegex)?.[1] || '').trim();
    const pax = (clientText.match(paxRegex)?.[1] || '').trim();
    
    const totalAmountStr = (clientText.match(totalRegex)?.[1] || '').replace(/,/g, '').trim();
    const amountPaidStr = (clientText.match(paidRegex)?.[1] || '').replace(/,/g, '').trim();

    setExtractedData({
      clientName: clientName || thread.name, // Fallback to thread name
      fbLink: fbLink || `facebook.com/${(thread.name || '').toLowerCase().replace(/\s+/g, '.')}`,
      email: email || '',
      phone: phone || '',
      destination: destination || '',
      travelDates: travelDates || '',
      pax: pax ? parseInt(pax) : '',
      totalAmount: totalAmountStr ? parseFloat(totalAmountStr) : '',
      amountPaid: amountPaidStr ? parseFloat(amountPaidStr) : ''
    });
  }

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThread) return;

    const timestampLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyMessage = {
      conversation_id: activeThread.id,
      sender: 'agent',
      text: replyText,
      timestamp_label: timestampLabel
    };

    if (supabase) {
      try {
        const { error } = await supabase
          .from('messages')
          .insert(replyMessage);

        if (error) throw error;

        // Append agent message to conversation thread locally
        setConversations(prev => prev.map(c => {
          if (c.id === activeThread.id) {
            return {
              ...c,
              messages: [
                ...c.messages,
                { 
                  sender: 'agent', 
                  text: replyText, 
                  timestamp: timestampLabel 
                }
              ]
            };
          }
          return c;
        }));

        // Dispatch outbound message to Meta via our backend relay
        try {
          await fetch(`${import.meta.env.VITE_API_URL || ''}/api/send-reply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              conversationId: activeThread.id,
              text: replyText
            })
          });
        } catch (webhookErr) {
          console.error('Failed to trigger outbound webhook:', webhookErr);
        }
      } catch (err) {
        console.error('Failed to send message to database:', err);
        alert('Failed to send reply.');
      }
    } else {
      // Offline fallback
      setConversations(prev => prev.map(c => {
        if (c.id === activeThread.id) {
          return {
            ...c,
            messages: [
              ...c.messages,
              { 
                sender: 'agent', 
                text: replyText, 
                timestamp: timestampLabel 
              }
            ]
          };
        }
        return c;
      }));
    }

    setReplyText('');
  };

  const handleForceAnalyze = () => {
    setIsParsing(true);
    setTimeout(() => {
      parseThreadText(activeThread);
      setIsParsing(false);
    }, 600);
  };

  const handleCreateBooking = () => {
    if (!extractedData.destination) {
      alert("Please ensure the thread has a parsed Destination before generating booking.");
      return;
    }
    onPopulateBookingDrawer(extractedData);
  };

  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="panel active">
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>Facebook Page Inbox Manager</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Real-time chat client. Review transcripts, reply to inquiries, and parse traveler info instantly.</p>
      </div>

      {activeThread ? (
        <div className="messenger-layout">
          {/* Left: Chat threads list */}
          <div className="card messenger-threads-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ fontSize: '13px', color: '#ffffff', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conversations</h3>
            <div className="messenger-threads-list">
              {conversations.map((c) => {
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <div 
                    key={c.id} 
                    className={`messenger-thread-item ${activeThreadId === c.id ? 'active' : ''} ${c.unread ? 'unread' : ''}`}
                    onClick={() => setActiveThreadId(c.id)}
                  >
                    <div className="client-avatar" style={{ width: '32px', height: '32px', fontSize: '11px' }}>
                      {getInitials(c.name)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</span>
                        {c.unread && (
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)' }} />
                        )}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                        {lastMsg ? lastMsg.text : 'No messages'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center: Live Chat Bubble History */}
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Chat Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="client-avatar" style={{ width: '36px', height: '36px', fontSize: '12px' }}>
                {getInitials(activeThread.name)}
              </div>
              <div>
                <h4 style={{ fontSize: '14px', color: '#ffffff', fontWeight: '600' }}>{activeThread.name}</h4>
                <span style={{ fontSize: '10px', color: 'var(--status-paid)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                  Connected via Facebook Messenger
                </span>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="chat-history">
              {activeThread.messages.map((msg, index) => (
                <div key={index} className={`chat-bubble-container ${msg.sender === 'client' ? 'client-side' : 'agent-side'}`}>
                  <div className="chat-bubble">
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                    {msg.timestamp && (
                      <span className="chat-bubble-meta">{msg.timestamp}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendReply} className="chat-input-container">
              <input
                type="text"
                className="form-control"
                placeholder="Type your reply to customer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ borderRadius: '20px', padding: '10px 18px' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                disabled={!replyText.trim()}
              >
                <svg style={{ width: '16px', height: '16px', transform: 'rotate(45deg)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>

          {/* Right: Extracted Lead context card */}
          <div className="card messenger-details-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '13px', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thread Analytics</h3>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 8px', fontSize: '10px' }} 
                  onClick={handleForceAnalyze}
                  disabled={isParsing}
                >
                  {isParsing ? '...' : 'Re-Analyze'}
                </button>
              </div>

              <div className="parser-extracted-list" style={{ gap: '10px' }}>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Name</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>{extractedData.clientName}</span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Phone</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>{extractedData.phone || 'Not found'}</span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Email</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>{extractedData.email || 'Not found'}</span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Destination</span>
                  <span className="extracted-value highlighted" style={{ fontSize: '12px' }}>{extractedData.destination || 'Not found'}</span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Travel Dates</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>{extractedData.travelDates || 'Not found'}</span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Pax</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>{extractedData.pax || 'Not found'}</span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Total Price</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>
                    {extractedData.totalAmount ? `₱${extractedData.totalAmount.toLocaleString()}` : 'Not found'}
                  </span>
                </div>
                <div className="extracted-item" style={{ paddingBottom: '6px' }}>
                  <span className="extracted-label" style={{ fontSize: '11px' }}>Deposit Paid</span>
                  <span className="extracted-value" style={{ fontSize: '12px' }}>
                    {extractedData.amountPaid ? `₱${extractedData.amountPaid.toLocaleString()}` : 'Not found'}
                  </span>
                </div>
              </div>
            </div>

            <button 
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '10px' }}
              onClick={handleCreateBooking}
              disabled={!extractedData.destination}
            >
              <svg style={{ width: '14px', height: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Populate Booking Form
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No customer message channels available.
        </div>
      )}
    </div>
  );
}
