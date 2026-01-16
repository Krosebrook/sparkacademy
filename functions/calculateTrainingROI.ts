import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      organization_id,
      training_cost,
      employee_count,
      avg_salary,
      project_success_rate_before,
      project_success_rate_after
    } = await req.json();
    
    // Convert to numbers
    const cost = parseFloat(training_cost);
    const empCount = parseInt(employee_count);
    const salary = parseFloat(avg_salary);
    const successBefore = parseFloat(project_success_rate_before);
    const successAfter = parseFloat(project_success_rate_after);
    
    // Calculate productivity improvement
    const successImprovement = successAfter - successBefore;
    const productivityGain = (successImprovement / 100) * salary * empCount;
    
    // Calculate reduced rework costs
    const reworkReduction = (successImprovement / 100) * 0.15 * salary * empCount;
    
    // Calculate employee retention benefit
    const retentionBenefit = empCount * 0.1 * salary * 0.5; // Assume 10% better retention
    
    // Total benefits
    const totalBenefit = productivityGain + reworkReduction + retentionBenefit;
    const netBenefit = totalBenefit - cost;
    const roiPercentage = Math.round((netBenefit / cost) * 100);
    
    // Payback period
    const monthlyBenefit = totalBenefit / 12;
    const paybackMonths = Math.ceil(cost / monthlyBenefit);
    
    const impact_areas = [
      { category: 'Productivity Gains', value: Math.round(productivityGain) },
      { category: 'Reduced Rework', value: Math.round(reworkReduction) },
      { category: 'Retention Benefits', value: Math.round(retentionBenefit) }
    ];
    
    const summary = `Training investment of $${cost.toLocaleString()} generates an ROI of ${roiPercentage}% with a payback period of ${paybackMonths} months. The ${successImprovement}% improvement in project success rate translates to $${Math.round(totalBenefit).toLocaleString()} in annual benefits.`;

    return Response.json({
      roi_percentage: roiPercentage,
      net_benefit: Math.round(netBenefit),
      total_benefit: Math.round(totalBenefit),
      payback_months: paybackMonths,
      impact_areas,
      summary
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});