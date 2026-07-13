import { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Bookings from './components/Bookings';
import Projects from './components/Projects';
import Reports from './components/Reports';
import FBParser from './components/FBParser';
import BookingDrawer from './components/BookingDrawer';
import TaskDrawer from './components/TaskDrawer';
import MessengerHub from './components/MessengerHub';
import DestinationsCatalog from './components/DestinationsCatalog';
import { supabase } from './supabaseClient';

// Seed Initial Data
const initialActivities = [];

// Simulated Inquiries List (Retained for the Real-time Lead Simulator)
const simulatedInquiries = [
  {
    name: "Juan dela Cruz",
    text: `Inquiry Details:
Name: Juan dela Cruz
FB Link: facebook.com/juan.delacruz
Phone: 09187654321
Email: juan.delacruz@gmail.com
Destination: Boracay
Dates: October 10 to October 14, 2026
Pax: 2 adults
Total Amount: 12,500
Amount Paid: 3,000`
  },
  {
    name: "Maria Regina Santos",
    text: `Good day Travelbooks! Asking for quotation:
Name: Maria Regina Santos
FB Link: facebook.com/maria.santos99
Phone: 09159988776
Destination: Palawan (El Nido)
Dates: Nov 5 - Nov 9, 2026
Pax: 4 headcount
Total Amount: 28,000
Amount Paid: 8,000`
  },
  {
    name: "Dexter Sy",
    text: `Hi booking coordinator:
Name: Dexter Sy
FB Link: facebook.com/dexter.sy.official
Email: dextersy@yahoo.com
Mobile: 09228881234
Destination: Siargao
Dates: December 20-25, 2026
Pax: 5 passengers
Total Amount: 35,000
Amount Paid: 10,000`
  },
  {
    name: "Althea Mendoza",
    text: `Facebook Inquiry Transcript:
Name: Althea Mendoza
FB Link: facebook.com/altheamendoza
Phone: 09051234567
Destination: Bohol
Dates: Jan 15-18, 2027
Pax: 3 pax
Total Amount: 16,000
Amount Paid: 4,000`
  }
];

const initialConversations = [
  {
    id: 'conv-init-1',
    name: 'Juan dela Cruz',
    unread: true,
    status: 'Ready',
    messages: [
      {
        sender: 'client',
        text: `Inquiry Details:
Name: Juan dela Cruz
FB Link: facebook.com/juan.delacruz
Phone: 09187654321
Email: juan.delacruz@gmail.com
Destination: Boracay
Dates: October 10 to October 14, 2026
Pax: 2 adults
Total Amount: 12,500
Amount Paid: 3,000`,
        timestamp: '10:30 AM'
      }
    ]
  }
];

export default function App() {
  // Authentication Session
  const [session, setSession] = useState(null);
  const isAuthenticated = !!session;

  useEffect(() => {
    if (supabase) {
      // Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      // Listen to auth events
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session);
        if (event === 'SIGNED_IN') {
          logSystemActivity('Admin authentication session started successfully', 'booking_updated');
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  // Core App States
  const [bookings, setBookings] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [conversations, setConversations] = useState(initialConversations);
  const [activeThreadId, setActiveThreadId] = useState(null);

  const [activities, setActivities] = useState(initialActivities);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    async function loadData() {
      if (!session) {
        setBookings([]);
        setTasks([]);
        setIsLoading(false);
        return;
      }
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      try {
        // Fetch Bookings
        const { data: bData, error: bError } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });

        if (bError) throw bError;

        const mappedBookings = (bData || []).map(b => ({
          id: b.id,
          clientName: b.client_name,
          fbLink: b.fb_link,
          phone: b.phone,
          email: b.email,
          destination: b.destination,
          travelDates: b.travel_dates,
          pax: b.pax,
          totalAmount: b.total_amount,
          amountPaid: b.amount_paid,
          balance: b.balance,
          status: b.status,
          createdAt: b.created_at
        }));
        setBookings(mappedBookings);

        // Fetch Tasks
        const { data: tData, error: tError } = await supabase
          .from('tasks')
          .select('*')
          .order('created_at', { ascending: false });

        if (tError) throw tError;

        const mappedTasks = (tData || []).map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          bookingRef: t.booking_ref,
          status: t.status,
          dueDate: t.due_date,
          createdAt: t.created_at
        }));
        setTasks(mappedTasks);

        // Fetch Conversations & Messages
        const { data: cData, error: cError } = await supabase
          .from('conversations')
          .select('*')
          .order('created_at', { ascending: false });

        if (cError) throw cError;

        const conversationsWithMessages = [];
        for (const conv of (cData || [])) {
          const { data: mData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: true });

          conversationsWithMessages.push({
            id: conv.id,
            name: conv.name,
            unread: conv.unread,
            status: conv.status,
            messages: (mData || []).map(m => ({
              sender: m.sender,
              text: m.text,
              timestamp: m.timestamp_label
            }))
          });
        }
        
        if (conversationsWithMessages.length > 0) {
          setConversations(conversationsWithMessages);
        }
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [session]);

  // Drawers and Prefills State
  const [isBookingDrawerOpen, setIsBookingDrawerOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [prefilledBookingData, setPrefilledBookingData] = useState(null);

  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Facebook Inquiries Simulator States
  const [isSimulating, setIsSimulating] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [parserInputText, setParserInputText] = useState('');

  // Refs for simulator loop
  const simulatedIndexRef = useRef(1);
  const toastTimeoutRef = useRef(null);

  // Device Simulator States
  const [previewDevice, setPreviewDevice] = useState('desktop');
  const [scale, setScale] = useState(1);
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  const bodyAreaRef = useRef(null);

  // Status Bar Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // Simulator Bezel Auto-Scaling
  useEffect(() => {
    let frameId;

    const handleResize = () => {
      if (!bodyAreaRef.current) return;

      if (previewDevice === 'desktop') {
        setScale(1);
        return;
      }

      const padding = 48;
      const availableWidth = bodyAreaRef.current.clientWidth - padding;
      const availableHeight = bodyAreaRef.current.clientHeight - padding;

      let targetWidth = 1000;
      let targetHeight = 650;

      if (previewDevice === 'macbook') {
        targetWidth = 960 + 28;
        targetHeight = 600 + 28;
      } else if (previewDevice === 'iphone') {
        targetWidth = 375 + 24;
        targetHeight = 812 + 24;
      } else if (previewDevice === 'android') {
        targetWidth = 360 + 20;
        targetHeight = 740 + 20;
      }

      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      const newScale = Math.min(scaleX, scaleY, 1);
      setScale(newScale);
    };

    // Defer execution to prevent synchronous state changes inside the effect body
    frameId = requestAnimationFrame(handleResize);

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [previewDevice]);

  // Theme Sync effect



  // Theme Sync effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Real-time Facebook DM Simulator Effect
  useEffect(() => {
    if (!isAuthenticated || !isSimulating) return;

    const receiveLead = async () => {
      // Pick a simulated lead sequentially
      const lead = simulatedInquiries[simulatedIndexRef.current];
      
      // Update sequential pointer
      simulatedIndexRef.current = (simulatedIndexRef.current + 1) % simulatedInquiries.length;

      // Add to notifications
      const newNotification = {
        id: `NOTIF-${Date.now()}`,
        name: lead.name,
        text: lead.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setActiveToast(lead);

      if (supabase) {
        try {
          const convId = `conv-sim-${lead.name.toLowerCase().replace(/\s+/g, '-')}`;
          const timestampLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // Check if conversation exists
          const { data: conv } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', convId)
            .maybeSingle();

          if (!conv) {
            await supabase
              .from('conversations')
              .insert({
                id: convId,
                name: lead.name,
                unread: true,
                status: 'Ready'
              });
          } else {
            await supabase
              .from('conversations')
              .update({ unread: true })
              .eq('id', convId);
          }

          // Insert message
          await supabase
            .from('messages')
            .insert({
              conversation_id: convId,
              sender: 'client',
              text: lead.text,
              timestamp_label: timestampLabel
            });

          // Reload conversations
          const { data: cData } = await supabase
            .from('conversations')
            .select('*')
            .order('created_at', { ascending: false });

          const conversationsWithMessages = [];
          for (const c of (cData || [])) {
            const { data: mData } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', c.id)
              .order('created_at', { ascending: true });

            conversationsWithMessages.push({
              id: c.id,
              name: c.name,
              unread: c.unread,
              status: c.status,
              messages: (mData || []).map(m => ({
                sender: m.sender,
                text: m.text,
                timestamp: m.timestamp_label
              }))
            });
          }
          setConversations(conversationsWithMessages);
          setActiveThreadId(convId);
        } catch (err) {
          console.error('Failed to sync simulated lead to database:', err);
        }
      }

      // Log activity
      logSystemActivity(`Simulated FB DM lead received from <strong>${lead.name}</strong>`, 'lead_parsed');

      // Auto dismiss toast after 8 seconds if not clicked
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 8000);
    };

    // Run first lead after 5 seconds for immediate feedback
    const firstLeadTimeout = setTimeout(receiveLead, 5000);

    // Then run every 35 seconds thereafter
    const interval = setInterval(receiveLead, 35000);

    return () => {
      clearTimeout(firstLeadTimeout);
      clearInterval(interval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [isAuthenticated, isSimulating]);

  // Activity logger helper
  function logSystemActivity(text, type) {
    const newAct = {
      id: `ACT-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      timestamp: 'Just now',
      type
    };
    setActivities(prev => [newAct, ...prev]);
  }

  const handleLoginSuccess = () => {
    // Session state change logs activity automatically via useEffect subscription
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out of the session?')) {
      if (supabase) {
        await supabase.auth.signOut();
      }
      // Reset simulator states
      setActiveToast(null);
      setNotifications([]);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleToastClick = () => {
    if (!activeToast) return;
    
    // Redirect to Messenger inbox
    const matchedConv = conversations.find(c => (c.name || '').toLowerCase() === (activeToast.name || '').toLowerCase());
    if (matchedConv) {
      setActiveThreadId(matchedConv.id);
    }
    setActiveTab('messenger');
    
    // Dismiss toast
    setActiveToast(null);
    logSystemActivity(`Interacted with notification. Opened Messenger Inbox for <strong>${activeToast.name}</strong>`, 'lead_parsed');
  };

  const clearNotifications = () => {
    if (notifications.length > 0) {
      const latestNotif = notifications[0];
      
      // Redirect to Messenger inbox
      const matchedConv = conversations.find(c => (c.name || '').toLowerCase() === (latestNotif.name || '').toLowerCase());
      if (matchedConv) {
        setActiveThreadId(matchedConv.id);
      }
      setActiveTab('messenger');
      setNotifications([]);
      logSystemActivity(`Cleared notification bell inbox. Opened Messenger Inbox for <strong>${latestNotif.name}</strong>`, 'lead_parsed');
    }
  };

  // CRUD Bookings
  const handleSaveBooking = async (bookingData) => {
    if (!supabase) {
      alert('Supabase client is not configured.');
      return;
    }

    const dbBooking = {
      id: bookingData.id,
      client_name: bookingData.clientName,
      fb_link: bookingData.fbLink,
      phone: bookingData.phone,
      email: bookingData.email,
      destination: bookingData.destination,
      travel_dates: bookingData.travelDates,
      pax: bookingData.pax,
      total_amount: bookingData.totalAmount,
      amount_paid: bookingData.amountPaid,
      balance: bookingData.balance,
      status: bookingData.status,
      created_at: bookingData.createdAt
    };

    try {
      const exists = bookings.some(b => b.id === bookingData.id);
      if (exists) {
        const { error } = await supabase
          .from('bookings')
          .update(dbBooking)
          .eq('id', bookingData.id);

        if (error) throw error;

        setBookings(prev => prev.map(b => b.id === bookingData.id ? bookingData : b));
        logSystemActivity(`Updated booking invoice <strong>${bookingData.id}</strong> for <strong>${bookingData.clientName}</strong>`, 'booking_updated');
      } else {
        const { error } = await supabase
          .from('bookings')
          .insert(dbBooking);

        if (error) throw error;

        setBookings(prev => [bookingData, ...prev]);
        logSystemActivity(`Created new booking <strong>${bookingData.id}</strong> for <strong>${bookingData.clientName}</strong> (Dest: ${bookingData.destination})`, 'booking_created');
        
        // Auto create a Kanban task for preparation
        const autoTaskId = `TK-AUTO-${Date.now().toString().slice(-4)}`;
        const autoTask = {
          id: autoTaskId,
          title: 'Confirm itinerary itinerary details',
          description: `Draft destination check-in guidelines for ${bookingData.clientName}'s trip to ${bookingData.destination}.`,
          bookingRef: bookingData.id,
          status: 'todo',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          createdAt: new Date().toISOString().slice(0, 10)
        };

        const dbTask = {
          id: autoTask.id,
          title: autoTask.title,
          description: autoTask.description,
          booking_ref: autoTask.bookingRef,
          status: autoTask.status,
          due_date: autoTask.dueDate,
          created_at: autoTask.createdAt
        };

        const { error: taskError } = await supabase
          .from('tasks')
          .insert(dbTask);

        if (taskError) throw taskError;

        setTasks(prev => [autoTask, ...prev]);
        logSystemActivity(`Auto-generated Kanban card for <strong>${bookingData.clientName}</strong> itinerary prep`, 'task_moved');
      }
    } catch (err) {
      console.error('Error saving booking:', err);
      alert('Failed to save booking to database.');
    }
    
    // Close Drawer
    setIsBookingDrawerOpen(false);
    setBookingToEdit(null);
    setPrefilledBookingData(null);
  };

  const handleDeleteBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    if (!booking) return;

    if (window.confirm(`Are you sure you want to delete the booking for ${booking.clientName}? This will also delete associated tasks.`)) {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from('bookings')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setBookings(prev => prev.filter(b => b.id !== id));
        setTasks(prev => prev.filter(t => t.bookingRef !== id));
        logSystemActivity(`Deleted booking <strong>${id}</strong> and all linked Kanban task checklist cards`, 'booking_deleted');
      } catch (err) {
        console.error('Error deleting booking:', err);
        alert('Failed to delete booking from database.');
      }
    }
  };

  const handleEditBookingClick = (booking) => {
    setBookingToEdit(booking);
    setPrefilledBookingData(null);
    setIsBookingDrawerOpen(true);
  };

  const handlePopulateFromParser = (parsedData) => {
    setPrefilledBookingData(parsedData);
    setBookingToEdit(null);
    setIsBookingDrawerOpen(true);
  };

  const handleScanUpcomingTours = async (adminPhone, adminEmail, smsEnabled, emailEnabled) => {
    const parseTravelDate = (dateStr) => {
      if (!dateStr) return null;
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      const cleanStr = dateStr.toLowerCase();
      
      const isoMatch = cleanStr.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
      if (isoMatch) {
        return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
      }
      
      let matchedMonthIdx = -1;
      for (const month of months) {
        if (cleanStr.includes(month)) {
          matchedMonthIdx = months.indexOf(month);
          break;
        }
      }
      
      if (matchedMonthIdx !== -1) {
        const numbers = cleanStr.match(/\d+/g);
        if (numbers && numbers.length > 0) {
          const day = parseInt(numbers[0]);
          let year = new Date().getFullYear();
          if (numbers.length > 1) {
            const potentialYear = parseInt(numbers[1]);
            if (potentialYear >= 2000 && potentialYear <= 2100) {
              year = potentialYear;
            } else if (numbers.length > 2) {
              const potentialYear2 = parseInt(numbers[2]);
              if (potentialYear2 >= 2000 && potentialYear2 <= 2100) {
                year = potentialYear2;
              }
            }
          }
          return new Date(year, matchedMonthIdx, day);
        }
      }
      return null;
    };

    const nearingBookings = [];
    bookings.forEach(b => {
      if (b.status === 'Cancelled') return;
      const parsedDate = parseTravelDate(b.travelDates);
      if (!parsedDate) return;
      
      const diffTime = parsedDate.getTime() - Date.now();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 3) {
        nearingBookings.push({ booking: b, daysLeft: diffDays });
      }
    });

    if (nearingBookings.length === 0) {
      const targetDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
      const dateString = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      alert(`Alert Scan Complete:\nNo tours starting within 3 days found.\n\nTip: Add a booking with travel dates set to "${dateString}" to test alerts!`);
      return;
    }

    let alertSentText = "";
    const sendPromises = nearingBookings.map(async ({ booking, daysLeft }) => {
      const dayLabel = daysLeft === 0 ? "today" : (daysLeft === 1 ? "tomorrow" : `in ${daysLeft} days`);
      const messageBody = `Tour Alert: ${booking.clientName}'s trip to ${booking.destination} starts ${dayLabel}!`;
      
      if (smsEnabled && adminPhone) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to: adminPhone, message: messageBody })
          });
          const result = await response.json();
          if (response.ok) {
            const modeLabel = result.simulated ? 'SMS Simulated' : 'SMS Sent';
            alertSentText += `[${modeLabel} to ${adminPhone}] ${messageBody}\n`;
            logSystemActivity(`SMS alert dispatched to admin: <strong>${booking.clientName}</strong> tour starts ${dayLabel}`, 'booking_updated');
          } else {
            alertSentText += `[SMS Failed to ${adminPhone}] ${booking.clientName}: ${result.error}\n`;
            logSystemActivity(`SMS alert failed to admin: <strong>${booking.clientName}</strong> (${result.error})`, 'booking_updated');
          }
        } catch (err) {
          console.error('SMS send network error:', err);
          alertSentText += `[SMS Error to ${adminPhone}] ${booking.clientName}: Connection failed\n`;
          logSystemActivity(`SMS connection error to admin: <strong>${booking.clientName}</strong>`, 'booking_updated');
        }
      }
      if (emailEnabled && adminEmail) {
        alertSentText += `[Email to ${adminEmail}] ${messageBody}\n`;
        logSystemActivity(`Email alert sent to admin: <strong>${booking.clientName}</strong> tour starts ${dayLabel}`, 'booking_updated');
      }
    });

    await Promise.all(sendPromises);
    alert(`System Alerts Dispatch Complete:\n\n${alertSentText}`);
  };

  // CRUD Tasks / Kanban Board
  const handleSaveTask = async (taskData) => {
    if (!supabase) return;

    const dbTask = {
      id: taskData.id,
      title: taskData.title,
      description: taskData.description,
      booking_ref: taskData.bookingRef,
      status: taskData.status,
      due_date: taskData.dueDate,
      created_at: taskData.createdAt
    };

    try {
      const exists = tasks.some(t => t.id === taskData.id);
      if (exists) {
        const { error } = await supabase
          .from('tasks')
          .update(dbTask)
          .eq('id', taskData.id);

        if (error) throw error;

        setTasks(prev => prev.map(t => t.id === taskData.id ? taskData : t));
        logSystemActivity(`Modified details on task <strong>${taskData.title}</strong>`, 'task_moved');
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert(dbTask);

        if (error) throw error;

        setTasks(prev => [taskData, ...prev]);
        logSystemActivity(`Created new Kanban check card <strong>${taskData.title}</strong>`, 'task_moved');
      }
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Failed to save task to database.');
    }
    setIsTaskDrawerOpen(false);
    setTaskToEdit(null);
  };

  const handleDeleteTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (window.confirm(`Delete task "${task.title}"?`)) {
      if (!supabase) return;
      try {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setTasks(prev => prev.filter(t => t.id !== id));
        logSystemActivity(`Removed task card <strong>${task.title}</strong> from Kanban Board`, 'booking_deleted');
      } catch (err) {
        console.error('Error deleting task:', err);
        alert('Failed to delete task.');
      }
    }
  };

  const handleEditTaskClick = (task) => {
    setTaskToEdit(task);
    setIsTaskDrawerOpen(true);
  };

  const handleMoveTask = async (taskId, targetStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: targetStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: targetStatus } : t));
      
      // Status visual labels
      const labels = {
        'todo': 'Preparation / Pending',
        'in-progress': 'In Progress',
        'review': 'Quality Check / Review',
        'done': 'Completed / Ready'
      };
      logSystemActivity(`Task <strong>${task.title}</strong> moved to <em>${labels[targetStatus] || targetStatus}</em>`, 'task_moved');
    } catch (err) {
      console.error('Error moving task:', err);
    }
  };

  // View Routing Render Helper
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            bookings={bookings} 
            activities={activities} 
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onScanUpcomingTours={handleScanUpcomingTours}
          />
        );
      case 'bookings':
        return (
          <Bookings 
            bookings={bookings}
            searchQuery={searchQuery}
            onEditBookingClick={handleEditBookingClick}
            onDeleteBooking={handleDeleteBooking}
            onImportBookings={async (imported) => {
              if (!supabase) return;
              try {
                const dbImports = imported.map(newBk => ({
                  id: newBk.id,
                  client_name: newBk.clientName,
                  fb_link: newBk.fbLink,
                  phone: newBk.phone,
                  email: newBk.email,
                  destination: newBk.destination,
                  travel_dates: newBk.travelDates,
                  pax: newBk.pax,
                  total_amount: newBk.totalAmount,
                  amount_paid: newBk.amountPaid,
                  balance: newBk.balance,
                  status: newBk.status,
                  created_at: newBk.createdAt
                }));

                const { error } = await supabase
                  .from('bookings')
                  .upsert(dbImports);

                if (error) throw error;

                setBookings(prev => {
                  const merged = [...prev];
                  imported.forEach(newBk => {
                    const idx = merged.findIndex(b => b.id === newBk.id);
                    if (idx !== -1) {
                      merged[idx] = newBk;
                    } else {
                      merged.push(newBk);
                    }
                  });
                  return merged;
                });
                logSystemActivity(`Imported <strong>${imported.length}</strong> legacy bookings from CSV`, 'booking_created');
              } catch (err) {
                console.error('CSV Import Error:', err);
                alert('Failed to save imported bookings to database.');
              }
            }}
          />
        );
      case 'projects':
        return (
          <Projects 
            tasks={tasks}
            bookings={bookings}
            onAddTaskClick={() => {
              setTaskToEdit(null);
              setIsTaskDrawerOpen(true);
            }}
            onEditTaskClick={handleEditTaskClick}
            onDeleteTask={handleDeleteTask}
            onMoveTask={handleMoveTask}
          />
        );
      case 'reports':
        return <Reports bookings={bookings} />;
      case 'messenger':
        return (
          <MessengerHub
            conversations={conversations}
            setConversations={setConversations}
            activeThreadId={activeThreadId}
            setActiveThreadId={setActiveThreadId}
            onPopulateBookingDrawer={handlePopulateFromParser}
          />
        );
      case 'destinations':
        return (
          <DestinationsCatalog
            bookings={bookings}
            onQuickBook={(quickData) => {
              setPrefilledBookingData({
                clientName: '',
                fbLink: '',
                phone: '',
                email: '',
                destination: quickData.destination,
                travelDates: '',
                pax: 1,
                totalAmount: quickData.totalAmount,
                amountPaid: 0,
                status: 'Pending'
              });
              setBookingToEdit(null);
              setIsBookingDrawerOpen(true);
            }}
          />
        );
      case 'parser':
        return (
          <FBParser 
            inputText={parserInputText}
            setInputText={setParserInputText}
            onPopulateBookingDrawer={handlePopulateFromParser}
          />
        );
      default:
        return (
          <Dashboard 
            bookings={bookings} 
            activities={activities} 
            isSimulating={isSimulating}
            setIsSimulating={setIsSimulating}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        );
    }
  };

  // If user is not logged in, show Login Screen overlay
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Show loading screen during database fetch
  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#090d16', color: '#ffffff', gap: '16px' }}>
        <span className="spinner" style={{ width: '40px', height: '40px', borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Connecting to Cloud Database...</span>
      </div>
    );
  }

  return (
    <div className="simulator-wrapper">
      {/* Top simulator toolbar */}
      <header className="simulator-header-bar">
        <div className="simulator-header-title">
          <span>Travelbooks PH</span> Viewport Simulator
        </div>
        <div className="simulator-controls">
          <button 
            className={`simulator-btn ${previewDevice === 'desktop' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('desktop')}
          >
            <svg viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            Desktop
          </button>
          <button 
            className={`simulator-btn ${previewDevice === 'macbook' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('macbook')}
          >
            <svg viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="14" rx="2" ry="2" />
              <line x1="1" y1="20" x2="23" y2="20" />
              <line x1="5" y1="20" x2="19" y2="20" />
            </svg>
            MacBook Pro
          </button>
          <button 
            className={`simulator-btn ${previewDevice === 'iphone' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('iphone')}
          >
            <svg viewBox="0 0 24 24">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
              <line x1="12" y1="18" x2="12.01" y2="18" />
            </svg>
            iPhone 15 Pro
          </button>
          <button 
            className={`simulator-btn ${previewDevice === 'android' ? 'active' : ''}`}
            onClick={() => setPreviewDevice('android')}
          >
            <svg viewBox="0 0 24 24">
              <rect x="6" y="2" width="12" height="20" rx="3" />
              <circle cx="12" cy="18" r="1" />
            </svg>
            Android Phone
          </button>
        </div>
      </header>

      <div className="simulator-body-area" ref={bodyAreaRef}>
        <div 
          className={`device-container device-${previewDevice}`}
          style={previewDevice !== 'desktop' ? { transform: `scale(${scale})`, transformOrigin: 'center center' } : {}}
        >
          {previewDevice === 'macbook' && <div className="device-macbook-notch" />}
          {previewDevice === 'iphone' && <div className="device-iphone-notch"><div className="device-iphone-camera" /></div>}
          {previewDevice === 'android' && <div className="device-android-camera" />}

          {previewDevice !== 'desktop' && (
            <div className="simulated-status-bar">
              <span>{currentTime}</span>
              <div className="simulated-status-bar-icons">
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M2 20h20V2z" fill="currentColor" fillOpacity="0.3" />
                  <path d="M2 20h14V8z" fill="currentColor" />
                </svg>
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M12 20h.01" strokeLinecap="round" />
                  <path d="M8.5 16.5a5 5 0 0 1 7 0" strokeLinecap="round" />
                  <path d="M5 13a10 10 0 0 1 14 0" strokeLinecap="round" />
                  <path d="M1.5 9.5a15 15 0 0 1 21 0" strokeLinecap="round" />
                </svg>
                <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <rect x="2" y="7" width="16" height="10" rx="2" ry="2" />
                  <line x1="22" y1="11" x2="22" y2="13" strokeLinecap="round" />
                  <rect x="4" y="9" width="10" height="6" fill="currentColor" />
                </svg>
              </div>
            </div>
          )}

          <div className="app-container">
            {/* Sidebar Navigation */}
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onLogout={handleLogout}
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Main Panel Area */}
            <div className="main-wrapper">
              {/* Header Bar */}
              <Header 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                theme={theme}
                toggleTheme={toggleTheme}
                notificationCount={notifications.length}
                clearNotifications={clearNotifications}
                onAddBookingClick={() => {
                  setBookingToEdit(null);
                  setPrefilledBookingData(null);
                  setIsBookingDrawerOpen(true);
                }}
                onHamburgerClick={() => setIsSidebarOpen(true)}
              />

              {/* Dynamic Tab Pane Render */}
              <main className="content-area">
                {renderTabContent()}
              </main>
            </div>
          </div>

          {previewDevice === 'iphone' && <div className="device-iphone-bar" />}

          {/* Custom Global Floating Toast Notification for Simulated Leads */}
          <div 
            className={`live-toast ${activeToast ? 'show' : ''}`} 
            style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}
            onClick={handleToastClick}
          >
            {activeToast && (
              <>
                <div className="live-toast-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="live-toast-content">
                  <span className="live-toast-title">New Facebook DM Inquiry</span>
                  <span className="live-toast-body">
                    From <strong>{activeToast.name}</strong>. Click here to parse lead details automatically!
                  </span>
                </div>
                <button 
                  className="live-toast-close" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setActiveToast(null); 
                  }}
                >
                  ×
                </button>
              </>
            )}
          </div>

          {/* Slide-out Form Drawers */}
          <BookingDrawer 
            key={bookingToEdit?.id || (prefilledBookingData ? 'prefilled' : 'new')}
            isOpen={isBookingDrawerOpen}
            onClose={() => {
              setIsBookingDrawerOpen(false);
              setBookingToEdit(null);
              setPrefilledBookingData(null);
            }}
            bookingToEdit={bookingToEdit}
            prefilledData={prefilledBookingData}
            onSave={handleSaveBooking}
          />

          <TaskDrawer 
            key={taskToEdit?.id || 'new-task'}
            isOpen={isTaskDrawerOpen}
            onClose={() => {
              setIsTaskDrawerOpen(false);
              setTaskToEdit(null);
            }}
            taskToEdit={taskToEdit}
            bookings={bookings}
            onSave={handleSaveTask}
          />
        </div>
      </div>
    </div>
  );
}
