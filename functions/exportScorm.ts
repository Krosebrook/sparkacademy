import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import JSZip from 'npm:jszip@3.10.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId } = await req.json();
        
        const course = await base44.entities.Course.get(courseId);
        if (!course || course.created_by !== user.email) {
            return Response.json({ error: 'Course not found or access denied' }, { status: 403 });
        }

        // Create SCORM 1.2 package
        const zip = new JSZip();
        
        // imsmanifest.xml
        const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.base44.course.${courseId}" version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-${courseId}">
    <organization identifier="ORG-${courseId}">
      <title>${course.title}</title>
      ${course.lessons?.map((lesson, idx) => `
      <item identifier="ITEM-${idx}" identifierref="RES-${idx}">
        <title>${lesson.title}</title>
      </item>`).join('') || ''}
    </organization>
  </organizations>
  <resources>
    ${course.lessons?.map((lesson, idx) => `
    <resource identifier="RES-${idx}" type="webcontent" adlcp:scormtype="sco" href="lesson_${idx}.html">
      <file href="lesson_${idx}.html"/>
    </resource>`).join('') || ''}
  </resources>
</manifest>`;
        
        zip.file('imsmanifest.xml', manifest);
        
        // Create HTML file for each lesson
        course.lessons?.forEach((lesson, idx) => {
            const lessonHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${lesson.title}</title>
    <script src="https://cdn.jsdelivr.net/npm/scorm-again@1.7.0/dist/scorm-again.min.js"></script>
    <style>
        body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
        .lesson-content { line-height: 1.6; }
    </style>
</head>
<body>
    <h1>${lesson.title}</h1>
    <div class="lesson-content">
        ${lesson.content || '<p>No content available</p>'}
    </div>
    <script>
        var scorm = new Scorm12API();
        scorm.initialize();
        scorm.set('cmi.core.lesson_status', 'completed');
        scorm.set('cmi.core.score.raw', '100');
        scorm.terminate();
    </script>
</body>
</html>`;
            zip.file(`lesson_${idx}.html`, lessonHtml);
        });
        
        // Generate zip file
        const zipBlob = await zip.generateAsync({ type: 'arraybuffer' });
        
        return new Response(zipBlob, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${course.title.replace(/[^a-z0-9]/gi, '_')}_scorm.zip"`
            }
        });
        
    } catch (error) {
        console.error('Error generating SCORM package:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});