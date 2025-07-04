# InstaPhotoBooth - Business & Operations Guide

**Important Note on AI Studio Previews:** Due to the complexity of this application (secure payments, camera access, advanced graphics), it is **expected to show a blank/black screen** in the AI Studio preview window. This is not an error. The app must be deployed to a real web host like Vercel to function correctly. **Please follow the deployment steps below to see your live, working application.**

Congratulations on your new InstaPhotoBooth business! This guide is your single source of truth for setting up, running, and updating your application. It is designed for a non-technical user.

## Table of Contents
1.  [How It Works: For the Business Owner](#how-it-works-for-the-business-owner)
2.  [Anticipated Monthly Costs](#anticipated-monthly-costs)
3.  [Step 0: Getting Your Code on GitHub (One-Time Setup)](#step-0-getting-your-code-on-github-one-time-setup)
4.  [Step 1: Deploy Your Application](#step-1-deploy-your-application)
5.  [Step 2: Set Up Stripe for Payments](#step-2-set-up-stripe-for-payments)
6.  [Step 3: Set Up SendGrid for Email](#step-3-set-up-sendgrid-for-email)
7.  [Step 4: Configure Your Application](#step-4-configure-your-application)
8.  [How to Make Changes and Updates](#how-to-make-changes-and-updates)
9.  [How to Update Landing Page Images](#how-to-update-landing-page-images)

---

## How It Works: For the Business Owner

Your new InstaPhotoBooth business is built on a "Good, Better, Best" model. Customers choose from three packages:
*   **Starter:** A basic, time-limited pass.
*   **Pro & Ultimate:** Higher-value passes that include access to the **Photo Design Studio**. This powerful editor allows your customers to upload their own logos and add custom text to create a personalized photo overlay for their event, all by themselves.

A secret **Master Admin Code (`0242`)** is built-in, allowing you to bypass payment to test all features, including the Design Studio.

---

## Anticipated Monthly Costs

This application is designed to be extremely cost-effective, especially when starting out. Here is a realistic breakdown of your hard costs:

| Service       | Free Tier / Starting Cost                                                                                                | When Do You Pay?                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Vercel**    | **$0/month**. The free "Hobby" tier is very generous and is more than enough to launch and run your business.               | You would only need to upgrade to a paid plan if your site becomes extremely popular (a great problem to have!). |
| **Stripe**    | **$0/month**. Stripe has no monthly fees. They only take a small percentage of each transaction.                           | You only pay when a customer pays you. The fee is automatically deducted.                                     |
| **SendGrid**  | **$0/month**. The free tier allows you to send thousands of emails per month, which should be plenty for starting out.     | You would only pay if your email volume becomes very high.                                                    |
| **Domain Name** | **~$15/year**. This is your only required, fixed cost. You will purchase your domain (e.g., `InstaPhotoBooth.com`) from a registrar. | Paid once per year to a service like GoDaddy, Namecheap, or Google Domains.                                   |

**Conclusion:** Your initial hard cost to exist per month is **$0**, plus the yearly domain fee. Your costs will only grow as your revenue grows, which is an ideal business model.

---

## Step 0: Getting Your Code on GitHub (One-Time Setup)

This is the new, easier way to get your code on GitHub using their official desktop app. This avoids creating every file by hand.

1.  **Create a GitHub Account**: If you haven't already, go to https://github.com and sign up for a free account.

2.  **Create a New (Empty) Repository on GitHub.com**:
    *   On your GitHub homepage, click the `+` icon in the top right and select "New repository".
    *   Give it a simple name, like `instaphotobooth-app`.
    *   Make sure it is set to **Public**.
    *   **Do not** check any boxes to add a README, .gitignore, or license. We need it to be completely empty.
    *   Click "Create repository".

3.  **Download and Install GitHub Desktop**:
    *   Go to https://desktop.github.com/ and download the free, official application for your computer.
    *   Install and open it. Log in with the GitHub account you just created.

4.  **Clone Your Empty Repository**:
    *   In GitHub Desktop, go to `File` > `Clone Repository...`.
    *   You should see your `instaphotobooth-app` repository in the list. Select it.
    *   Choose a location on your computer to save the project files (the `Documents/GitHub` folder is a good default).
    *   Click the "Clone" button. This will create a new, empty folder on your computer that is linked to your online repository.

5.  **Add Your Project Files**:
    *   Find the `.zip` file you downloaded from AI Studio and unzip it.
    *   Open the unzipped folder. You should see all the files and folders.
    *   **File Structure Checklist**: Before you drag, ensure your unzipped folder contains the following:
        *   `api` (folder with 5 files inside: `activate.ts`, `checkout.ts`, `email.ts`, `save-design.ts`, `send-photo.ts`, `stripe-webhook.ts`, `stripe.ts`, `verify-purchase.ts`)
        *   `components` (folder with 7 files inside: `ActivationScreen.tsx`, `DesignStudio.tsx`, `icons.tsx`, `LandingScreen.tsx`, `PhotoScreen.tsx`, `PreviewScreen.tsx`, `PurchaseSuccessScreen.tsx`, `SalesPage.tsx`, `SessionExpiredScreen.tsx`, `Timer.tsx`)
        *   `App.tsx`
        *   `constants.ts`
        *   `index.html`
        *   `index.tsx`
        *   `metadata.json`
        *   `package.json`
        *   `README.md`
        *   `README.txt`
        *   `types.ts`
    *   Select **all** of these items and drag them directly into the `instaphotobooth-app` folder that GitHub Desktop just created.

6.  **Upload (Commit & Push) Your Files**:
    *   Go back to the GitHub Desktop application. It will now show a list of all the files you just added.
    *   At the bottom left, you will see a "Summary" box. Type a short description like `Initial project setup`.
    *   Click the blue button that says "Commit to main".
    *   At the top of the window, click the button that says "Push origin".

**That's it!** You have successfully uploaded your entire project to GitHub in one go. You can now refresh your GitHub.com page to see all the files there, and you are ready for Step 1.

---

## Step 1: Deploy Your Application

The easiest way to get your app live is with a service like **Vercel** or **Netlify**. This guide uses Vercel.

1.  Sign up for a Vercel account (https://vercel.com) using your new GitHub account.
2.  On your Vercel dashboard, click "Add New..." -> "Project".
3.  Select the GitHub repository you just created (`instaphotobooth-app`).
4.  Vercel will automatically detect the project settings. You don't need to change anything. Just click **Deploy**.
5.  Wait a few minutes. Vercel will build and deploy your site.
6.  Once deployed, Vercel will give you your official website URL (e.g., `https://your-project-name.vercel.app`). **Keep this URL handy!** You can also add your custom domain (like `InstaPhotoBooth.com`) in the Vercel project settings under the "Domains" tab.

---

## Step 2: Set Up Stripe for Payments

Stripe will handle all payments securely.

1.  **Create a Stripe Account**: If you don't have one, sign up at https://stripe.com.
2.  **Find Your API Keys**:
    *   In your Stripe Dashboard, go to the **Developers** section.
    *   Click on **API Keys**.
    *   You will see a **Publishable key** (`pk_...`) and a **Secret key** (`sk_...`). You will need the **Secret key**.
3.  **Create a Webhook Endpoint**: This is how Stripe tells our app that a payment was successful.
    *   In the Stripe Dashboard, go to **Developers** -> **Webhooks**.
    *   Click **Add endpoint**.
    *   For the **Endpoint URL**, enter your website URL from Step 1, followed by `/api/stripe-webhook`. It will look like this: `https://your-project-name.vercel.app/api/stripe-webhook`.
    *   For **Events to send**, click "Select events" and choose `checkout.session.completed`.
    *   Click **Add endpoint**.
    *   After creating it, click on the new webhook and find the **Signing secret** (starts with `whsec_...`). You will need this.

---

## Step 3: Set Up SendGrid for Email

To send photos reliably, we'll use a dedicated email service.

1.  Sign up for a SendGrid account (https://sendgrid.com).
2.  **Create an API Key**:
    *   In your SendGrid dashboard, go to **Settings** -> **API Keys**.
    *   Click **Create API Key**. Give it a name and choose "Full Access".
    *   Copy the key it gives you immediately. **You won't be able to see it again.**
3.  **Verify a Sender Identity**: You need to prove you own the "From" email address.
    *   Go to **Settings** -> **Sender Authentication**.
    *   Follow the steps to verify a "Single Sender".
4.  **Create a Dynamic Email Template**: This allows you to create a beautiful, custom email template without touching any code.
    *   In SendGrid, go to **Email API** -> **Dynamic Templates**.
    *   Click **Create a Dynamic Template**. Give it a name like "Photo Delivery".
    *   After creation, click **Add Version**. Choose a blank template or a pre-made one.
    *   In the editor, use these exact **handlebar-style** placeholders where you want the content to appear:
        *   `{{heading}}` - For the main title.
        *   `{{body}}` - For the main text paragraph.
        *   `{{image_url}}` - **Important**: This will be replaced by the photo. Put this inside an `<img>` tag's `src` attribute. For example: `<img src="{{image_url}}" alt="Your Photo" style="width:100%;">`
        *   `{{cta_text}}` - The text for a call-to-action button.
        *   `{{cta_url}}` - The link for the button.
    *   Once you've designed your template, go back to the Dynamic Templates page. You will see a **Template ID** that looks like `d-xxxxxxxxxxxxxxxx`. Copy this ID.

---

## Step 4: Configure Your Application

This is the final step! You'll add the keys and IDs you just collected into your application's settings in Vercel.

1.  Go to your project dashboard on Vercel.
2.  Go to the **Settings** tab.
3.  Click on **Environment Variables**.
4.  You will now add each of the following variables one by one.

| Name (Key)                 | Value                                                              | Description                                                              |
| -------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `STRIPE_SECRET_KEY`        | The key starting with `sk_...` from Stripe.                   | Your main Stripe secret key.                                             |
| `STRIPE_WEBHOOK_SECRET`    | The key starting with `whsec_...` from your Stripe webhook.        | Secures communication from Stripe.                                       |
| `SENDGRID_API_KEY`         | The API key you created in SendGrid.                               | Allows the app to send emails via SendGrid.                              |
| `FROM_EMAIL`               | The email address you verified with SendGrid.                      | The "From" address on emails sent to your customers.                     |
| `SITE_URL`                 | Your full website URL from Step 1.                                 | Used to create redirect links for Stripe.                                |
| `SENDGRID_TEMPLATE_ID`     | The `d-xxxxxxxx` ID of your Dynamic Template.                      | The template to use for sending photos.                                  |
| `EMAIL_SUBJECT`            | "Your Photo from InstaPhotoBooth!"                                 | The subject line for the photo email.                                    |
| `EMAIL_HEADING`            | "Here's Your Photo!"                                               | The main heading inside your email template.                             |
| `EMAIL_BODY`               | "Thanks for using the booth! You can view and download your photo."| The main paragraph text in your email.                                   |
| `EMAIL_CTA_TEXT`           | "Create Your Own Photo Booth Event!"                               | The text for the call-to-action button in the email.                     |
| `EMAIL_CTA_URL`            | Your website URL (from Step 1).                                    | The link for the call-to-action button.                                  |

5.  After adding all the variables, you need to **re-deploy** your application. Go to the "Deployments" tab in Vercel, click the `...` menu on the latest deployment, and choose "Redeploy".

**You are done!** Your InstaPhotoBooth is now fully operational, ready to take payments, and serve your customers automatically.

---

## How to Make Changes and Updates

Your website is powered by the code in your GitHub repository. Vercel automatically watches for any changes you make there. Here is the simple workflow for updating your site using me.

1.  **Start a New Conversation**: When you want a change, start a new session with me in AI Studio.
2.  **State Your Request**: Clearly explain the change you want to make. For example, "I want to change the price of the 1 Hour Pass to $15" or "I want to add a new 'Sepia' photo filter".
3.  **Provide the Current Files**: I will ask you to provide the code for all the current files in your project. You can get this code directly from your GitHub repository.
4.  **Receive the Updates**: I will provide a list of the updated files in the same XML format as before.
5.  **Update Your GitHub Repository**:
    *   For each file I've updated, go to that file in your GitHub repository.
    *   Click the "pencil" icon to edit the file.
    *   Delete all the old code and paste in the new, updated code I provided.
    *   Click "Commit changes...".
6.  **Vercel Does the Rest**: Once you've committed the changes to GitHub, Vercel will automatically detect them, rebuild your site, and deploy the new version. The update will be live within a few minutes. You don't need to do anything else.

---
## How to Update Landing Page Images

To keep your sales page fresh with real photos from your events, you'll need to update the image links in the code.

1.  **Host Your Image**: You need a public URL for your new image. A simple free option is to use a service like [Imgur](https://imgur.com/upload). Upload your image, and after it's done, right-click the image and select "Copy Image Address". This gives you a direct URL ending in `.png` or `.jpg`.

2.  **Locate the File**: The images are in the `components/SalesPage.tsx` file in your GitHub repository.

3.  **Edit the Code**:
    *   Navigate to `components/SalesPage.tsx` in GitHub and click the "pencil" icon to edit.
    *   Look for the `<section>` with the comment `{/* Mockup/Visual Section */}`.
    *   Find the `<img>` tag inside it. The code will look like this:
        ```jsx
        <img 
          src="https://storage.googleapis.com/..." // <-- THIS IS THE LINK TO REPLACE
          alt="..."
          className="..." 
        />
        ```
    *   Replace the URL inside the `src="..."` with the new URL you copied from Imgur.
    *   Do the same for the second image in the "Event Branding Section".
    *   Click "Commit changes...".

4.  **Vercel Auto-Deploys**: That's it! Vercel will see the change and update your live website with the new images automatically.