import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { course_id, student_email } = await req.json();

        if (!course_id || !student_email) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Fetch course and enrollment data
        const course = await base44.entities.Course.get(course_id);
        const enrollments = await base44.entities.Enrollment.filter({
            course_id,
            student_email
        });

        if (!course || enrollments.length === 0) {
            return Response.json({ error: 'Course or enrollment not found' }, { status: 404 });
        }

        const enrollment = enrollments[0];
        if (enrollment.completion_percentage !== 100) {
            return Response.json({ error: 'Course not completed' }, { status: 400 });
        }

        // Check if certificate already exists
        const existingCerts = await base44.asServiceRole.entities.Certificate.filter({
            course_id,
            student_email
        });

        if (existingCerts.length > 0) {
            return Response.json({ certificate: existingCerts[0] });
        }

        // Generate unique verification code
        const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create PDF certificate
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Background
        doc.setFillColor(254, 243, 199);
        doc.rect(0, 0, 297, 210, 'F');

        // Border
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(3);
        doc.rect(10, 10, 277, 190);

        // Title
        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });

        // Divider
        doc.setDrawColor(245, 158, 11);
        doc.setLineWidth(1);
        doc.line(70, 60, 227, 60);

        // Student name
        const studentUser = await base44.asServiceRole.entities.User.filter({ email: student_email });
        const studentName = studentUser[0]?.full_name || student_email;

        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(studentName, 148.5, 85, { align: 'center' });

        // Text
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text('has successfully completed', 148.5, 100, { align: 'center' });

        // Course title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(course.title, 148.5, 115, { align: 'center' });

        // Date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        const completionDate = new Date(enrollment.updated_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Completed on ${completionDate}`, 148.5, 135, { align: 'center' });

        // Verification code
        doc.setFontSize(10);
        doc.text(`Verification Code: ${verificationCode}`, 148.5, 145, { align: 'center' });

        // Signature line
        doc.setDrawColor(148, 163, 184);
        doc.line(100, 165, 197, 165);

        // Instructor info
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(course.instructor_name || 'Course Instructor', 148.5, 172, { align: 'center' });
        doc.text('Course Instructor', 148.5, 180, { align: 'center' });

        // Convert to buffer
        const pdfBuffer = doc.output('arraybuffer');
        const pdfBlob = new Uint8Array(pdfBuffer);

        // Upload to storage
        const file = new File([pdfBlob], `certificate-${verificationCode}.pdf`, { type: 'application/pdf' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });

        // Create certificate record
        const certificate = await base44.asServiceRole.entities.Certificate.create({
            course_id,
            course_title: course.title,
            student_email,
            student_name: studentName,
            completion_date: new Date().toISOString(),
            certificate_url: file_url,
            verification_code: verificationCode,
            instructor_name: course.instructor_name,
            course_duration: course.duration_hours
        });

        return Response.json({ certificate });
    } catch (error) {
        console.error('Error generating certificate:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});