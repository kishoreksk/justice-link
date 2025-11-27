import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MeetingNotificationRequest {
  type: "meeting_scheduled" | "award_finalized";
  caseId: string;
  applicantName: string;
  applicantEmail: string;
  respondentName: string;
  respondentEmail: string;
  resolutionMethod: string;
  meetingLink?: string;
  meetingDate?: string;
  documentUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      type,
      caseId,
      applicantName,
      applicantEmail,
      respondentName,
      respondentEmail,
      resolutionMethod,
      meetingLink,
      meetingDate,
      documentUrl,
    }: MeetingNotificationRequest = await req.json();

    console.log("Sending notification:", { type, caseId, applicantEmail, respondentEmail });

    let subject = "";
    let htmlContent = "";

    if (type === "meeting_scheduled") {
      subject = `eNyaya Resolve - Meeting Scheduled for Case ${caseId}`;
      
      const formattedDate = meetingDate 
        ? new Date(meetingDate).toLocaleString('en-IN', {
            dateStyle: 'full',
            timeStyle: 'short',
            timeZone: 'Asia/Kolkata'
          })
        : "To be confirmed";

      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 4px; }
              .meeting-link { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              h1 { margin: 0; font-size: 24px; }
              h2 { color: #667eea; font-size: 20px; }
              .label { font-weight: bold; color: #667eea; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🤝 Meeting Scheduled</h1>
                <p>eNyaya Resolve - Online Dispute Resolution</p>
              </div>
              <div class="content">
                <p>Dear Participant,</p>
                <p>A meeting has been scheduled for your dispute resolution case.</p>
                
                <div class="info-box">
                  <h2>Case Details</h2>
                  <p><span class="label">Case ID:</span> ${caseId}</p>
                  <p><span class="label">Resolution Method:</span> ${resolutionMethod}</p>
                  <p><span class="label">Applicant:</span> ${applicantName}</p>
                  <p><span class="label">Respondent:</span> ${respondentName}</p>
                </div>

                <div class="info-box">
                  <h2>Meeting Information</h2>
                  <p><span class="label">Scheduled Time:</span> ${formattedDate}</p>
                  ${meetingLink ? `
                    <p style="margin-top: 20px;">
                      <a href="${meetingLink}" class="meeting-link" target="_blank">
                        Join Meeting
                      </a>
                    </p>
                  ` : '<p>Meeting link will be provided shortly.</p>'}
                </div>

                <div class="info-box">
                  <h2>📋 Important Notes</h2>
                  <ul>
                    <li>Please join the meeting 5 minutes before the scheduled time</li>
                    <li>Ensure you have a stable internet connection</li>
                    <li>Keep all relevant documents ready for reference</li>
                    <li>Both parties must attend the meeting</li>
                  </ul>
                </div>

                <p>If you have any questions, please contact our support team.</p>
              </div>
              <div class="footer">
                <p>This email is generated from <strong>eNyaya Resolve</strong></p>
                <p>© ${new Date().getFullYear()} eNyaya Resolve. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else if (type === "award_finalized") {
      subject = `eNyaya Resolve - Award Copy Finalized for Case ${caseId}`;
      
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #10b981; border-radius: 4px; }
              .download-button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
              h1 { margin: 0; font-size: 24px; }
              h2 { color: #10b981; font-size: 20px; }
              .label { font-weight: bold; color: #10b981; }
              .success-badge { background: #d1fae5; color: #065f46; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 10px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Award Copy Finalized</h1>
                <p>eNyaya Resolve - Online Dispute Resolution</p>
              </div>
              <div class="content">
                <p>Dear Participant,</p>
                <p>We are pleased to inform you that the award copy for your dispute resolution case has been finalized.</p>
                
                <div class="success-badge">
                  Case Resolved Successfully
                </div>

                <div class="info-box">
                  <h2>Case Details</h2>
                  <p><span class="label">Case ID:</span> ${caseId}</p>
                  <p><span class="label">Resolution Method:</span> ${resolutionMethod}</p>
                  <p><span class="label">Applicant:</span> ${applicantName}</p>
                  <p><span class="label">Respondent:</span> ${respondentName}</p>
                </div>

                <div class="info-box">
                  <h2>📄 Award Document</h2>
                  <p>The final award document is now available. This document contains the complete details and resolution of your case.</p>
                  ${documentUrl ? `
                    <p style="margin-top: 20px;">
                      <a href="${documentUrl}" class="download-button" target="_blank">
                        Download Award Copy
                      </a>
                    </p>
                  ` : '<p>The document will be available in your dashboard shortly.</p>'}
                </div>

                <div class="info-box">
                  <h2>⚖️ Legal Information</h2>
                  <ul>
                    <li>This award is binding on both parties</li>
                    <li>Please review the document carefully</li>
                    <li>Keep this document for your records</li>
                    <li>Contact us if you have any questions about the award</li>
                  </ul>
                </div>

                <p>Thank you for using eNyaya Resolve for your dispute resolution.</p>
              </div>
              <div class="footer">
                <p>This email is generated from <strong>eNyaya Resolve</strong></p>
                <p>© ${new Date().getFullYear()} eNyaya Resolve. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Send email to applicant
    const applicantEmailResult = await resend.emails.send({
      from: "eNyaya Resolve <onboarding@resend.dev>",
      to: [applicantEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Applicant email sent:", applicantEmailResult);

    // Send email to respondent
    const respondentEmailResult = await resend.emails.send({
      from: "eNyaya Resolve <onboarding@resend.dev>",
      to: [respondentEmail],
      subject: subject,
      html: htmlContent,
    });

    console.log("Respondent email sent:", respondentEmailResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Notifications sent successfully",
        applicantEmailId: applicantEmailResult.data?.id,
        respondentEmailId: respondentEmailResult.data?.id
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-dispute-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
