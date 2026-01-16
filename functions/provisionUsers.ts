import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { organization_id, emails, auto_assign_teams } = await req.json();
    
    let success_count = 0;
    const results = [];

    for (const email of emails) {
      try {
        // Invite user to the platform
        await base44.asServiceRole.users.inviteUser(email, 'user');
        
        // Auto-assign to teams if specified
        if (auto_assign_teams?.length > 0) {
          for (const team_id of auto_assign_teams) {
            await base44.asServiceRole.entities.TeamMembership.create({
              team_id,
              user_email: email,
              role: 'member',
              joined_date: new Date().toISOString(),
              status: 'active'
            });
          }
        }

        success_count++;
        results.push({ email, status: 'success' });
      } catch (error) {
        results.push({ email, status: 'error', message: error.message });
      }
    }

    return Response.json({ 
      success_count,
      total: emails.length,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});