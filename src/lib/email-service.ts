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
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation til ReSchool</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #81b29a 0%, #f4f1de 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">Du er inviteret til ReSchool!</h1>
  </div>
  
  <div style="background: #f4f1de; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
    <p style="font-size: 16px; margin: 0;">
      Hej! Du er blevet inviteret af <strong>${inviterName}</strong> (${inviterRelation}) til at følge 
      <strong>${childName}</strong> på ReSchool som <strong>${recipientRelation}</strong>.
    </p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${inviteUrl}" style="background: #81b29a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
      Acceptér invitation
    </a>
  </div>
  
  <div style="background: #fff; border-left: 4px solid #81b29a; padding: 15px; margin: 25px 0;">
    <p style="margin: 0; font-size: 14px; color: #666;">
      <strong>Hvad er ReSchool?</strong><br>
      ReSchool er en platform der hjælper med at følge børns udvikling og skabe bedre kommunikation 
      mellem forældre, lærere og andre professionelle.
    </p>
  </div>
  
  <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; text-align: center;">
    <p style="font-size: 12px; color: #666; margin: 0;">
      Denne invitation udløber om 7 dage. Hvis du ikke ønsker at deltage, kan du bare ignorere denne mail.
    </p>
    <p style="font-size: 12px; color: #666; margin: 10px 0 0 0;">
      Link virker ikke? Kopiér denne URL: ${inviteUrl}
    </p>
  </div>
</body>
</html>`;

    const textTemplate = `Du er inviteret til ReSchool!

Hej! Du er blevet inviteret af ${inviterName} (${inviterRelation}) til at følge ${childName} på ReSchool som ${recipientRelation}.

Klik på dette link for at acceptere invitationen:
${inviteUrl}

Denne invitation udløber om 7 dage.

ReSchool er en platform der hjælper med at følge børns udvikling og skabe bedre kommunikation mellem forældre, lærere og andre professionelle.`;

        // Send the email using Resend
    const { data, error } = await resend.emails.send({
      from: 'ReSchool <onboarding@resend.dev>',
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
