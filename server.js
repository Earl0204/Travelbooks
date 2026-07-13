import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Supabase Client initialization
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase backend client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Supabase backend client:', err);
  }
}

const PORT = process.env.PORT || 3001;

// Twilio Client initialization
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioMessagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;

let twilioClient = null;
if (twilioAccountSid && twilioAuthToken && 
    twilioAccountSid !== 'your_twilio_account_sid_here' && 
    twilioAuthToken !== 'your_twilio_auth_token_here') {
  try {
    twilioClient = twilio(twilioAccountSid, twilioAuthToken);
    console.log('Twilio client initialized successfully.');
  } catch (err) {
    console.error('Failed to initialize Twilio client:', err);
  }
} else {
  console.log('Twilio credentials not fully configured or using placeholders. SMS sending will run in mock mode.');
}

app.post('/api/send-sms', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: 'Recipient phone number and message body are required' });
  }

  const hasMessagingService = twilioMessagingServiceSid && twilioMessagingServiceSid !== 'your_twilio_messaging_service_sid_here' && twilioMessagingServiceSid.trim() !== '';
  const hasPhoneNumber = twilioPhoneNumber && twilioPhoneNumber !== 'your_twilio_phone_number_here' && twilioPhoneNumber.trim() !== '';

  // If Twilio credentials are not configured, simulate successful dispatch for local demo purposes
  if (!twilioClient || (!hasMessagingService && !hasPhoneNumber)) {
    console.log(`[SMS Simulation Mode] Sending to ${to}: "${message}"`);
    // Simulate minor network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return res.json({ 
      success: true, 
      simulated: true,
      messageId: `SM-SIMULATED-${Date.now()}` 
    });
  }

  try {
    const messageOpts = {
      body: message,
      to: to
    };

    if (hasMessagingService) {
      messageOpts.messagingServiceSid = twilioMessagingServiceSid;
    } else {
      messageOpts.from = twilioPhoneNumber;
    }

    const sms = await twilioClient.messages.create(messageOpts);
    console.log(`Real SMS sent via Twilio! SID: ${sms.sid}`);
    res.json({ success: true, messageId: sms.sid });
  } catch (err) {
    console.error('Twilio Send Error:', err);
    res.status(500).json({ error: err.message || 'Failed to send SMS via Twilio API' });
  }
});

// Meta Webhook Verification (GET challenge)
app.get('/api/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'travelbooks_token_123';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Meta Webhook Verified.');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

// Meta Webhook Handler for message feeds (POST event)
app.post('/api/webhook', async (req, res) => {
  const body = req.body;

  if (body.object === 'page') {
    for (const entry of body.entry) {
      const webhook_event = entry.messaging?.[0];
      if (!webhook_event) continue;

      const sender_psid = webhook_event.sender?.id;
      const message = webhook_event.message;

      if (sender_psid && message && message.text) {
        console.log(`Webhook Messenger message received from ${sender_psid}: "${message.text}"`);

        if (supabase) {
          try {
            const clientName = `FB Client (${sender_psid.slice(-4)})`;
            const convId = `conv-${sender_psid}`;

            // Check if conversation already exists in Supabase
            const { data: conv } = await supabase
              .from('conversations')
              .select('id')
              .eq('id', convId)
              .maybeSingle();

            if (!conv) {
              // Create new conversation
              await supabase
                .from('conversations')
                .insert({
                  id: convId,
                  name: clientName,
                  unread: true,
                  status: 'Ready'
                });
            } else {
              // Mark existing conversation as unread
              await supabase
                .from('conversations')
                .update({ unread: true })
                .eq('id', convId);
            }

            // Insert new incoming message
            const timestampLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            await supabase
              .from('messages')
              .insert({
                conversation_id: convId,
                sender: 'client',
                text: message.text,
                timestamp_label: timestampLabel
              });

            console.log(`Saved message from ${sender_psid} to database.`);
          } catch (err) {
            console.error('Failed to sync Meta webhook message to Supabase:', err);
          }
        } else {
          console.warn('Supabase client not initialized. Meta event skipped.');
        }
      }
    }
    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Meta Send Message Endpoint (Agent Outbound replies)
app.post('/api/send-reply', async (req, res) => {
  const { conversationId, text } = req.body;

  if (!conversationId || !text) {
    return res.status(400).json({ error: 'Conversation ID and message text are required' });
  }

  // Get recipient PSID by stripping prefixes
  const psid = conversationId.replace('conv-sim-', '').replace('conv-', '');

  const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
  if (!pageAccessToken || pageAccessToken === 'your_meta_page_access_token_here' || pageAccessToken.trim() === '') {
    console.log(`[Meta Simulation Mode] Outbound reply to PSID ${psid}: "${text}"`);
    // Simulated network delay
    await new Promise(resolve => setTimeout(resolve, 600));
    return res.json({ 
      success: true, 
      simulated: true,
      messageId: `mid.simulated:${Date.now()}` 
    });
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: psid },
        message: { text: text }
      })
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error?.message || 'Meta Send API Error');
    }

    console.log(`Meta Message Sent successfully to PSID: ${psid}. Msg ID: ${result.message_id}`);
    res.json({ success: true, messageId: result.message_id });
  } catch (err) {
    console.error('Failed to send Meta message:', err);
    res.status(500).json({ error: err.message || 'Failed to dispatch Meta message' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
