import sgMail from '@sendgrid/mail';

// Configuration from environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL;
const TEMPLATE_ID = process.env.SENDGRID_TEMPLATE_ID;
const EMAIL_SUBJECT = process.env.EMAIL_SUBJECT || 'Your Photo from InstaPhotoBooth!';
const EMAIL_HEADING = process.env.EMAIL_HEADING || "Here's your photo!";
const EMAIL_BODY = process.env.EMAIL_BODY || 'Thanks for using the photo booth. We hope you had a blast!';
const EMAIL_CTA_TEXT = process.env.EMAIL_CTA_TEXT || 'Book Your Own Booth';
const EMAIL_CTA_URL = process.env.EMAIL_CTA_URL || process.env.SITE_URL || 'https://example.com';

if (!SENDGRID_API_KEY || !FROM_EMAIL || !TEMPLATE_ID) {
  throw new Error("Missing SendGrid configuration in environment variables.");
}

sgMail.setApiKey(SENDGRID_API_KEY);

interface PhotoEmailArgs {
  to: string;
  imageDataUrl: string; // This will be uploaded and a URL will be created.
}

// In a real-world scenario, you would upload the image to a CDN (like Cloudinary, S3)
// and pass the public URL to SendGrid. Data URLs in emails have poor support.
// This function simulates that by returning the data URL directly for the template.
const uploadImageToCDN = async (imageDataUrl: string): Promise<string> => {
  console.log('[CDN Sim] "Uploading" image to CDN...');
  // In a real implementation:
  // const result = await cloudinary.uploader.upload(imageDataUrl);
  // return result.secure_url;
  return imageDataUrl; // For this demo, we pass the data URI directly.
};

export const sendPhotoByEmail = async ({ to, imageDataUrl }: PhotoEmailArgs) => {
  // 1. Create the final composite image on the backend
  // This is more robust than client-side compositing.
  const finalImage = imageDataUrl; // For now, we assume the client sends the final composite.
  
  // 2. "Upload" the image to get a public URL
  const publicImageUrl = await uploadImageToCDN(finalImage);

  const msg = {
    to: to,
    from: {
      email: FROM_EMAIL!,
      name: 'InstaPhotoBooth'
    },
    templateId: TEMPLATE_ID!,
    dynamicTemplateData: {
      heading: EMAIL_HEADING,
      body: EMAIL_BODY,
      image_url: publicImageUrl,
      cta_text: EMAIL_CTA_TEXT,
      cta_url: EMAIL_CTA_URL,
      subject: EMAIL_SUBJECT,
    },
    // We still attach for clients that don't display data URIs well.
    attachments: [{
        content: imageDataUrl.split(',')[1],
        filename: 'instaphotobooth.jpg',
        type: 'image/jpeg',
        disposition: 'attachment',
    }]
  };

  try {
    await sgMail.send(msg);
    console.log(`Photo email sent successfully to ${to} using template ${TEMPLATE_ID}`);
  } catch (error: any) {
    console.error('Error sending email:', error.response?.body || error);
    throw new Error('Failed to send email.');
  }
};


export const sendAccessCodeByEmail = async (to: string, code: string) => {
    const msg = {
        to,
        from: {
            email: FROM_EMAIL!,
            name: 'InstaPhotoBooth'
        },
        subject: `Your InstaPhotoBooth Access Code: ${code}`,
        html: `
         <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto;">
            <h2>Your Access Code is Ready!</h2>
            <p>Thank you for your purchase. Your photo booth session can be started immediately by returning to the page where you paid.</p>
            <p>If you closed the window, use the code below to start your session.</p>
            <div style="background-color: #f4f4f4; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; color: #333;">${code}</p>
            </div>
            <p>Enjoy the fun!</p>
            <p style="margin-top: 30px; font-size: 12px; color: #888;">
              Powered by InstaPhotoBooth
            </p>
        </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`Access code email sent to ${to}`);
    } catch (error: any) {
        console.error('Failed to send access code email:', error.response?.body || error);
        throw new Error('Failed to send access code email.');
    }
}