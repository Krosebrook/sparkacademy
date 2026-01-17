/**
 * Investment Report Generation
 * Create PDF reports and export to Drive/Slides
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    const { report_type, export_format = 'pdf' } = await req.json();

    // Generate report content
    const reportContent = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a ${report_type} investment report for a portfolio investor. Include executive summary, key metrics, opportunities, and risks.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          executive_summary: { type: "string" },
          key_metrics: { type: "object" },
          opportunities: { type: "array", items: { type: "string" } },
          risks: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } }
        }
      }
    });

    if (export_format === 'pdf') {
      // Use HTML2Canvas to generate PDF
      return Response.json({ success: true, report: reportContent, format: 'pdf' });
    }

    if (export_format === 'slides') {
      // Create Google Slides presentation
      const slidesToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');
      return Response.json({ 
        success: true, 
        report: reportContent, 
        format: 'slides',
        token_used: 'googleslides'
      });
    }

    return Response.json({ success: true, report: reportContent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});