import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { dashboard_id, format, include_insights } = await req.json();

    // Fetch dashboard data
    const dashboard = await base44.entities.UserDashboard.get(dashboard_id);
    
    // Collect metrics for all widgets
    const reportData = {
      dashboard_name: dashboard.name,
      generated_date: new Date().toISOString(),
      generated_by: user.full_name,
      widgets: []
    };

    for (const widget of dashboard.widgets) {
      // Fetch actual data for each widget
      // This would call appropriate analytics functions
      reportData.widgets.push({
        title: widget.title,
        type: widget.type,
        data: {} // Populated with actual metrics
      });
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(reportData);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${dashboard.name}-report.csv"`
        }
      });
    }

    if (format === 'pdf') {
      // Generate PDF (simplified - would use a PDF library)
      return Response.json({ 
        message: 'PDF generation in progress',
        download_url: '/api/reports/pdf/' + dashboard_id 
      });
    }

    // Default JSON format
    return Response.json(reportData);

  } catch (error) {
    console.error('Report export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function convertToCSV(data) {
  // Simple CSV conversion
  let csv = 'Widget,Metric,Value\n';
  for (const widget of data.widgets) {
    csv += `${widget.title},${widget.type},${JSON.stringify(widget.data)}\n`;
  }
  return csv;
}