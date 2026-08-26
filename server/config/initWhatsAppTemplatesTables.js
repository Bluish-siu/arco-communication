import { query } from './db.js';

async function initWhatsAppTemplatesTables() {
  try {
    console.log('[PostgreSQL] Initializing WhatsApp Templates tables & seed data...');

    // 1. Create whatsapp_templates table
    await query(`
      CREATE TABLE IF NOT EXISTS whatsapp_templates (
        id VARCHAR(255) PRIMARY KEY,
        workspace_id VARCHAR(255) DEFAULT 'ws_default',
        user_id VARCHAR(255) DEFAULT 'usr_1',
        name VARCHAR(255) NOT NULL,
        display_name VARCHAR(255) NOT NULL,
        category VARCHAR(50) DEFAULT 'MARKETING',
        library_category VARCHAR(50),
        is_library_template BOOLEAN DEFAULT false,
        language VARCHAR(50) DEFAULT 'en_US',
        status VARCHAR(50) DEFAULT 'DRAFT',
        header_type VARCHAR(50) DEFAULT 'NONE',
        header_text TEXT,
        header_media_url TEXT,
        body TEXT NOT NULL,
        footer TEXT,
        buttons JSONB DEFAULT '[]',
        variables JSONB DEFAULT '[]',
        meta_template_id VARCHAR(255),
        meta_status VARCHAR(50),
        rejection_reason TEXT,
        deleted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Seed WhatsApp Template Library (6 Categories matching Interakt UX)
    const libraryTemplates = [
      // --- PROMOTIONAL ---
      {
        id: 'tmpl_lib_prom_01',
        name: 'promotional_offer_01_4l_e3',
        display_name: 'Exciting Offers Just for You!',
        category: 'MARKETING',
        library_category: 'PROMOTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '🎉 Enjoy exclusive offers at NP!\nGet the best experiences with our services.\nDon\'t miss out!\n\nBook now to avail these deals! 🎁',
        footer: 'Reply STOP to opt-out',
        buttons: [
          { type: 'URL', text: 'Book Now', url: 'https://example.com/deals' },
          { type: 'QUICK_REPLY', text: 'View Offers' },
        ],
        variables: [],
      },
      {
        id: 'tmpl_lib_prom_02',
        name: 'flash_discount_fest_v2',
        display_name: 'Exclusive Discount for You!',
        category: 'MARKETING',
        library_category: 'PROMOTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hey {{1}}! 🌟 We have an exclusive {{2}}% discount waiting for you on your next purchase.\n\nUse code: {{3}} at checkout!',
        footer: 'Valid for next 48 hours',
        buttons: [
          { type: 'URL', text: 'Claim Discount', url: 'https://example.com/claim' },
          { type: 'QUICK_REPLY', text: 'Talk to Sales' },
        ],
        variables: ['Customer Name', 'Discount %', 'Coupon Code'],
      },
      {
        id: 'tmpl_lib_prom_03',
        name: 'special_vip_event_invite',
        display_name: 'Join Our Special Event!',
        category: 'MARKETING',
        library_category: 'PROMOTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'TEXT',
        header_text: '🌟 VIP Invitation Inside',
        body: 'Hi {{1}},\nYou are cordially invited to our exclusive {{2}} showcase on {{3}}.\nReserve your spot today!',
        footer: 'Limited seats available',
        buttons: [
          { type: 'URL', text: 'RSVP Online', url: 'https://example.com/rsvp' },
        ],
        variables: ['Full Name', 'Event Name', 'Date & Time'],
      },

      // --- TRANSACTIONAL ---
      {
        id: 'tmpl_lib_trans_01',
        name: 'booking_confirm_auto_v1',
        display_name: 'Booking Confirmation!',
        category: 'UTILITY',
        library_category: 'TRANSACTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hello {{1}},\n\nYour booking #{{2}} has been confirmed successfully!\n\n📅 Date: {{3}}\n📍 Location: {{4}}\n\nWe look forward to serving you.',
        footer: 'Thank you for choosing ARCO',
        buttons: [
          { type: 'URL', text: 'View Booking', url: 'https://example.com/booking/{{2}}' },
          { type: 'PHONE_NUMBER', text: 'Call Support', phone_number: '+919876543210' },
        ],
        variables: ['Customer Name', 'Booking ID', 'Date', 'Location'],
      },
      {
        id: 'tmpl_lib_trans_02',
        name: 'ticket_ready_dispatch_v3',
        display_name: 'Your Ticket is Ready!',
        category: 'UTILITY',
        library_category: 'TRANSACTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hi {{1}},\n\nYour e-ticket for {{2}} is now ready for download.\n\nSeat / Entry No: {{3}}\nShowtime: {{4}}',
        footer: 'Show this QR at entrance',
        buttons: [
          { type: 'URL', text: 'Download Ticket', url: 'https://example.com/tickets' },
        ],
        variables: ['Name', 'Event', 'Seat No', 'Showtime'],
      },

      // --- SERVICE ALERTS ---
      {
        id: 'tmpl_lib_alert_01',
        name: 'service_maintenance_update_v1',
        display_name: 'Important Service Update!',
        category: 'UTILITY',
        library_category: 'SERVICE_ALERTS',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Dear {{1}},\n\nPlease be informed that scheduled system maintenance will take place on {{2}} from {{3}} to {{4}}.\n\nServices may be briefly unavailable.',
        footer: 'ARCO System Status',
        buttons: [
          { type: 'URL', text: 'Check Status', url: 'https://status.arco-crm.com' },
        ],
        variables: ['Customer Name', 'Date', 'Start Time', 'End Time'],
      },
      {
        id: 'tmpl_lib_alert_02',
        name: 'weather_travel_advisory_alert',
        display_name: 'Weather Advisory!',
        category: 'UTILITY',
        library_category: 'SERVICE_ALERTS',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Attention {{1}},\n\nDue to adverse weather conditions in {{2}}, your scheduled service/trip on {{3}} has been updated.\n\nPlease check updated timings.',
        footer: 'Safety First',
        buttons: [
          { type: 'URL', text: 'View Updates', url: 'https://example.com/advisory' },
          { type: 'QUICK_REPLY', text: 'Reschedule' },
        ],
        variables: ['Passenger Name', 'City', 'Date'],
      },

      // --- LEAD QUALIFICATION ---
      {
        id: 'tmpl_lib_lead_01',
        name: 'feedback_nps_survey_v1',
        display_name: 'Your Feedback Matters!',
        category: 'MARKETING',
        library_category: 'LEAD_QUALIFICATION',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hi {{1}},\n\nHow was your recent experience with {{2}}? We would love to hear your feedback to serve you better! ⭐',
        footer: 'Takes less than 1 minute',
        buttons: [
          { type: 'QUICK_REPLY', text: '⭐⭐⭐⭐⭐ Excellent' },
          { type: 'QUICK_REPLY', text: '⭐⭐⭐ Average' },
          { type: 'QUICK_REPLY', text: 'Need Support' },
        ],
        variables: ['Customer Name', 'Service Name'],
      },
      {
        id: 'tmpl_lib_lead_02',
        name: 'reengage_stay_in_touch_v2',
        display_name: "Let's Stay in Touch!",
        category: 'MARKETING',
        library_category: 'LEAD_QUALIFICATION',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hey {{1}}! 👋 We noticed you checked out our {{2}} package.\n\nWould you like a quick 5-min demo or custom quote from our specialist?',
        footer: 'ARCO Sales Team',
        buttons: [
          { type: 'QUICK_REPLY', text: 'Schedule Demo' },
          { type: 'QUICK_REPLY', text: 'Send Pricing PDF' },
        ],
        variables: ['Lead Name', 'Product Interest'],
      },

      // --- INFORMATIVE ---
      {
        id: 'tmpl_lib_info_01',
        name: 'company_monthly_newsletter_v1',
        display_name: 'Latest News from NP!',
        category: 'MARKETING',
        library_category: 'INFORMATIVE',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Greetings {{1}}!\n\nHere is your monthly roundup of key updates, product launches, and tips from our team for {{2}}.\n\nStay ahead with our latest insights!',
        footer: 'NP Monthly Digest',
        buttons: [
          { type: 'URL', text: 'Read Full Issue', url: 'https://example.com/newsletter' },
        ],
        variables: ['Subscriber Name', 'Month'],
      },
      {
        id: 'tmpl_lib_info_02',
        name: 'travel_guide_insider_tips',
        display_name: 'Travel Tips for You!',
        category: 'MARKETING',
        library_category: 'INFORMATIVE',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Heading to {{1}} soon? ✈️\n\nCheck out our curated travel guide featuring top hidden spots, local cuisine, and transit passes for {{2}}.',
        footer: 'Happy Traveling!',
        buttons: [
          { type: 'URL', text: 'Open Guide', url: 'https://example.com/guide' },
        ],
        variables: ['Destination', 'Season'],
      },
      {
        id: 'tmpl_lib_info_03',
        name: 'new_service_announcement_v1',
        display_name: 'New Services at NP!',
        category: 'MARKETING',
        library_category: 'INFORMATIVE',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hi {{1}},\n\nWe are excited to announce our brand new {{2}} service! Designed to help you achieve {{3}} faster and more efficiently.',
        footer: 'Discover what is new',
        buttons: [
          { type: 'URL', text: 'Explore Service', url: 'https://example.com/services' },
        ],
        variables: ['Client Name', 'Service Name', 'Benefit'],
      },

      // --- OCCASION BASED ---
      {
        id: 'tmpl_lib_occ_01',
        name: 'festival_celebration_greetings_v1',
        display_name: 'Celebrate with Us!',
        category: 'MARKETING',
        library_category: 'OCCASION_BASED',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '✨ Wishing you and your loved ones a joyous and prosperous {{1}}!\n\nCelebrate with special festival treats and festive savings across all our outlets.',
        footer: 'Warm wishes from Team ARCO',
        buttons: [
          { type: 'URL', text: 'Festive Deals', url: 'https://example.com/festival' },
        ],
        variables: ['Occasion / Festival'],
      },
      {
        id: 'tmpl_lib_occ_02',
        name: 'anniversary_limited_occasion_v2',
        display_name: "Don't Miss Our Occasion!",
        category: 'MARKETING',
        library_category: 'OCCASION_BASED',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hey {{1}}! 🎉 Today marks our {{2}} Anniversary!\n\nTo thank you for being a part of our journey, enjoy {{3}}% off on everything today only.',
        footer: 'Thank you for your support',
        buttons: [
          { type: 'URL', text: 'Shop Anniversary Sale', url: 'https://example.com/anniversary' },
        ],
        variables: ['Customer Name', 'Years', 'Discount %'],
      },
    ];

    for (const t of libraryTemplates) {
      await query(
        `INSERT INTO whatsapp_templates (
           id, workspace_id, user_id, name, display_name, category, library_category,
           is_library_template, language, status, header_type, header_text, body, footer,
           buttons, variables, meta_status
         ) VALUES ($1, 'ws_default', 'usr_1', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'APPROVED')
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           display_name = EXCLUDED.display_name,
           category = EXCLUDED.category,
           library_category = EXCLUDED.library_category,
           body = EXCLUDED.body,
           footer = EXCLUDED.footer,
           buttons = EXCLUDED.buttons,
           variables = EXCLUDED.variables`,
        [
          t.id,
          t.name,
          t.display_name,
          t.category,
          t.library_category,
          t.is_library_template,
          t.language,
          t.status,
          t.header_type,
          t.header_text || null,
          t.body,
          t.footer || null,
          JSON.stringify(t.buttons),
          JSON.stringify(t.variables),
        ]
      );
    }
    console.log(`[PostgreSQL] Seeded ${libraryTemplates.length} WhatsApp Library templates.`);

    // 3. Seed active user-created templates for Demonstration if none exist
    const userCountRes = await query('SELECT COUNT(*) FROM whatsapp_templates WHERE is_library_template = false');
    if (parseInt(userCountRes.rows[0].count, 10) === 0) {
      const activeUserTemplates = [
        {
          id: 'tmpl_user_001',
          name: 'order_status_update_v1',
          display_name: 'Order Status Update & Tracking',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          header_type: 'TEXT',
          header_text: '📦 Order Status Notification',
          body: 'Hello {{1}},\n\nYour order #{{2}} is now {{3}}.\nTracking URL: {{4}}\n\nThank you for shopping with ARCO!',
          footer: 'ARCO Customer Care',
          buttons: [
            { type: 'URL', text: 'Track Order', url: 'https://arco-crm.com/track/{{2}}' },
          ],
          variables: ['Customer Name', 'Order ID', 'Status', 'Tracking Link'],
        },
        {
          id: 'tmpl_user_002',
          name: 'summer_mega_sale_announcement',
          display_name: 'Summer Mega Sale Announcement',
          category: 'MARKETING',
          language: 'en_US',
          status: 'PENDING',
          header_type: 'NONE',
          body: 'Hey {{1}}! ☀️ Summer Mega Sale is live with up to {{2}}% off.\nShop now before stocks run out!',
          footer: 'Valid until Sunday',
          buttons: [
            { type: 'URL', text: 'Shop Now', url: 'https://arco-crm.com/summer-sale' },
          ],
          variables: ['Customer Name', 'Discount %'],
        },
        {
          id: 'tmpl_user_003',
          name: 'abandoned_cart_recovery_nudge',
          display_name: 'Abandoned Cart Reminder',
          category: 'MARKETING',
          language: 'en_US',
          status: 'APPROVED',
          header_type: 'NONE',
          body: 'Hi {{1}}, you left {{2}} items in your cart! 🛍️ Complete your checkout now and get free delivery.',
          footer: 'ARCO WhatsApp Shop',
          buttons: [
            { type: 'URL', text: 'Complete Checkout', url: 'https://arco-crm.com/cart' },
          ],
          variables: ['Customer Name', 'Items Count'],
        },
      ];

      for (const ut of activeUserTemplates) {
        await query(
          `INSERT INTO whatsapp_templates (
             id, workspace_id, user_id, name, display_name, category,
             is_library_template, language, status, header_type, header_text, body, footer,
             buttons, variables, meta_status
           ) VALUES ($1, 'ws_default', 'usr_1', $2, $3, $4, false, $5, $6, $7, $8, $9, $10, $11, $12, $6)
           ON CONFLICT (id) DO NOTHING`,
          [
            ut.id,
            ut.name,
            ut.display_name,
            ut.category,
            ut.language,
            ut.status,
            ut.header_type,
            ut.header_text || null,
            ut.body,
            ut.footer || null,
            JSON.stringify(ut.buttons),
            JSON.stringify(ut.variables),
          ]
        );
      }
      console.log(`[PostgreSQL] Seeded ${activeUserTemplates.length} active user templates.`);
    }

    console.log('[PostgreSQL] WhatsApp Templates table initialized successfully!');
  } catch (err) {
    console.error('Error initializing WhatsApp templates tables:', err);
  } finally {
    process.exit(0);
  }
}

initWhatsAppTemplatesTables();
