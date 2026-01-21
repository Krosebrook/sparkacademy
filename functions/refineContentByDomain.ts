import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { content_type, current_content, domain_focus, specific_feedback } = await req.json();

    const domainGuidelines = {
      financial: `
- Focus on financial AI applications: algorithmic trading, risk assessment, fraud detection, portfolio optimization
- Include real-world financial case studies and regulatory considerations
- Add practical examples from fintech, banking, investment firms
- Emphasize data security, compliance, and ethical AI in finance
- Use financial terminology and scenarios`,
      
      developer: `
- Focus on hands-on coding challenges and implementation
- Include API integrations, model deployment, MLOps practices
- Add code examples in Python, JavaScript, and popular AI frameworks
- Emphasize practical engineering: testing, debugging, optimization
- Include GitHub repos, technical documentation, and architecture diagrams`,
      
      creative: `
- Focus on AI for creative applications: art generation, content creation, design automation
- Include examples from media, advertising, entertainment industries
- Add practical exercises with generative AI tools (DALL-E, Midjourney, etc.)
- Emphasize creative workflows and human-AI collaboration
- Use visual examples and multimedia projects`,
      
      healthcare: `
- Focus on medical AI applications: diagnostics, patient care, drug discovery
- Include healthcare-specific case studies and HIPAA compliance
- Add examples from hospitals, research institutions, health tech
- Emphasize patient safety, privacy, and ethical considerations
- Use medical terminology and clinical scenarios`,
      
      manufacturing: `
- Focus on industrial AI: predictive maintenance, quality control, supply chain
- Include IoT integration, automation, and robotics
- Add examples from factories, logistics, and production environments
- Emphasize ROI, efficiency gains, and operational excellence
- Use manufacturing-specific metrics and KPIs`
    };

    const guidelines = domainGuidelines[domain_focus] || '';

    const prompt = `You are an expert instructional designer specializing in corporate AI training for INTInc clients. Refine course content for a specific domain.

CONTENT TYPE: ${content_type}
DOMAIN FOCUS: ${domain_focus}
CURRENT CONTENT: ${JSON.stringify(current_content, null, 2)}

INSTRUCTOR FEEDBACK: ${specific_feedback}

DOMAIN CUSTOMIZATION GUIDELINES:
${guidelines}

Your task:
1. Deeply customize content for the ${domain_focus} domain
2. Replace generic examples with domain-specific ones
3. Add industry-relevant case studies and applications
4. Adjust terminology to match the industry
5. Include practical exercises relevant to the domain
6. Maintain educational quality while making it highly relevant

Apply the instructor's specific feedback AND ensure content is perfectly tailored for ${domain_focus} professionals.

Return the refined content with same structure plus detailed explanation of domain-specific enhancements.`;

    const schema = {
      type: "object",
      properties: {
        refined_content: {
          type: "object",
          description: "Domain-customized content"
        },
        changes_summary: {
          type: "string"
        },
        domain_enhancements: {
          type: "array",
          items: {
            type: "object",
            properties: {
              enhancement_type: { type: "string" },
              original: { type: "string" },
              enhanced: { type: "string" },
              rationale: { type: "string" }
            }
          }
        },
        industry_relevance_score: {
          type: "number",
          description: "0-100 score for domain relevance"
        },
        added_case_studies: {
          type: "array",
          items: { type: "string" }
        },
        recommended_resources: {
          type: "array",
          items: {
            type: "object",
            properties: {
              resource_type: { type: "string" },
              title: { type: "string" },
              description: { type: "string" }
            }
          }
        }
      }
    };

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      add_context_from_internet: true
    });

    return Response.json(result);
  } catch (error) {
    console.error('Domain refinement error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});