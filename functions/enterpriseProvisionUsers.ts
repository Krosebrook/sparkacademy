import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify API key from header
        const apiKey = req.headers.get('X-API-Key');
        if (!apiKey || apiKey !== Deno.env.get('ENTERPRISE_API_KEY')) {
            return Response.json({ error: 'Invalid API key' }, { status: 401 });
        }

        const { users, organization_id } = await req.json();
        
        if (!Array.isArray(users) || users.length === 0) {
            return Response.json({ error: 'Users array is required' }, { status: 400 });
        }

        // Provision users (invite them to the platform)
        const results = [];
        
        for (const userData of users) {
            try {
                const { email, full_name, role = 'user' } = userData;
                
                if (!email || !full_name) {
                    results.push({
                        email,
                        status: 'failed',
                        error: 'Email and full_name are required'
                    });
                    continue;
                }
                
                // Invite user via Base44
                await base44.asServiceRole.users.inviteUser(email, role);
                
                // Create user metadata for organization tracking
                const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
                if (existingUsers.length > 0) {
                    await base44.asServiceRole.entities.User.update(existingUsers[0].id, {
                        organization_id,
                        provisioned_via: 'enterprise_api',
                        provisioned_at: new Date().toISOString()
                    });
                }
                
                results.push({
                    email,
                    status: 'success',
                    message: 'User invited successfully'
                });
                
            } catch (error) {
                results.push({
                    email: userData.email,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            total: users.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length,
            results
        });
        
    } catch (error) {
        console.error('Error provisioning users:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});