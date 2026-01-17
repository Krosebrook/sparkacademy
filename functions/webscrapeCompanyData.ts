/**
 * Web Scraping & Data Extraction
 * Use Firecrawl to extract company data from websites
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { url, extract_type } = await req.json();

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      return Response.json({ error: 'Firecrawl API key not configured' }, { status: 400 });
    }

    // Use Firecrawl to scrape and extract data
    const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['script', 'style']
      })
    });

    const scrapedData = await scrapeResponse.json();

    if (extract_type === 'team') {
      // Extract team information
      return Response.json({ 
        success: true, 
        data: scrapedData,
        extracted_for: 'team'
      });
    }

    if (extract_type === 'financials') {
      // Extract financial information
      return Response.json({ 
        success: true, 
        data: scrapedData,
        extracted_for: 'financials'
      });
    }

    return Response.json({ success: true, data: scrapedData });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});