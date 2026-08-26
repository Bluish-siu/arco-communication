import { query } from './db.js';

async function seedRealisticTemplates() {
  try {
    console.log('[PostgreSQL] Seeding full realistic Interakt-replica WhatsApp templates...');

    // 1. Add created_by column if not exists
    await query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_templates' AND column_name = 'created_by') THEN
          ALTER TABLE whatsapp_templates ADD COLUMN created_by VARCHAR(255) DEFAULT 'Shraddha Sharma';
        END IF;
      END $$;
    `);

    // 2. Exact Interakt-Replica Library Templates
    const libraryTemplates = [
      // --- PROMOTIONAL ---
      {
        id: 'tmpl_lib_prom_01',
        name: 'promotional_offer_01_4le3',
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
          { type: 'URL', text: 'Book Now', url: 'https://np-services.com/deals' },
          { type: 'QUICK_REPLY', text: 'View Offers' },
        ],
        variables: [],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_prom_02',
        name: 'promotional_discount_07_4x',
        display_name: 'Exclusive Discount for You!',
        category: 'MARKETING',
        library_category: 'PROMOTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '🎉 We appreciate your loyalty!\n\nEnjoy a special discount of {{1}}% off on your next flight with NP. Don\'t miss out on this opportunity!\n\nBook now and fly with us!',
        footer: 'Valid for 48 hours only',
        buttons: [
          { type: 'URL', text: 'Book Now', url: 'https://np-services.com/book' },
        ],
        variables: ['discount_percentage'],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_prom_03',
        name: 'promotional_event_09_2a',
        display_name: 'Join Our Special Event!',
        category: 'MARKETING',
        library_category: 'PROMOTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'TEXT',
        header_text: '🌟 Special Invitation Inside',
        body: 'Hi {{1}},\n\nYou are invited to our grand launch event on {{2}} at {{3}}.\nReserve your exclusive pass today!',
        footer: 'Limited passes available',
        buttons: [
          { type: 'URL', text: 'Reserve Pass', url: 'https://np-services.com/event' },
        ],
        variables: ['customer_name', 'event_date', 'event_venue'],
        created_by: 'ARCO System',
      },

      // --- TRANSACTIONAL ---
      {
        id: 'tmpl_lib_trans_01',
        name: 'transactional_confirmation_02_16',
        display_name: 'Booking Confirmation!',
        category: 'UTILITY',
        library_category: 'TRANSACTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Your booking with NP Airlines has been confirmed!\n\nFlight Details:\n- Flight Number: {{1}}\n- Departure: {{2}}\n- Arrival: {{3}}',
        footer: 'Have a pleasant flight with NP',
        buttons: [
          { type: 'URL', text: 'View Flight Status', url: 'https://np-services.com/flight/{{1}}' },
          { type: 'PHONE_NUMBER', text: 'Helpline', phone_number: '+919876543210' },
        ],
        variables: ['flight_number', 'departure_time', 'arrival_time'],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_trans_02',
        name: 'transactional_ticket_05_19',
        display_name: 'Your Ticket is Ready!',
        category: 'UTILITY',
        library_category: 'TRANSACTIONAL',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hi {{1}},\n\nYour e-ticket for {{2}} is ready for download.\n\nSeat / Entry No: {{3}}\nDeparture: {{4}}',
        footer: 'Show barcode at boarding gate',
        buttons: [
          { type: 'URL', text: 'Download Ticket', url: 'https://np-services.com/tickets' },
        ],
        variables: ['passenger_name', 'destination', 'seat_number', 'departure_time'],
        created_by: 'ARCO System',
      },

      // --- SERVICE ALERTS ---
      {
        id: 'tmpl_lib_alert_01',
        name: 'service_alert_01_99',
        display_name: 'Important Service Update!',
        category: 'UTILITY',
        library_category: 'SERVICE_ALERTS',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '⚠️ Attention, passengers!\n\nWe are experiencing some service interruptions due to unforeseen circumstances.\n\nPlease check your flight status regularly for updates.',
        footer: 'NP Customer Operations',
        buttons: [
          { type: 'URL', text: 'Check Status', url: 'https://np-services.com/status' },
        ],
        variables: [],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_alert_02',
        name: 'service_weather_04_31',
        display_name: 'Weather Advisory!',
        category: 'UTILITY',
        library_category: 'SERVICE_ALERTS',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Attention {{1}},\n\nDue to adverse weather conditions in {{2}}, your scheduled flight {{3}} on {{4}} has been rescheduled.\n\nPlease check updated timings.',
        footer: 'Safety is our top priority',
        buttons: [
          { type: 'URL', text: 'View Timings', url: 'https://np-services.com/updates' },
          { type: 'QUICK_REPLY', text: 'Reschedule Flight' },
        ],
        variables: ['passenger_name', 'city_name', 'flight_number', 'flight_date'],
        created_by: 'ARCO System',
      },

      // --- LEAD QUALIFICATION ---
      {
        id: 'tmpl_lib_lead_01',
        name: 'lead_feedback_03_88',
        display_name: 'Your Feedback Matters!',
        category: 'MARKETING',
        library_category: 'LEAD_QUALIFICATION',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '✨ Dear customer, we want to hear from you!\n\nAre you interested in more information about our flight services?\nPlease let us know your preferences!',
        footer: 'Takes 30 seconds',
        buttons: [
          { type: 'QUICK_REPLY', text: 'Send Contact' },
          { type: 'QUICK_REPLY', text: 'No, Thanks' },
        ],
        variables: [],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_lead_02',
        name: 'lead_reengage_02_44',
        display_name: "Let's Stay in Touch!",
        category: 'MARKETING',
        library_category: 'LEAD_QUALIFICATION',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hey {{1}}! 👋 We noticed you checked out our {{2}} destination packages.\n\nWould you like our travel specialist to share custom itineraries and best flight deals with you?',
        footer: 'NP Travel Desk',
        buttons: [
          { type: 'QUICK_REPLY', text: 'Yes, Send Details' },
          { type: 'QUICK_REPLY', text: 'Not Right Now' },
        ],
        variables: ['lead_name', 'destination_name'],
        created_by: 'ARCO System',
      },

      // --- INFORMATIVE ---
      {
        id: 'tmpl_lib_info_01',
        name: 'informative_news_01_12',
        display_name: 'Latest News from NP!',
        category: 'MARKETING',
        library_category: 'INFORMATIVE',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '📢 We\'re committed to providing you the best service!\n\nCheck out the latest news and promotions with NP. Stay updated!',
        footer: 'NP Monthly Newsletter',
        buttons: [
          { type: 'URL', text: 'Read News', url: 'https://np-services.com/news' },
        ],
        variables: [],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_info_02',
        name: 'informative_travel_06_77',
        display_name: 'Travel Tips for You!',
        category: 'MARKETING',
        library_category: 'INFORMATIVE',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Planning a trip to {{1}} soon? ✈️\n\nCheck out our curated travel guide featuring top hidden spots, local cuisine, and transit tips for {{2}}.',
        footer: 'NP Travel Advisory',
        buttons: [
          { type: 'URL', text: 'Open Guide', url: 'https://np-services.com/guide' },
        ],
        variables: ['destination_city', 'season_name'],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_info_03',
        name: 'informative_services_08_55',
        display_name: 'New Services at NP!',
        category: 'MARKETING',
        library_category: 'INFORMATIVE',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hi {{1}},\n\nWe are excited to introduce our new premium lounge & express boarding services at all major airports!\n\nUpgrade your booking today.',
        footer: 'NP Priority Club',
        buttons: [
          { type: 'URL', text: 'Upgrade Now', url: 'https://np-services.com/priority' },
        ],
        variables: ['customer_name'],
        created_by: 'ARCO System',
      },

      // --- OCCASION BASED ---
      {
        id: 'tmpl_lib_occ_01',
        name: 'occasion_celebrate_01_09',
        display_name: 'Celebrate with Us!',
        category: 'MARKETING',
        library_category: 'OCCASION_BASED',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '🎈 It\'s a special occasion! Join us in celebrating the launch of our new routes!\n\nBook your flight and get special discounts! ✈️',
        footer: 'Terms and conditions apply',
        buttons: [
          { type: 'URL', text: 'Reserve Now', url: 'https://np-services.com/reserve' },
          { type: 'QUICK_REPLY', text: 'STOP' },
        ],
        variables: [],
        created_by: 'ARCO System',
      },
      {
        id: 'tmpl_lib_occ_02',
        name: 'occasion_anniversary_03_21',
        display_name: "Don't Miss Our Occasion!",
        category: 'MARKETING',
        library_category: 'OCCASION_BASED',
        is_library_template: true,
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hey {{1}}! 🎉 Today is our Annual Gala Celebration!\n\nTo thank you for being a loyal customer, enjoy flat {{2}}% off on all bookings made in the next 24 hours.',
        footer: 'NP Anniversary Sale',
        buttons: [
          { type: 'URL', text: 'Claim Offer', url: 'https://np-services.com/anniversary' },
        ],
        variables: ['customer_name', 'discount_percent'],
        created_by: 'ARCO System',
      },
    ];

    for (const t of libraryTemplates) {
      await query(
        `INSERT INTO whatsapp_templates (
           id, workspace_id, user_id, name, display_name, category, library_category,
           is_library_template, language, status, header_type, header_text, body, footer,
           buttons, variables, meta_status, created_by
         ) VALUES ($1, 'ws_default', 'usr_1', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'APPROVED', $15)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           display_name = EXCLUDED.display_name,
           category = EXCLUDED.category,
           library_category = EXCLUDED.library_category,
           body = EXCLUDED.body,
           footer = EXCLUDED.footer,
           buttons = EXCLUDED.buttons,
           variables = EXCLUDED.variables,
           created_by = EXCLUDED.created_by`,
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
          t.created_by,
        ]
      );
    }

    // 3. Seed realistic Active user templates with various statuses
    const realisticActive = [
      {
        id: 'tmpl_user_001',
        name: 'flight_booking_confirmation_v1',
        display_name: 'Flight Booking Confirmation',
        category: 'UTILITY',
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'TEXT',
        header_text: '✈️ Booking Confirmed',
        body: 'Hello {{1}},\n\nYour flight booking #{{2}} from {{3}} to {{4}} is confirmed.\nDeparture: {{5}}.\n\nThank you for flying with ARCO Airlines!',
        footer: 'ARCO Customer Care',
        buttons: [{ type: 'URL', text: 'View Itinerary', url: 'https://arco-crm.com/itinerary/{{2}}' }],
        variables: ['passenger_name', 'pnr_number', 'origin', 'destination', 'departure_time'],
        created_by: 'Shraddha Sharma',
      },
      {
        id: 'tmpl_user_002',
        name: 'monsoon_mega_sale_announcement',
        display_name: 'Monsoon Mega Sale Announcement',
        category: 'MARKETING',
        language: 'en_US',
        status: 'PENDING',
        header_type: 'NONE',
        body: 'Hey {{1}}! 🌧️ Monsoon Mega Sale is live with up to {{2}}% off on domestic routes.\nBook before Sunday to lock in your lowest fares!',
        footer: 'Valid until Sunday midnight',
        buttons: [{ type: 'URL', text: 'Book Flights', url: 'https://arco-crm.com/monsoon-sale' }],
        variables: ['customer_name', 'discount_percent'],
        created_by: 'Shraddha Sharma',
      },
      {
        id: 'tmpl_user_003',
        name: 'abandoned_cart_recovery_nudge',
        display_name: 'Abandoned Cart Reminder',
        category: 'MARKETING',
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: 'Hi {{1}}, you left {{2}} tickets in your cart! 🎫 Complete your booking now before seat prices increase.',
        footer: 'ARCO WhatsApp Desk',
        buttons: [{ type: 'URL', text: 'Complete Booking', url: 'https://arco-crm.com/cart' }],
        variables: ['customer_name', 'items_count'],
        created_by: 'Nilesh Patel',
      },
      {
        id: 'tmpl_user_004',
        name: 'auth_otp_verification_code',
        display_name: 'Login OTP Verification',
        category: 'AUTHENTICATION',
        language: 'en_US',
        status: 'APPROVED',
        header_type: 'NONE',
        body: '{{1}} is your ARCO verification code. For your security, do not share this code with anyone.',
        footer: 'Expires in 10 minutes',
        buttons: [{ type: 'QUICK_REPLY', text: 'Copy Code' }],
        variables: ['otp_code'],
        created_by: 'System Administrator',
      },
      {
        id: 'tmpl_user_005',
        name: 'festive_discount_vip_pass',
        display_name: 'Festive VIP Pass Discount',
        category: 'MARKETING',
        language: 'en_US',
        status: 'REJECTED',
        header_type: 'TEXT',
        header_text: '🎉 VIP Offer',
        body: 'Dear {{1}}, win guaranteed cash prize of 100000 rupees today by clicking this link!',
        footer: 'Promo',
        buttons: [{ type: 'URL', text: 'Claim Prize', url: 'https://example.com/prize' }],
        variables: ['name'],
        created_by: 'Marketing Intern',
      },
      {
        id: 'tmpl_user_006',
        name: 'customer_checkin_reminder_v2',
        display_name: 'Web Check-in Reminder',
        category: 'UTILITY',
        language: 'en_US',
        status: 'WAITING',
        header_type: 'NONE',
        body: 'Hi {{1}}, web check-in for your flight {{2}} is now open! Check-in now to select your preferred seat.',
        footer: 'Boarding closes 45 mins before departure',
        buttons: [{ type: 'URL', text: 'Check-in Online', url: 'https://arco-crm.com/checkin' }],
        variables: ['passenger_name', 'flight_code'],
        created_by: 'Shraddha Sharma',
      },
    ];

    for (const ut of realisticActive) {
      await query(
        `INSERT INTO whatsapp_templates (
           id, workspace_id, user_id, name, display_name, category,
           is_library_template, language, status, header_type, header_text, body, footer,
           buttons, variables, meta_status, created_by
         ) VALUES ($1, 'ws_default', 'usr_1', $2, $3, $4, false, $5, $6, $7, $8, $9, $10, $11, $12, $6, $13)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           display_name = EXCLUDED.display_name,
           category = EXCLUDED.category,
           status = EXCLUDED.status,
           body = EXCLUDED.body,
           footer = EXCLUDED.footer,
           buttons = EXCLUDED.buttons,
           variables = EXCLUDED.variables,
           created_by = EXCLUDED.created_by`,
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
          ut.created_by,
        ]
      );
    }

    console.log('[PostgreSQL] Seeded 14 Library Templates + 6 Active Templates successfully!');
  } catch (err) {
    console.error('Error seeding realistic templates:', err);
  } finally {
    process.exit(0);
  }
}

seedRealisticTemplates();
