import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export interface SendInvitationEmailParams {
  to: string;
  childName: string;
  inviterName: string;
  inviterRelation: string;
  recipientRelation: string;
  inviteUrl: string;
}

export async function sendInvitationEmail({
  to,
  childName,
  inviterName,
  inviterRelation,
  recipientRelation,
  inviteUrl
}: SendInvitationEmailParams) {
  try {
    console.log(`Sending invitation email to ${to} for child ${childName}`);
    
    const htmlTemplate = `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation til ReSchool</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    }
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .header { padding: 20px !important; }
      .content { padding: 15px !important; }
      .button { padding: 12px 20px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div class="container" style="max-width: 600px; margin: 32px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e9ecef;">
    
    <!-- Header with gradient logo -->
    <div class="header" style="background-color: #ffffff; padding: 32px 24px; text-align: center; border-bottom: 1px solid #e9ecef;">
      <h1 style="background: linear-gradient(135deg, #3d405b 0%, #81b29a 50%, #f2cc8f 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 32px; margin: 0 0 8px 0; line-height: 1.2; color: #3d405b;">
        ReSchool
      </h1>
      <p style="color: #3d405b; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 18px; margin: 0;">
        Du er inviteret!
      </p>
    </div>
    
    <!-- Main Content -->
    <div class="content" style="background-color: #ffffff; padding: 32px 32px 16px 32px;">
      
      <!-- Welcome message -->
      <h2 style="color: #3d405b; font-family: 'Inter', sans-serif; font-weight: 700; font-size: 24px; text-align: center; margin: 0 0 24px 0;">
        ${childName}
      </h2>
      
      <!-- Invitation Message -->
      <div style="background: #f8f9fa; border-left: 4px solid #81b29a; border-radius: 0 4px 4px 0; padding: 20px; margin: 0 0 32px 0;">
        <p style="font-size: 16px; margin: 0 0 12px 0; font-weight: 400; color: #6c757d; line-height: 1.6; font-family: 'Inter', sans-serif;">
          <strong>Hej! 👋</strong>
        </p>
        <p style="font-size: 16px; margin: 0; line-height: 1.6; color: #6c757d; font-family: 'Inter', sans-serif;">
          Du er blevet inviteret af <strong style="color: #3d405b;">${inviterName}</strong> (${inviterRelation}) til at følge 
          <strong style="color: #3d405b;">${childName}</strong> på ReSchool som <strong style="color: #3d405b;">${recipientRelation}</strong>.
        </p>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteUrl}" class="button" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: inline-block; background-color: #81b29a; color: #ffffff; text-decoration: none; border-radius: 8px; padding: 16px 32px; font-size: 16px; font-weight: 600; line-height: 1; text-align: center; border: none; box-shadow: 0 4px 12px rgba(129, 178, 154, 0.25); transition: all 0.2s ease;">
          ✨ Acceptér invitation
        </a>
      </div>
      
      <!-- Info Box -->
      <div style="background: #f8f9fa; border-left: 4px solid #81b29a; border-radius: 0 4px 4px 0; padding: 16px; margin: 32px 0;">
        <p style="color: #6c757d; font-family: 'Inter', sans-serif; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>Hvad er ReSchool?</strong><br/>
          ReSchool er en platform der hjælper med at følge børns udvikling og skabe bedre kommunikation 
          mellem forældre, lærere og andre professionelle.
        </p>
      </div>
      
      <!-- Backup link -->
      <div style="background: #f8f9fa; border-left: 4px solid #81b29a; border-radius: 0 4px 4px 0; padding: 16px; margin: 32px 0;">
        <p style="color: #6c757d; font-family: 'Inter', sans-serif; font-size: 14px; margin: 0; line-height: 1.5;">
          <strong>Problemer med knappen?</strong><br/>
          Du kan også kopiere og indsætte følgende link i din browser:<br/>
          <span style="word-break: break-all; color: #3d405b; font-family: monospace; font-size: 12px;">
            ${inviteUrl}
          </span>
        </p>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; border-top: 1px solid #e9ecef; padding: 24px 32px;">
      <div style="border-top: 1px solid #e9ecef; padding-top: 16px; margin-bottom: 16px;"></div>
      <p style="font-size: 12px; color: #6c757d; margin: 0; text-align: center; line-height: 1.4; font-family: 'Inter', sans-serif;">
        ⏰ Denne invitation udløber om 7 dage
      </p>
      <p style="font-size: 12px; color: #6c757d; margin: 8px 0 0 0; text-align: center; font-family: 'Inter', sans-serif;">
        Hvis du ikke ønsker at deltage, kan du trygt ignorere denne e-mail.
      </p>
      <p style="font-size: 12px; color: #6c757d; margin: 8px 0 0 0; text-align: center; font-family: 'Inter', sans-serif;">
        © 2025 ReSchool. Alle rettigheder forbeholdes.
      </p>
    </div>
    
  </div>
</body>
</html>`;

    const textTemplate = `🎓 ReSchool - Du er inviteret!

Hej! 👋

Du er blevet inviteret af ${inviterName} (${inviterRelation}) til at følge ${childName} på ReSchool som ${recipientRelation}.

✨ Acceptér invitationen her:
${inviteUrl}

🎓 Hvad er ReSchool?
ReSchool er en platform der hjælper med at følge børns udvikling og skabe bedre kommunikation mellem forældre, lærere og andre professionelle.

⏰ Vigtige detaljer:
- Denne invitation udløber om 7 dage
- Hvis du ikke ønsker at deltage, kan du bare ignorere denne mail
- Har du problemer med linket? Kopiér URL'en direkte: ${inviteUrl}

Tak fordi du vil være en del af ${childName}'s ReSchool-rejse! 🌟`;

        // Send the email using Resend
    const { error } = await resend.emails.send({
      from: 'ReSchool <invitations@reschool.dk>',
      to: [to],
      subject: 'Invitation til at følge ' + childName + ' på ReSchool',
      html: htmlTemplate,
      text: textTemplate,
      // Note: audience parameter removed due to TypeScript compatibility
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Handle specific test email limitation
      const errorMessage = JSON.stringify(error);
      if (errorMessage.includes('testing emails') || errorMessage.includes('own email address')) {
        throw new Error(`Test email restriction: You can only send test emails to your own verified email address. To send to other recipients, please verify a domain at resend.com/domains`);
      }
      
      throw new Error(`Failed to send email: ${error.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}
