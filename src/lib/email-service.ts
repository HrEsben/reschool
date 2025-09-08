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
    
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation til ReSchool</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 10px !important; }
      .header { padding: 20px !important; }
      .content { padding: 15px !important; }
      .button { padding: 12px 20px !important; font-size: 14px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    
    <!-- Header -->
    <div class="header" style="background: linear-gradient(135deg, #81b29a 0%, #f4f1de 100%); padding: 40px 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
        ReSchool
      </h1>
      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 18px; font-weight: 500; opacity: 0.95;">
        Du er inviteret!
      </p>
    </div>
    
    <!-- Main Content -->
    <div class="content" style="padding: 30px;">
      
      <!-- Invitation Message -->
      <div style="background: #f4f1de; padding: 25px; border-radius: 12px; margin-bottom: 30px; border-left: 4px solid #81b29a;">
        <p style="font-size: 18px; margin: 0 0 10px 0; font-weight: 600; color: #3d405b;">
          Hej! 👋
        </p>
        <p style="font-size: 16px; margin: 0; line-height: 1.6; color: #3d405b;">
          Du er blevet inviteret af <strong style="color: #81b29a;">${inviterName}</strong> (${inviterRelation}) til at følge 
          <strong style="color: #81b29a;">${childName}</strong> på ReSchool som <strong style="color: #81b29a;">${recipientRelation}</strong>.
        </p>
      </div>
      
      <!-- Call to Action -->
      <div style="text-align: center; margin: 35px 0;">
        <a href="${inviteUrl}" class="button" style="background: linear-gradient(135deg, #81b29a 0%, #6fa085 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 12px rgba(129, 178, 154, 0.3); transition: all 0.3s ease;">
          ✨ Acceptér invitation
        </a>
      </div>
      
      <!-- Info Box -->
      <div style="background: #ffffff; border: 2px solid #f4f1de; border-radius: 12px; padding: 20px; margin: 30px 0;">
        <div style="display: flex; align-items: flex-start; gap: 15px;">
          <div style="background: #81b29a; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0;">
            🎓
          </div>
          <div>
            <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #3d405b; font-weight: 600;">
              Hvad er ReSchool?
            </h3>
            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
              ReSchool er en platform der hjælper med at følge børns udvikling og skabe bedre kommunikation 
              mellem forældre, lærere og andre professionelle.
            </p>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 25px 30px; border-top: 1px solid #e9ecef; text-align: center;">
      <p style="font-size: 13px; color: #6c757d; margin: 0 0 8px 0;">
        ⏰ Denne invitation udløber om 7 dage
      </p>
      <p style="font-size: 12px; color: #868e96; margin: 0;">
        Hvis du ikke ønsker at deltage, kan du bare ignorere denne mail.
      </p>
      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #dee2e6;">
        <p style="font-size: 11px; color: #adb5bd; margin: 0;">
          Link virker ikke? Kopiér denne URL:<br>
          <span style="word-break: break-all;">${inviteUrl}</span>
        </p>
      </div>
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
