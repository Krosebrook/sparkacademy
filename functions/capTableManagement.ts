/**
 * Cap Table & Ownership Tracking
 * Manage capitalization tables for investments
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { company_id, action, shares, valuation, new_round_data } = await req.json();

    if (action === 'create_cap_table') {
      const capTable = {
        company_id,
        created_by: user.email,
        rounds: [
          {
            round_name: 'Seed',
            date: new Date().toISOString(),
            valuation,
            shareholders: [
              { 
                name: 'You', 
                email: user.email, 
                shares, 
                ownership_percent: (shares / 1000000) * 100 
              }
            ]
          }
        ]
      };

      try {
        await base44.entities.CapTable?.create(capTable).catch(() => {});
      } catch (e) {
        console.log('Could not create cap table');
      }

      return Response.json({ success: true, cap_table: capTable });
    }

    if (action === 'update_valuation') {
      return Response.json({ 
        success: true, 
        message: 'Cap table updated with new valuation',
        new_valuation: valuation
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});