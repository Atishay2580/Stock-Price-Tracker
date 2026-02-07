# EmailJS Setup Guide for Stock Price Notifications

This guide will help you set up EmailJS to enable email notifications for stock price alerts.

## Step 1: Create EmailJS Account

1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Sign up for a free account (allows 200 emails/month)
3. Verify your email address

## Step 2: Create Email Service

1. In EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended for testing)
4. Follow the setup instructions to connect your email
5. Note your **Service ID** (e.g., `service_xxxxxxx`)

## Step 3: Create Email Templates

### Template 1: Confirmation Email (when notification is set)

1. Go to **Email Templates** → **Create New Template**
2. Name it: "Stock Notification Confirmation"
3. Use this template:

```
Subject: Stock Alert Set: {{symbol}}

Hello,

You've successfully set a price alert for {{symbol}}.

Stock Details:
- Symbol: {{symbol}}
- Current Price: ${{base_price}}
- Target Price: ${{target_price}}
{% if percentage %}Percentage Threshold: {{percentage}}%{% endif %}
{% if price_change %}Price Change Threshold: ${{price_change}}{% endif %}

You will receive an email when the stock reaches your target price.

Thank you for using Stock Price Tracker!
```

4. Note the **Template ID** (e.g., `template_xxxxxxx`)

### Template 2: Alert Email (when price threshold is met)

1. Create another template: "Stock Price Alert"
2. Use this template:

```
Subject: 🚨 Price Alert: {{symbol}} Reached Target!

Hello,

Your price alert for {{symbol}} has been triggered!

Price Details:
- Symbol: {{symbol}}
- Base Price: ${{base_price}}
- Current Price: ${{current_price}}
- Target Price: ${{target_price}}
- Price Change: ${{price_change}} ({{percentage_change}}%)

{{message}}

Check your portfolio now!

Thank you for using Stock Price Tracker!
```

5. Note this **Template ID** as well

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `xxxxxxxxxxxxx`)

## Step 5: Configure Environment Variables

Create or update your `.env` file in the project root:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_confirmation_template_id_here
VITE_EMAILJS_ALERT_TEMPLATE_ID=your_alert_template_id_here
```

## Step 6: Restart Development Server

After adding environment variables, restart your development server:

```bash
npm run dev
```

## Testing

1. Set a notification for a stock
2. Check your email for the confirmation message
3. The alert email will be sent automatically when the price threshold is met

## Note on Notification Checking

The notification checker (`src/utils/notificationChecker.js`) needs to be called periodically to check prices and send alerts. For production, you should:

1. **Option A**: Set up a Firebase Cloud Function that runs on a schedule (recommended)
2. **Option B**: Use a cron job service to call the checker function
3. **Option C**: Call it manually for testing

### Setting up Cloud Function (Recommended)

Create a Firebase Cloud Function that runs every 15 minutes:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.checkStockNotifications = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    // Import and call checkNotifications function
    const { checkNotifications } = require('./utils/notificationChecker');
    return await checkNotifications();
  });
```

## Troubleshooting

- **Emails not sending**: Check that all environment variables are set correctly
- **Template errors**: Ensure template variables match exactly (case-sensitive)
- **Service connection**: Verify your email service is properly connected in EmailJS dashboard
- **Rate limits**: Free tier allows 200 emails/month, upgrade if needed

## Support

For EmailJS support, visit: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
