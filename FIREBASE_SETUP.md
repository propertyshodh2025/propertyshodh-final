# Firebase Phone Auth Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name (e.g., "propertyshodh-auth")
4. Enable Google Analytics (optional)
5. Choose your Google Analytics account

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Click on **Phone** provider
3. Click **Enable** toggle
4. Save the settings

## Step 3: Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Under **Your apps**, click **Web app** icon (`</>`)
3. Register your app with a nickname
4. Copy the configuration object

## Step 4: Update Firebase Configuration

Replace the placeholder config in `/src/lib/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Step 5: Configure Phone Authentication

### For Development (localhost)
1. In Firebase Console > Authentication > Settings
2. Under **Authorized domains**, add:
   - `localhost`
   - Your deployed domain (if any)

### For Production
1. Add your production domain to **Authorized domains**
2. Consider enabling **App Check** for additional security

## Step 6: Test Phone Authentication

1. Use a real phone number for testing
2. Firebase provides test phone numbers for development:
   - Go to Authentication > Sign-in method > Phone
   - Add test phone numbers with verification codes

### Test Numbers (for development):
- Phone: `+1 650-555-3434`, Code: `123456`
- Phone: `+91 98765 43210`, Code: `654321`

## Step 7: Billing and Quotas

### Firebase Phone Auth Pricing:
- **Free tier**: 10,000 verifications per month
- **Paid tier**: $0.006 per verification (₹0.50 approx)

### SMS Rates by Country:
- **India**: ~₹0.50 per SMS
- **US/Canada**: ~$0.01 per SMS
- **International**: Varies by country

## Step 8: Production Considerations

1. **Enable App Check** for anti-abuse protection
2. **Set up monitoring** for failed authentication attempts
3. **Configure rate limiting** to prevent spam
4. **Use custom domains** for better branding
5. **Implement proper error handling** for network issues

## Step 9: Integration with Supabase (Future)

For full Supabase integration, you'll need to:

1. Create a Supabase Edge Function to verify Firebase tokens
2. Generate Supabase JWT tokens after Firebase verification
3. Store user data in Supabase profiles table
4. Handle user session management

## Troubleshooting

### Common Issues:

1. **"auth/invalid-app-credential"**
   - Check your Firebase config values
   - Ensure project is properly created

2. **"auth/too-many-requests"**
   - You've exceeded rate limits
   - Wait or use test phone numbers

3. **"auth/invalid-phone-number"**
   - Check phone number format
   - Include country code

4. **reCAPTCHA issues**
   - Ensure your domain is authorized
   - Check for ad blockers

### Debug Mode:
Enable Firebase debug mode by setting:
```javascript
// In browser console
localStorage.setItem('debug', 'firebase*');
```

## Security Best Practices

1. **Never expose API keys** in client-side code (they're public by design)
2. **Use Firebase Security Rules** to protect data
3. **Implement proper rate limiting**
4. **Monitor authentication logs** for suspicious activity
5. **Use HTTPS** in production

## Cost Optimization

1. **Use test phone numbers** during development
2. **Implement client-side validation** before Firebase calls
3. **Add confirmation dialogs** to prevent accidental SMS sends
4. **Monitor usage** via Firebase Console

---

**Need Help?**
- [Firebase Phone Auth Documentation](https://firebase.google.com/docs/auth/web/phone-auth)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support/)