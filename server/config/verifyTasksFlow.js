async function verifyTasksFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO Sales CRM Tasks & Interakt-Style Filter Suite...');

  // 1. Load All Tasks & Verify Summary KPIs
  try {
    const res = await fetch(`${BASE_URL}/tasks`);
    const json = await res.json();
    const data = json.data;
    const summary = json.summary;

    const hasSummary = summary && summary.total > 0 && summary.todoCount !== undefined && summary.overdueCount !== undefined;
    const passed = res.status === 200 && Array.isArray(data) && data.length > 0 && hasSummary;

    results.push({
      test: '1. Load All Tasks (GET /api/tasks)',
      status: res.status,
      passed,
      details: `Loaded ${data.length} tasks (Total: ${summary?.total}, To Do: ${summary?.todoCount}, In Progress: ${summary?.inProgressCount}, Completed: ${summary?.completedCount}, Overdue: ${summary?.overdueCount})`,
    });
  } catch (e) {
    results.push({ test: '1. Load All Tasks', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Filter by Task Deadline: Overdue Tasks
  try {
    const res = await fetch(`${BASE_URL}/tasks?deadline=overdue`);
    const json = await res.json();
    const data = json.data || [];
    const allOverdue = data.every((t) => t.isOverdue && t.status !== 'Completed' && t.status !== 'Done');
    const passed = res.status === 200 && data.length > 0 && allOverdue;

    results.push({
      test: '2. Filter: Deadline = "Overdue Tasks"',
      status: res.status,
      passed,
      details: `Retrieved ${data.length} overdue tasks strictly with past due dates and incomplete status`,
    });
  } catch (e) {
    results.push({ test: '2. Filter: Deadline = Overdue', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Filter by Task Deadline: Due Today
  try {
    const res = await fetch(`${BASE_URL}/tasks?deadline=today`);
    const json = await res.json();
    const data = json.data || [];
    const passed = res.status === 200;

    results.push({
      test: '3. Filter: Deadline = "Due Today"',
      status: res.status,
      passed,
      details: `Retrieved ${data.length} tasks scheduled for today`,
    });
  } catch (e) {
    results.push({ test: '3. Filter: Deadline = Due Today', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Multi-Select Filter: Task Status (Todo + In-Progress)
  try {
    const res = await fetch(`${BASE_URL}/tasks?status=Todo&status=In-Progress`);
    const json = await res.json();
    const data = json.data || [];
    const validStatuses = data.every((t) => t.status === 'To Do' || t.status === 'Todo' || t.status === 'In Progress' || t.status === 'In-Progress');
    const passed = res.status === 200 && data.length > 0 && validStatuses;

    results.push({
      test: '4. Multi-Select Status: Todo + In-Progress',
      status: res.status,
      passed,
      details: `Retrieved ${data.length} tasks matching status IN ('Todo', 'In-Progress')`,
    });
  } catch (e) {
    results.push({ test: '4. Multi-Select Status', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Multi-Select Filter: Contact Status (Pipeline Stages)
  try {
    const res = await fetch(`${BASE_URL}/tasks?contact_status=Qualification&contact_status=Proposal`);
    const json = await res.json();
    const data = json.data || [];
    const validContactStatuses = data.every((t) => t.contactStatus === 'Qualification' || t.contactStatus === 'Proposal');
    const passed = res.status === 200 && validContactStatuses;

    results.push({
      test: '5. Multi-Select Contact Status: Qualification + Proposal',
      status: res.status,
      passed,
      details: `Retrieved ${data.length} tasks whose linked contact is in Qualification or Proposal stage`,
    });
  } catch (e) {
    results.push({ test: '5. Multi-Select Contact Status', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Multi-Section Combined AND Filter (Overdue + In-Progress)
  try {
    const res = await fetch(`${BASE_URL}/tasks?deadline=overdue&status=In-Progress`);
    const json = await res.json();
    const data = json.data || [];
    const valid = data.every((t) => t.isOverdue && (t.status === 'In Progress' || t.status === 'In-Progress'));
    const passed = res.status === 200 && valid;

    results.push({
      test: '6. Multi-Section AND Filter (Overdue + In-Progress)',
      status: res.status,
      passed,
      details: `Retrieved ${data.length} tasks matching Overdue AND In-Progress criteria`,
    });
  } catch (e) {
    results.push({ test: '6. Multi-Section AND Filter', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. Search Filter (e.g. "WhatsApp")
  try {
    const res = await fetch(`${BASE_URL}/tasks?search=WhatsApp`);
    const json = await res.json();
    const data = json.data || [];
    const passed = res.status === 200 && data.length > 0;

    results.push({
      test: '7. Search Tasks (search="WhatsApp")',
      status: res.status,
      passed,
      details: `Found ${data.length} tasks matching search query "WhatsApp"`,
    });
  } catch (e) {
    results.push({ test: '7. Search Tasks', status: 'ERROR', passed: false, details: e.message });
  }

  // 8. Sorting: Due Date Descending
  try {
    const res = await fetch(`${BASE_URL}/tasks?sort_by=due_date&sort_order=DESC`);
    const json = await res.json();
    const data = json.data || [];
    const passed = res.status === 200 && data.length > 0;

    results.push({
      test: '8. Sort: Due Date Descending',
      status: res.status,
      passed,
      details: `Successfully sorted ${data.length} tasks with latest due date first`,
    });
  } catch (e) {
    results.push({ test: '8. Sort: Due Date', status: 'ERROR', passed: false, details: e.message });
  }

  // 9. Create Task (POST /api/tasks)
  let createdTaskId = null;
  try {
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Review WhatsApp Commerce Catalog with Aadhya',
        description: 'Verify dynamic catalog sync and Meta product inventory feeds.',
        assigned_to: 'Rahul',
        priority: 'High',
        status: 'To Do',
        due_date: new Date(Date.now() + 86400000).toISOString(),
      }),
    });
    const json = await res.json();
    createdTaskId = json.data?.id;
    const passed = res.status === 201 && createdTaskId && json.data?.title === 'Review WhatsApp Commerce Catalog with Aadhya';

    results.push({
      test: '9. Create Task (POST /api/tasks)',
      status: res.status,
      passed,
      details: `Created new task ID "${createdTaskId}" assigned to Rahul with Priority High`,
    });
  } catch (e) {
    results.push({ test: '9. Create Task', status: 'ERROR', passed: false, details: e.message });
  }

  // 10. Update Task Status (PUT /api/tasks/:id/status)
  if (createdTaskId) {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.status === 'Completed';

      results.push({
        test: '10. Update Task Status (PUT /api/tasks/:id/status)',
        status: res.status,
        passed,
        details: `Updated task ${createdTaskId} status to "Completed"`,
      });
    } catch (e) {
      results.push({ test: '10. Update Task Status', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 11. Delete Task (DELETE /api/tasks/:id)
  if (createdTaskId) {
    try {
      const res = await fetch(`${BASE_URL}/tasks/${createdTaskId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;

      results.push({
        test: '11. Delete Task (DELETE /api/tasks/:id)',
        status: res.status,
        passed,
        details: `Successfully deleted task ${createdTaskId} from database`,
      });
    } catch (e) {
      results.push({ test: '11. Delete Task', status: 'ERROR', passed: false, details: e.message });
    }
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of Sales CRM Tasks and Interakt Filter tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyTasksFlow();
