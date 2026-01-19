import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { topic, key_points, outline, course_id } = await req.json();

    const keyPointsContext = key_points ? `\n\nKey Points to Cover:\n${key_points}` : '';
    const outlineContext = outline ? `\n\nLesson Outline:\n${JSON.stringify(outline, null, 2)}` : '';

    const prompt = `Write comprehensive lesson content for: "${topic}"${keyPointsContext}${outlineContext}

Create engaging, educational content that:
- Explains concepts clearly with examples
- Uses a conversational yet professional tone
- Includes practical applications
- Breaks down complex ideas
- Engages learners throughout

Write the content in Markdown format. Include:
- Introduction
- Main content sections
- Examples and analogies
- Summary/key takeaways

Provide the content along with metadata.`;

    const contentResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt
    });

    // Calculate word count and reading time
    const wordCount = contentResult.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words/min

    const result = {
      content: contentResult,
      word_count: wordCount,
      reading_time: readingTime,
      suggestions: [
        "Consider adding visual elements or diagrams",
        "Include code examples if applicable",
        "Add practice exercises at the end",
        "Create discussion questions for engagement"
      ]
    };

    return Response.json(result);
  } catch (error) {
    console.error('Content generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});