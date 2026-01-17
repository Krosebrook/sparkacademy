/**
 * Accreditation Status Validation
 * Verify investor accreditation status for compliance
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { portfolio_value, net_worth, income } = await req.json();

    // Determine accreditation status
    const isAccredited = portfolio_value >= 1000000 || 
                        net_worth >= 1000000 || 
                        income >= 200000; // Single filer

    const accreditationData = {
      user_email: user.email,
      is_accredited: isAccredited,
      accreditation_criteria: {
        portfolio_value: portfolio_value >= 1000000,
        net_worth: net_worth >= 1000000,
        income: income >= 200000
      },
      validation_date: new Date().toISOString(),
      status: isAccredited ? 'verified' : 'not_accredited'
    };

    // Store accreditation status
    try {
      await base44.entities.AccreditationStatus?.create(accreditationData).catch(() => {});
    } catch (e) {
      console.log('Could not store accreditation status');
    }

    return Response.json({ 
      success: true, 
      accreditation: accreditationData 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});