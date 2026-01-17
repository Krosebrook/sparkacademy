/**
 * Enhanced Compliance & Due Diligence Analysis
 * AI-powered analysis of SEC filings, regulatory data, and web scraping results
 * Generates risk summaries and recommends follow-up checks
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_name, company_url, include_web_scrape = true } = await req.json();

    // Step 1: Gather data in parallel
    const [secFilings, regulatoryCheck, websiteData] = await Promise.all([
      fetchSECFilings(base44, company_name),
      fetchRegulatoryStatus(base44, company_name),
      include_web_scrape ? scrapeCompanyWebsite(base44, company_url) : Promise.resolve(null)
    ]);

    // Step 2: Comprehensive AI analysis
    const analysisPrompt = buildAnalysisPrompt(company_name, secFilings, regulatoryCheck, websiteData);

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      add_context_from_internet: false,
      response_json_schema: {
        type: "object",
        properties: {
          overall_risk_level: {
            type: "string",
            enum: ["low", "medium", "high", "critical"]
          },
          risk_score: {
            type: "number",
            description: "0-100 score"
          },
          executive_summary: {
            type: "string"
          },
          compliance_concerns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                concern: { type: "string" },
                severity: { type: "string", enum: ["low", "medium", "high"] },
                source: { type: "string" },
                evidence: { type: "string" },
                regulatory_impact: { type: "string" }
              }
            }
          },
          sec_red_flags: {
            type: "array",
            items: { type: "string" }
          },
          regulatory_violations: {
            type: "array",
            items: { type: "string" }
          },
          recommended_followups: {
            type: "array",
            items: {
              type: "object",
              properties: {
                check: { type: "string" },
                priority: { type: "string", enum: ["low", "medium", "high"] },
                reason: { type: "string" },
                estimated_days: { type: "number" }
              }
            }
          },
          investment_recommendation: {
            type: "string",
            enum: ["proceed", "proceed_with_caution", "require_resolution", "do_not_proceed"]
          },
          conditions_for_investment: {
            type: "array",
            items: { type: "string" }
          }
        },
        required: ["overall_risk_level", "risk_score", "executive_summary", "investment_recommendation"]
      }
    });

    // Step 3: Store report in database
    const report = {
      company_name,
      analyst_email: user.email,
      analysis_date: new Date().toISOString(),
      risk_summary: {
        overall_risk_level: aiAnalysis.overall_risk_level,
        risk_score: aiAnalysis.risk_score,
        summary: aiAnalysis.executive_summary
      },
      compliance_concerns: aiAnalysis.compliance_concerns || [],
      sec_findings: {
        recent_filings: secFilings.filings || [],
        red_flags: aiAnalysis.sec_red_flags || [],
        financial_concerns: secFilings.financial_concerns || []
      },
      regulatory_findings: {
        status: regulatoryCheck.status,
        violations: aiAnalysis.regulatory_violations || [],
        investigations: regulatoryCheck.investigations || [],
        agency_interactions: regulatoryCheck.agency_interactions || []
      },
      recommended_followups: aiAnalysis.recommended_followups || [],
      investment_recommendation: aiAnalysis.investment_recommendation,
      conditions_for_investment: aiAnalysis.conditions_for_investment || []
    };

    // Save report
    try {
      await base44.entities.ComplianceReport?.create(report).catch(() => {});
    } catch (e) {
      console.log('Could not store compliance report');
    }

    return Response.json({
      success: true,
      report,
      data_sources: {
        sec_filings: !!secFilings,
        regulatory_check: !!regulatoryCheck,
        website_data: !!websiteData
      }
    });
  } catch (error) {
    console.error('Compliance analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function fetchSECFilings(base44, company_name) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find recent SEC filings (10-K, 10-Q, 8-K, S-1) for ${company_name}. Include filing dates, document types, and key financial metrics.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          cik: { type: "string" },
          filings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                date: { type: "string" },
                url: { type: "string" },
                key_metrics: { type: "object" }
              }
            }
          },
          financial_concerns: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });
    return result;
  } catch (e) {
    console.log('SEC filing fetch failed:', e.message);
    return { filings: [], financial_concerns: [] };
  }
}

async function fetchRegulatoryStatus(base44, company_name) {
  try {
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Check regulatory compliance and status for ${company_name}. Look for: ongoing investigations, violations, enforcement actions, regulatory warnings, and compliance history.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          status: { type: "string" },
          investigations: { type: "array", items: { type: "string" } },
          violations: { type: "array", items: { type: "string" } },
          agency_interactions: { type: "array", items: { type: "string" } },
          compliance_rating: { type: "string" }
        }
      }
    });
    return result;
  } catch (e) {
    console.log('Regulatory check failed:', e.message);
    return { status: 'unknown', investigations: [], violations: [] };
  }
}

async function scrapeCompanyWebsite(base44, company_url) {
  if (!company_url) return null;

  try {
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) return null;

    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: company_url,
        formats: ['markdown'],
        onlyMainContent: true
      })
    });

    const data = await response.json();
    return data?.success ? data.markdown : null;
  } catch (e) {
    console.log('Web scraping failed:', e.message);
    return null;
  }
}

function buildAnalysisPrompt(company_name, secData, regulatoryData, websiteData) {
  return `Conduct a comprehensive compliance and due diligence analysis for ${company_name}.

SEC FILINGS DATA:
${JSON.stringify(secData, null, 2)}

REGULATORY STATUS:
${JSON.stringify(regulatoryData, null, 2)}

COMPANY WEBSITE DATA:
${websiteData ? websiteData.substring(0, 2000) : 'Not available'}

ANALYSIS REQUIREMENTS:
1. Assess overall risk level (0-100 score) considering:
   - SEC filing red flags (accounting issues, restatements, auditor concerns)
   - Regulatory violations or investigations
   - Financial anomalies
   - Governance issues

2. Identify specific compliance concerns with:
   - Clear description
   - Severity level (low/medium/high)
   - Source of concern
   - Evidence
   - Regulatory impact

3. Flag all SEC red flags including:
   - Going concern warnings
   - Material weaknesses in internal controls
   - Significant accounting changes
   - Major litigation

4. List any regulatory violations:
   - Type of violation
   - Agency
   - Status
   - Resolution (if any)

5. Recommend specific follow-up checks prioritized by urgency:
   - Detailed description of check
   - Why it's needed
   - Estimated time to complete
   - Cost implications

6. Provide investment recommendation:
   - Proceed: Low risk, approved for investment
   - Proceed with caution: Medium risk, needs monitoring
   - Require resolution: High risk, certain issues must be resolved
   - Do not proceed: Critical risk, not suitable for investment

7. If recommending conditional investment, specify exact conditions:
   - What must be resolved/verified
   - Timeline
   - Documentation needed

Provide thorough but concise analysis focused on material risks.`;
}