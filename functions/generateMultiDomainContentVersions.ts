import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_type, current_content, domains_to_generate } = await req.json();

    const domainConfigs = {
      financial: {
        focus: 'financial',
        prompt_addition: 'algorithmic trading, risk assessment, fraud detection, portfolio optimization, fintech applications'
      },
      developer: {
        focus: 'developer',
        prompt_addition: 'hands-on coding, API integration, model deployment, MLOps, practical engineering'
      },
      creative: {
        focus: 'creative',
        prompt_addition: 'generative AI, content creation, design automation, artistic applications, human-AI collaboration'
      },
      healthcare: {
        focus: 'healthcare',
        prompt_addition: 'medical diagnostics, patient care, drug discovery, HIPAA compliance, clinical applications'
      },
      manufacturing: {
        focus: 'manufacturing',
        prompt_addition: 'predictive maintenance, IoT, supply chain optimization, quality control, operational efficiency'
      }
    };

    const selectedDomains = domains_to_generate || Object.keys(domainConfigs);
    const versions = [];

    // Generate versions in parallel
    const versionPromises = selectedDomains.map(async (domain) => {
      if (!domainConfigs[domain]) return null;

      const config = domainConfigs[domain];
      const prompt = `You are an expert instructional designer creating a domain-specific version of AI course content.

CONTENT TYPE: ${content_type}
ORIGINAL CONTENT: ${JSON.stringify(current_content, null, 2)}
TARGET DOMAIN: ${domain.toUpperCase()}
DOMAIN FOCUS AREAS: ${config.prompt_addition}

Create a customized version of this content optimized for ${domain} professionals. Include:
1. Domain-specific examples and case studies
2. Industry-relevant terminology and scenarios
3. Practical applications in ${domain}
4. Domain-specific resources and tools
5. Real-world use cases

Maintain the same structure but deeply customize the content for ${domain}.`;

      const schema = {
        type: "object",
        properties: {
          domain: { type: "string" },
          customized_content: { type: "object" },
          domain_focus: { type: "array", items: { type: "string" } },
          case_studies: { type: "array", items: { type: "string" } },
          recommended_tools: { type: "array", items: { type: "string" } },
          suitability_score: {
            type: "number",
            description: "0-100 how well suited for this domain"
          }
        }
      };

      try {
        const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt,
          response_json_schema: schema,
          add_context_from_internet: true
        });

        return {
          domain,
          ...result
        };
      } catch (error) {
        console.error(`Error generating ${domain} version:`, error);
        return null;
      }
    });

    const generatedVersions = await Promise.all(versionPromises);
    const validVersions = generatedVersions.filter(v => v !== null);

    return Response.json({
      versions: validVersions,
      total_versions: validVersions.length,
      domains_generated: validVersions.map(v => v.domain),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Multi-domain generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});