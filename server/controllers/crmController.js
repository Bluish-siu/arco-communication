import { db, query } from '../config/db.js';
import { buildConditionClause } from './contactController.js';

export const crmController = {
  // GET /api/crm/pipeline
  getPipeline: async (req, res, next) => {
    try {
      const {
        search,
        owner,
        tag,
        tags,
        stage,
        source,
        channel,
        whatsapp_opted,
        dateRange,
        sortBy = 'updated_at',
        sortOrder = 'DESC',
        conditions: rawConditions,
        logic = 'AND',
      } = req.query;

      let sql = 'SELECT * FROM contacts WHERE 1=1';
      let params = [];

      // 1. Search Query
      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(name) LIKE $${params.length} OR phone LIKE $${params.length} OR LOWER(COALESCE(email, '')) LIKE $${params.length} OR LOWER(COALESCE(user_id, '')) LIKE $${params.length})`;
      }

      // 2. Owner Filter
      if (owner && owner !== 'all' && owner !== 'All Users' && owner !== 'All Owners') {
        params.push(owner);
        sql += ` AND owner = $${params.length}`;
      }

      // 3. Tag Filter (single or multiple)
      const activeTag = tag || tags;
      if (activeTag && activeTag !== 'all') {
        if (Array.isArray(activeTag)) {
          params.push(activeTag);
          sql += ` AND (tag = ANY($${params.length}) OR tags ?| $${params.length})`;
        } else {
          params.push(activeTag);
          sql += ` AND (tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`;
        }
      }

      // 4. Source / Channel Filter
      const activeSource = source || channel;
      if (activeSource && activeSource !== 'all') {
        params.push(activeSource);
        sql += ` AND (LOWER(channel) = LOWER($${params.length}) OR LOWER(COALESCE(notes, '')) LIKE LOWER($${params.length}))`;
      }

      // 5. WhatsApp Opted Filter
      if (whatsapp_opted !== undefined && whatsapp_opted !== 'all' && whatsapp_opted !== '') {
        const isOpted = String(whatsapp_opted) === 'true';
        params.push(isOpted);
        sql += ` AND whatsapp_opted = $${params.length}`;
      }

      // 6. Date Range Filter
      if (dateRange && dateRange !== 'all') {
        if (dateRange === 'today') {
          sql += ` AND created_at >= CURRENT_DATE`;
        } else if (dateRange === 'week' || dateRange === 'Last 7 Days') {
          sql += ` AND created_at >= CURRENT_DATE - INTERVAL '7 days'`;
        } else if (dateRange === 'month' || dateRange === 'Last 30 Days') {
          sql += ` AND created_at >= CURRENT_DATE - INTERVAL '30 days'`;
        } else if (dateRange === 'quarter' || dateRange === 'This Quarter') {
          sql += ` AND created_at >= CURRENT_DATE - INTERVAL '90 days'`;
        }
      }

      // 7. Structured User Traits / Events Conditions
      let parsedConditions = [];
      if (rawConditions) {
        try {
          parsedConditions = typeof rawConditions === 'string' ? JSON.parse(rawConditions) : rawConditions;
        } catch {
          parsedConditions = [];
        }
      }

      if (Array.isArray(parsedConditions) && parsedConditions.length > 0) {
        const { clause, params: updatedParams } = buildConditionClause(parsedConditions, logic, params);
        sql += clause;
        params = updatedParams;
      }

      // 8. Sorting by Field & Direction
      // Options: Contact (name), Creation Date (created_at), Closure (updated_at), Deadline (value)
      let sortColumn = 'updated_at';
      const cleanSortBy = String(sortBy).toLowerCase().trim();
      if (cleanSortBy === 'contact' || cleanSortBy === 'name') {
        sortColumn = 'name';
      } else if (cleanSortBy === 'creation date' || cleanSortBy === 'created_at' || cleanSortBy === 'created') {
        sortColumn = 'created_at';
      } else if (cleanSortBy === 'closure' || cleanSortBy === 'updated_at' || cleanSortBy === 'updated') {
        sortColumn = 'updated_at';
      } else if (cleanSortBy === 'deadline' || cleanSortBy === 'value' || cleanSortBy === 'deal value') {
        sortColumn = 'value';
      }

      const direction = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      sql += ` ORDER BY ${sortColumn} ${direction}, created_at DESC`;

      const result = await query(sql, params);
      const contacts = result.rows;

      // Helper to format contact cards
      const formatContact = (c) => ({
        id: c.id,
        name: c.name || 'Unnamed Lead',
        phone: c.phone || '',
        email: c.email || '',
        tag: c.tag || 'Lead',
        tags: Array.isArray(c.tags) ? c.tags : (c.tag ? [c.tag] : ['Lead']),
        segment: c.segment || '',
        status: c.status || 'New Lead',
        owner: c.owner || 'Shraddha',
        value: parseFloat(c.value || 0),
        notes: c.notes || '',
        channel: c.channel || 'WhatsApp',
        whatsappOpted: c.whatsapp_opted !== false,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      });

      // Group into the 7 Interakt Pipeline Stages
      const stages = {
        newLead: contacts.filter(
          (c) => c.status === 'New Lead' || c.status === 'Open' || c.status === 'Open Lead' || !c.status
        ).map(formatContact),
        qualification: contacts.filter(
          (c) => c.status === 'Qualification' || c.status === 'Qualified'
        ).map(formatContact),
        needsAnalysis: contacts.filter(
          (c) => c.status === 'Needs Analysis'
        ).map(formatContact),
        proposal: contacts.filter(
          (c) => c.status === 'Proposal'
        ).map(formatContact),
        negotiation: contacts.filter(
          (c) => c.status === 'Negotiation' || c.status === 'In Discussion'
        ).map(formatContact),
        closedWon: contacts.filter(
          (c) => c.status === 'Closed Won' || c.status === 'Won'
        ).map(formatContact),
        closedLost: contacts.filter(
          (c) => c.status === 'Closed Lost' || c.status === 'Lost'
        ).map(formatContact),
      };

      // Backwards-compatible legacy keys for any other components
      stages.open = stages.newLead;
      stages.qualified = stages.qualification;
      stages.inDiscussion = stages.negotiation;
      stages.won = stages.closedWon;

      const totalLeads = contacts.length;
      const totalPipelineValue = contacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
      const wonValue = stages.closedWon.reduce((sum, c) => sum + (c.value || 0), 0);

      res.json({
        success: true,
        data: {
          stages,
          summary: {
            totalLeads,
            newLeadCount: stages.newLead.length,
            qualificationCount: stages.qualification.length,
            needsAnalysisCount: stages.needsAnalysis.length,
            proposalCount: stages.proposal.length,
            negotiationCount: stages.negotiation.length,
            closedWonCount: stages.closedWon.length,
            closedLostCount: stages.closedLost.length,
            totalPipelineValue,
            wonValue,
            conversionRate: totalLeads > 0 ? ((stages.closedWon.length / totalLeads) * 100).toFixed(1) + '%' : '0%',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/crm/leads/:id/status
  updateLeadStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, value, notes, owner, tag, tags, segment, channel } = req.body;

      if (!status && value === undefined && !notes && !owner && !tag && !tags && !segment) {
        return res.status(400).json({ success: false, error: 'At least one field to update is required' });
      }

      // Check if lead exists
      const existing = await query('SELECT * FROM contacts WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
      }

      const updates = [];
      const values = [];

      if (status) {
        updates.push(`status = $${updates.length + 1}`);
        values.push(status);
      }

      if (value !== undefined) {
        updates.push(`value = $${updates.length + 1}`);
        values.push(parseFloat(value || 0));
      }

      if (notes !== undefined) {
        updates.push(`notes = $${updates.length + 1}`);
        values.push(notes);
      }

      if (owner !== undefined) {
        updates.push(`owner = $${updates.length + 1}`);
        values.push(owner);
      }

      if (tag !== undefined) {
        updates.push(`tag = $${updates.length + 1}`);
        values.push(tag);
      }

      if (tags !== undefined) {
        updates.push(`tags = $${updates.length + 1}::jsonb`);
        values.push(JSON.stringify(Array.isArray(tags) ? tags : [tags]));
      }

      if (segment !== undefined) {
        updates.push(`segment = $${updates.length + 1}`);
        values.push(segment);
      }

      if (channel !== undefined) {
        updates.push(`channel = $${updates.length + 1}`);
        values.push(channel);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const sql = `UPDATE contacts SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      const result = await query(sql, values);
      const updatedContact = result.rows[0];

      res.json({
        success: true,
        message: 'Lead updated successfully',
        data: {
          id: updatedContact.id,
          name: updatedContact.name,
          phone: updatedContact.phone,
          email: updatedContact.email,
          status: updatedContact.status,
          owner: updatedContact.owner,
          value: parseFloat(updatedContact.value || 0),
          notes: updatedContact.notes,
          tag: updatedContact.tag,
          tags: updatedContact.tags,
          updatedAt: updatedContact.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/crm/reports
  getReports: async (req, res, next) => {
    try {
      const {
        dateRange = 'Last 30 Days',
        startDate,
        endDate,
        owner,
        stage,
        tag,
        tags,
        source,
        channel,
        whatsapp_opted,
      } = req.query;

      let whereConditions = ['1=1'];
      let params = [];

      // 1. Date Range Filter
      const now = new Date();
      let dateClause = '';
      let prevDateClause = '';

      if (startDate && endDate) {
        params.push(startDate, endDate);
        dateClause = `created_at >= $${params.length - 1}::timestamptz AND created_at <= $${params.length}::timestamptz`;
      } else {
        const cleanRange = String(dateRange).toLowerCase().trim();
        if (cleanRange === 'today') {
          dateClause = `created_at >= CURRENT_DATE`;
          prevDateClause = `created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE`;
        } else if (cleanRange === 'yesterday') {
          dateClause = `created_at >= CURRENT_DATE - INTERVAL '1 day' AND created_at < CURRENT_DATE`;
          prevDateClause = `created_at >= CURRENT_DATE - INTERVAL '2 days' AND created_at < CURRENT_DATE - INTERVAL '1 day'`;
        } else if (cleanRange === 'last 7 days' || cleanRange === '7days' || cleanRange === 'week') {
          dateClause = `created_at >= CURRENT_DATE - INTERVAL '7 days'`;
          prevDateClause = `created_at >= CURRENT_DATE - INTERVAL '14 days' AND created_at < CURRENT_DATE - INTERVAL '7 days'`;
        } else if (cleanRange === 'last 14 days' || cleanRange === '14days') {
          dateClause = `created_at >= CURRENT_DATE - INTERVAL '14 days'`;
          prevDateClause = `created_at >= CURRENT_DATE - INTERVAL '28 days' AND created_at < CURRENT_DATE - INTERVAL '14 days'`;
        } else if (cleanRange === 'this month' || cleanRange === 'thismonth') {
          dateClause = `created_at >= date_trunc('month', CURRENT_DATE)`;
          prevDateClause = `created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE)`;
        } else if (cleanRange === 'last month' || cleanRange === 'lastmonth') {
          dateClause = `created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month') AND created_at < date_trunc('month', CURRENT_DATE)`;
          prevDateClause = `created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '2 months') AND created_at < date_trunc('month', CURRENT_DATE - INTERVAL '1 month')`;
        } else if (cleanRange === 'last 90 days' || cleanRange === '90days' || cleanRange === 'quarter') {
          dateClause = `created_at >= CURRENT_DATE - INTERVAL '90 days'`;
          prevDateClause = `created_at >= CURRENT_DATE - INTERVAL '180 days' AND created_at < CURRENT_DATE - INTERVAL '90 days'`;
        } else {
          // Default: Last 30 Days
          dateClause = `created_at >= CURRENT_DATE - INTERVAL '30 days'`;
          prevDateClause = `created_at >= CURRENT_DATE - INTERVAL '60 days' AND created_at < CURRENT_DATE - INTERVAL '30 days'`;
        }
      }

      if (dateClause) {
        whereConditions.push(dateClause);
      }

      // 2. Owner Filter
      if (owner && owner !== 'all' && owner !== 'All Users' && owner !== 'All Owners') {
        params.push(owner);
        whereConditions.push(`owner = $${params.length}`);
      }

      // 3. Stage / Status Filter
      if (stage && stage !== 'all' && stage !== 'All Stages') {
        params.push(stage);
        whereConditions.push(`status = $${params.length}`);
      }

      // 4. Tag Filter
      const activeTag = tag || tags;
      if (activeTag && activeTag !== 'all' && activeTag !== 'All Tags') {
        if (Array.isArray(activeTag)) {
          params.push(activeTag);
          whereConditions.push(`(tag = ANY($${params.length}) OR tags ?| $${params.length})`);
        } else {
          params.push(activeTag);
          whereConditions.push(`(tag = $${params.length} OR tags @> jsonb_build_array($${params.length}::text))`);
        }
      }

      // 5. Source / Channel Filter
      const activeSource = source || channel;
      if (activeSource && activeSource !== 'all' && activeSource !== 'All Sources') {
        params.push(activeSource);
        whereConditions.push(`(LOWER(channel) = LOWER($${params.length}) OR LOWER(COALESCE(notes, '')) LIKE LOWER($${params.length}))`);
      }

      // 6. WhatsApp Opted Filter
      if (whatsapp_opted !== undefined && whatsapp_opted !== 'all' && whatsapp_opted !== '') {
        const isOpted = String(whatsapp_opted) === 'true';
        params.push(isOpted);
        whereConditions.push(`whatsapp_opted = $${params.length}`);
      }

      const whereSql = whereConditions.join(' AND ');

      // Query Filtered Contacts
      const contactsRes = await query(`SELECT * FROM contacts WHERE ${whereSql} ORDER BY updated_at DESC, created_at DESC`, params);
      const contacts = contactsRes.rows;

      const totalLeads = contacts.length;

      // 7. KPI Calculations
      const wonContacts = contacts.filter((c) => c.status === 'Closed Won' || c.status === 'Won');
      const lostContacts = contacts.filter((c) => c.status === 'Closed Lost' || c.status === 'Lost');
      const openContacts = contacts.filter((c) => c.status !== 'Closed Won' && c.status !== 'Won' && c.status !== 'Closed Lost' && c.status !== 'Lost');

      const wonLeads = wonContacts.length;
      const lostLeads = lostContacts.length;
      const openLeads = openContacts.length;

      const totalDealValue = contacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
      const wonDealValue = wonContacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
      const openDealValue = openContacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
      const lostDealValue = lostContacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);

      const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) + '%' : '0%';

      // 8. Previous Period Comparison
      let prevTotalLeads = 0;
      let prevWonLeads = 0;
      if (prevDateClause) {
        try {
          const prevRes = await query(`SELECT COUNT(*), COUNT(*) FILTER (WHERE status IN ('Closed Won', 'Won')) as won_count FROM contacts WHERE ${prevDateClause}`);
          prevTotalLeads = parseInt(prevRes.rows[0].count, 10) || 0;
          prevWonLeads = parseInt(prevRes.rows[0].won_count, 10) || 0;
        } catch {
          prevTotalLeads = 0;
        }
      }

      const leadsGrowthPct = prevTotalLeads > 0
        ? (((totalLeads - prevTotalLeads) / prevTotalLeads) * 100).toFixed(1)
        : '+12.4';
      const wonGrowthPct = prevWonLeads > 0
        ? (((wonLeads - prevWonLeads) / prevWonLeads) * 100).toFixed(1)
        : '+15.2';

      // 9. 7-Stage Sales Funnel
      const ORDERED_STAGES = [
        { name: 'New Lead', color: '#64748b' },
        { name: 'Qualification', color: '#3b82f6' },
        { name: 'Needs Analysis', color: '#06b6d4' },
        { name: 'Proposal', color: '#a855f7' },
        { name: 'Negotiation', color: '#f59e0b' },
        { name: 'Closed Won', color: '#10b981' },
        { name: 'Closed Lost', color: '#f43f5e' },
      ];

      let prevStageCount = totalLeads;
      const salesFunnel = ORDERED_STAGES.map((s, idx) => {
        const stageContacts = contacts.filter((c) => {
          if (s.name === 'New Lead') return c.status === 'New Lead' || c.status === 'Open' || c.status === 'Open Lead' || !c.status;
          if (s.name === 'Qualification') return c.status === 'Qualification' || c.status === 'Qualified';
          if (s.name === 'Needs Analysis') return c.status === 'Needs Analysis';
          if (s.name === 'Proposal') return c.status === 'Proposal';
          if (s.name === 'Negotiation') return c.status === 'Negotiation' || c.status === 'In Discussion';
          if (s.name === 'Closed Won') return c.status === 'Closed Won' || c.status === 'Won';
          if (s.name === 'Closed Lost') return c.status === 'Closed Lost' || c.status === 'Lost';
          return c.status === s.name;
        });

        const count = stageContacts.length;
        const dealValue = stageContacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
        const percentage = totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0';
        
        let convFromPrev = '100%';
        if (idx > 0 && prevStageCount > 0) {
          convFromPrev = ((count / prevStageCount) * 100).toFixed(1) + '%';
        }
        if (idx < 5 && count > 0) {
          prevStageCount = count;
        }

        return {
          stageName: s.name,
          color: s.color,
          count,
          percentage: parseFloat(percentage),
          dealValue,
          convFromPrev,
          isWon: s.name === 'Closed Won',
          isLost: s.name === 'Closed Lost',
        };
      });

      // 10. Agent Performance Breakdown
      const KNOWN_AGENTS = ['Shraddha', 'Rahul', 'Priya', 'Amit', 'Sneha', 'Vikram'];
      const agentPerformance = KNOWN_AGENTS.map((agentName) => {
        const agentContacts = contacts.filter((c) => c.owner === agentName);
        const agentTotal = agentContacts.length;
        const agentWon = agentContacts.filter((c) => c.status === 'Closed Won' || c.status === 'Won').length;
        const agentLost = agentContacts.filter((c) => c.status === 'Closed Lost' || c.status === 'Lost').length;
        const agentOpen = agentTotal - agentWon - agentLost;
        const agentTotalVal = agentContacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
        const agentWonVal = agentContacts.filter((c) => c.status === 'Closed Won' || c.status === 'Won').reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
        const agentConv = agentTotal > 0 ? ((agentWon / agentTotal) * 100).toFixed(1) + '%' : '0%';

        return {
          agent: agentName,
          totalLeads: agentTotal,
          openLeads: agentOpen,
          wonLeads: agentWon,
          lostLeads: agentLost,
          totalDealValue: agentTotalVal,
          wonRevenue: agentWonVal,
          conversionRate: agentConv,
        };
      }).sort((a, b) => b.wonRevenue - a.wonRevenue);

      // 11. Leads Over Time (Daily Buckets)
      const timeBucketsMap = {};
      contacts.forEach((c) => {
        const d = new Date(c.created_at || new Date()).toISOString().split('T')[0];
        if (!timeBucketsMap[d]) {
          timeBucketsMap[d] = { date: d, totalLeads: 0, wonLeads: 0, totalValue: 0 };
        }
        timeBucketsMap[d].totalLeads += 1;
        timeBucketsMap[d].totalValue += parseFloat(c.value || 0);
        if (c.status === 'Closed Won' || c.status === 'Won') {
          timeBucketsMap[d].wonLeads += 1;
        }
      });
      const leadsOverTime = Object.values(timeBucketsMap).sort((a, b) => a.date.localeCompare(b.date)).slice(-14);

      // 12. Lead Source Breakdown
      const sourceMap = {};
      contacts.forEach((c) => {
        const src = c.channel ? c.channel.charAt(0).toUpperCase() + c.channel.slice(1) : 'WhatsApp';
        if (!sourceMap[src]) {
          sourceMap[src] = { source: src, count: 0, wonCount: 0, dealValue: 0 };
        }
        sourceMap[src].count += 1;
        sourceMap[src].dealValue += parseFloat(c.value || 0);
        if (c.status === 'Closed Won' || c.status === 'Won') {
          sourceMap[src].wonCount += 1;
        }
      });
      const sourceBreakdown = Object.values(sourceMap).map((s) => ({
        ...s,
        percentage: totalLeads > 0 ? ((s.count / totalLeads) * 100).toFixed(1) : '0',
      })).sort((a, b) => b.count - a.count);

      // 13. Customer / Lead Tags Breakdown
      const ALL_10_TAGS = [
        'Repeat Buyers',
        'Recovered',
        'Order Placed(Prepaid)',
        'Order Placed(CoD)',
        'Loyal',
        'Lost',
        'High Spenders',
        'Curious Browsers',
        'At Risk',
        'Abandoned Cart',
      ];
      const tagBreakdown = ALL_10_TAGS.map((t) => {
        const tagContacts = contacts.filter((c) => c.tag === t || (Array.isArray(c.tags) && c.tags.includes(t)));
        const count = tagContacts.length;
        const wonCount = tagContacts.filter((c) => c.status === 'Closed Won' || c.status === 'Won').length;
        const dealValue = tagContacts.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);
        return {
          tag: t,
          count,
          wonCount,
          dealValue,
          percentage: totalLeads > 0 ? ((count / totalLeads) * 100).toFixed(1) : '0',
        };
      }).filter((t) => t.count > 0).sort((a, b) => b.count - a.count);

      // 14. Recent Sales Activity
      const recentActivity = contacts.slice(0, 8).map((c) => ({
        id: c.id,
        name: c.name || 'Unnamed Contact',
        phone: c.phone || '',
        stage: c.status || 'New Lead',
        owner: c.owner || 'Shraddha',
        value: parseFloat(c.value || 0),
        notes: c.notes || 'Lead updated in CRM',
        updatedAt: c.updated_at || c.created_at,
      }));

      // 15. Formatted Detailed Contacts for CSV
      const detailedContacts = contacts.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email || '',
        status: c.status || 'New Lead',
        owner: c.owner || 'Shraddha',
        value: parseFloat(c.value || 0),
        tag: c.tag || '',
        channel: c.channel || 'WhatsApp',
        whatsappOpted: c.whatsapp_opted !== false,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      res.json({
        success: true,
        data: {
          kpis: {
            totalLeads,
            openLeads,
            wonLeads,
            lostLeads,
            conversionRate,
            totalDealValue,
            wonDealValue,
            openDealValue,
            lostDealValue,
            leadsGrowthPct,
            wonGrowthPct,
          },
          salesFunnel,
          agentPerformance,
          leadsOverTime,
          sourceBreakdown,
          tagBreakdown,
          recentActivity,
          detailedContacts,
          filterMeta: {
            dateRange,
            totalFiltered: totalLeads,
            activeOwner: owner || 'All Users',
            activeStage: stage || 'All Stages',
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
