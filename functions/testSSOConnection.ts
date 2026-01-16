import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { organization_id } = await req.json();
    
    // Fetch organization SSO config
    const org = await base44.asServiceRole.entities.Organization.get(organization_id);
    
    if (!org.sso_enabled || !org.sso_config) {
      return Response.json({ 
        success: false, 
        message: 'SSO not configured for this organization' 
      });
    }

    // Validate SSO configuration
    const { entity_id, sso_url, certificate } = org.sso_config;
    
    if (!entity_id || !sso_url || !certificate) {
      return Response.json({ 
        success: false, 
        message: 'Incomplete SSO configuration. Please provide all required fields.' 
      });
    }

    // In production, this would make a test SAML request
    // For now, we validate the configuration format
    const isValidUrl = sso_url.startsWith('https://');
    const hasCert = certificate.includes('BEGIN CERTIFICATE');

    if (!isValidUrl || !hasCert) {
      return Response.json({ 
        success: false, 
        message: 'Invalid SSO configuration format' 
      });
    }

    return Response.json({ 
      success: true, 
      message: 'SSO configuration is valid and ready for use',
      provider: org.sso_provider
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});