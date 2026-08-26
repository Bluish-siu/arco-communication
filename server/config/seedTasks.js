import { query } from './db.js';

const SAMPLE_TASKS = [
  {
    title: 'Schedule WhatsApp broadcast demo with technical team',
    description: 'Client wants to evaluate multi-agent team inbox and webhook integrations for their sales team.',
    priority: 'High',
    status: 'In Progress',
    assigned_to: 'Rahul',
    daysOffset: 0, // Due Today
  },
  {
    title: 'Send Enterprise SLA & pricing proposal',
    description: 'Custom quote with 50,000 monthly active conversations and dedicated IP for Meta cloud API.',
    priority: 'High',
    status: 'To Do',
    assigned_to: 'Shraddha',
    daysOffset: -2, // Overdue
  },
  {
    title: 'Follow-up on Catalog Checkout configuration',
    description: 'Help merchant configure razorpay payment links inside automated chatbot checkout flow.',
    priority: 'Medium',
    status: 'To Do',
    assigned_to: 'Priya',
    daysOffset: 1, // Due Tomorrow
  },
  {
    title: 'Review CTWA ad click campaign performance',
    description: 'Analyze lead quality and ROAS from recent Instagram click-to-WhatsApp ad set.',
    priority: 'Medium',
    status: 'In Progress',
    assigned_to: 'Amit',
    daysOffset: -4, // Overdue
  },
  {
    title: 'Verify WhatsApp Green Tick verification documents',
    description: 'Verify trademark certificates and Meta business manager legal business name.',
    priority: 'Low',
    status: 'Completed',
    assigned_to: 'Sneha',
    daysOffset: -1,
  },
  {
    title: 'Conduct weekly pipeline review and stage transitions',
    description: 'Review proposal stage deals with sales leadership to close quarterly targets.',
    priority: 'High',
    status: 'To Do',
    assigned_to: 'Vikram',
    daysOffset: 2,
  },
  {
    title: 'Onboard 10 agent accounts for support team',
    description: 'Set up permission roles, canned replies, and auto-assignment routing rules.',
    priority: 'Medium',
    status: 'In Progress',
    assigned_to: 'Shraddha',
    daysOffset: 0, // Due Today
  },
  {
    title: 'Confirm annual subscription renewal payment',
    description: 'Send GST tax invoice and annual contract extension for won enterprise account.',
    priority: 'Low',
    status: 'Completed',
    assigned_to: 'Rahul',
    daysOffset: -5,
  },
];

async function seedTasks() {
  try {
    console.log('[PostgreSQL] Seeding realistic tasks linked to real contacts across pipeline stages...');

    // Fetch contacts from various stages
    const contactsRes = await query(`
      SELECT id, name, status, owner 
      FROM contacts 
      ORDER BY created_at DESC 
      LIMIT 30
    `);

    if (contactsRes.rows.length === 0) {
      console.log('No contacts found to link tasks.');
      return;
    }

    // Clear existing sample tasks
    await query('DELETE FROM tasks');

    const now = new Date();

    for (let i = 0; i < SAMPLE_TASKS.length; i++) {
      const template = SAMPLE_TASKS[i];
      const contact = contactsRes.rows[i % contactsRes.rows.length];
      const taskId = `tsk_${1000 + i}`;

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + template.daysOffset);
      dueDate.setHours(17, 30, 0, 0); // 5:30 PM

      await query(
        `INSERT INTO tasks (id, title, description, contact_id, assigned_to, due_date, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP - INTERVAL '${i + 1} days', CURRENT_TIMESTAMP)
         ON CONFLICT (id) DO UPDATE 
         SET title = $2, description = $3, contact_id = $4, assigned_to = $5, due_date = $6, priority = $7, status = $8, updated_at = CURRENT_TIMESTAMP`,
        [
          taskId,
          template.title,
          template.description,
          contact.id,
          template.assigned_to,
          dueDate.toISOString(),
          template.priority,
          template.status,
        ]
      );
    }

    // Also add more linked tasks across remaining contacts
    for (let j = SAMPLE_TASKS.length; j < 20; j++) {
      const contact = contactsRes.rows[j % contactsRes.rows.length];
      const taskId = `tsk_${1000 + j}`;
      const priorities = ['Low', 'Medium', 'High'];
      const statuses = ['To Do', 'In Progress', 'Completed'];
      const daysOffset = (j % 5) - 2; // mix of overdue (-2, -1), today (0), future (1, 2)

      const dueDate = new Date(now);
      dueDate.setDate(dueDate.getDate() + daysOffset);
      dueDate.setHours(14, 0, 0, 0);

      await query(
        `INSERT INTO tasks (id, title, description, contact_id, assigned_to, due_date, priority, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP - INTERVAL '${j} days', CURRENT_TIMESTAMP)`,
        [
          taskId,
          `Follow up with ${contact.name} regarding ${contact.status} stage`,
          `Discuss next steps, quote terms, and timeline for ${contact.name}.`,
          contact.id,
          contact.owner || 'Shraddha',
          dueDate.toISOString(),
          priorities[j % priorities.length],
          statuses[j % statuses.length],
        ]
      );
    }

    const countRes = await query('SELECT COUNT(*) FROM tasks');
    console.log(`[PostgreSQL] Tasks seeded successfully! Total tasks in database: ${countRes.rows[0].count}`);

    const summaryRes = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'To Do' OR status = 'Todo') as todo,
        COUNT(*) FILTER (WHERE status = 'In Progress' OR status = 'In-Progress') as in_progress,
        COUNT(*) FILTER (WHERE status = 'Completed' OR status = 'Done') as completed,
        COUNT(*) FILTER (WHERE due_date < CURRENT_TIMESTAMP AND status NOT IN ('Completed', 'Done')) as overdue
      FROM tasks
    `);
    console.table(summaryRes.rows);
  } catch (err) {
    console.error('Error seeding tasks:', err);
  } finally {
    process.exit(0);
  }
}

seedTasks();
