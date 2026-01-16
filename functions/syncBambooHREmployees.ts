import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { integration_id } = await req.json();
    const startTime = Date.now();
    
    const integration = await base44.asServiceRole.entities.HRIntegration.get(integration_id);
    
    if (integration.hr_system !== 'bamboohr') {
      return Response.json({ error: 'Invalid HR system' }, { status: 400 });
    }

    const apiKey = Deno.env.get('BAMBOOHR_API_KEY');
    const subdomain = Deno.env.get('BAMBOOHR_SUBDOMAIN');

    if (!apiKey || !subdomain) {
      return Response.json({ error: 'BambooHR credentials not configured' }, { status: 400 });
    }

    // Call BambooHR API
    const auth = btoa(`${apiKey}:x`);
    const response = await fetch(
      `https://api.bamboohr.com/api/gateway.php/${subdomain}/v1/employees/directory`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`BambooHR API error: ${response.statusText}`);
    }

    const data = await response.json();
    const employees = data.employees || [];

    let created = 0;
    let updated = 0;
    const errors = [];

    // Process each employee
    for (const employee of employees) {
      try {
        const email = employee.workEmail;
        const department = employee.department;

        if (!email) continue;

        // Check if user exists
        const existingUsers = await base44.asServiceRole.entities.User.list();
        const existingUser = existingUsers.find(u => u.email === email);

        if (!existingUser) {
          await base44.asServiceRole.users.inviteUser(email, 'user');
          created++;
        } else {
          updated++;
        }

        // Auto-create teams from departments
        if (integration.sync_settings?.auto_create_teams && department) {
          const teams = await base44.asServiceRole.entities.Team.filter({
            organization_id: integration.organization_id,
            name: department
          });

          let team = teams[0];
          if (!team) {
            team = await base44.asServiceRole.entities.Team.create({
              organization_id: integration.organization_id,
              name: department,
              description: `Auto-synced from BambooHR`,
              team_lead_emails: [],
              is_active: true
            });
          }

          // Add user to team
          const memberships = await base44.asServiceRole.entities.TeamMembership.filter({
            team_id: team.id,
            user_email: email
          });

          if (memberships.length === 0) {
            await base44.asServiceRole.entities.TeamMembership.create({
              team_id: team.id,
              user_email: email,
              role: 'member',
              joined_date: new Date().toISOString(),
              status: 'active'
            });
          }
        }
      } catch (err) {
        errors.push(`Error processing ${employee.workEmail}: ${err.message}`);
      }
    }

    // Update integration status
    await base44.asServiceRole.entities.HRIntegration.update(integration_id, {
      last_sync_date: new Date().toISOString(),
      sync_status: errors.length === 0 ? 'success' : 'failed'
    });

    // Log sync
    await base44.asServiceRole.entities.HRSyncLog.create({
      integration_id,
      sync_type: 'employees',
      status: errors.length === 0 ? 'success' : 'partial',
      records_processed: employees.length,
      records_created: created,
      records_updated: updated,
      errors,
      sync_duration_ms: Date.now() - startTime
    });

    return Response.json({
      success: true,
      processed: employees.length,
      created,
      updated,
      errors: errors.length,
      duration_ms: Date.now() - startTime
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});