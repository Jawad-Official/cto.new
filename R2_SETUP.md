# Cloudflare R2 Storage Setup Guide

This guide explains how to set up Cloudflare R2 for file storage in the Linear clone application.

## What is Cloudflare R2?

Cloudflare R2 is an S3-compatible object storage service that offers:
- Zero egress fees (no charge for downloading files)
- S3-compatible API (works with AWS SDK)
- Global edge network
- Competitive pricing for storage
- High durability and availability

## Prerequisites

- A Cloudflare account (free tier available)
- Basic understanding of object storage concepts

## Step 1: Create a Cloudflare Account

1. Visit [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Create a free account
3. Verify your email address

## Step 2: Enable R2 Storage

1. Log in to Cloudflare Dashboard
2. Navigate to **R2** in the left sidebar
3. Click **"Get started"** or **"Purchase R2"**
4. Accept the terms of service
5. R2 is now enabled on your account

## Step 3: Create an R2 Bucket

1. In the R2 dashboard, click **"Create bucket"**
2. Enter a bucket name (e.g., `linear-attachments`)
   - Bucket names must be unique across all R2 users
   - Use lowercase letters, numbers, and hyphens
3. Click **"Create bucket"**

## Step 4: Get Your Account ID

1. In the Cloudflare Dashboard, click on your account name in the top-right
2. Select **"My Profile"**
3. Scroll down to the **API** section
4. Copy your **Account ID** (32-character hex string)
5. Save this for your environment variables

## Step 5: Create R2 API Token

1. Navigate to **R2** → **Manage R2 API Tokens**
2. Click **"Create API Token"**
3. Configure the token:
   - **TTL**: Leave as default or set as needed
   - **Permissions**: Select **"Admin Read & Write"** for full access
   - **Resources**: 
     - Select **"Include"** → **"Specific account"** → Your account
     - Select **"Include"** → **"Specific bucket"** → Your bucket name
4. Click **"Create API Token"**
5. Copy the **Access Key ID** and **Secret Access Key**
6. Save these securely (you won't see the secret again!)

## Step 6: Configure Environment Variables

### For Local Development

Add these to your `backend/.env` file:

```env
# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID=your-32-character-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_BUCKET_NAME=linear-attachments
CLOUDFLARE_ACCOUNT_URL=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_PUBLIC_URL=  # Leave empty unless using custom domain
```

### For Docker Compose

Add these to your root `.env` file:

```env
CLOUDFLARE_ACCOUNT_ID=your-32-character-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_BUCKET_NAME=linear-attachments
CLOUDFLARE_ACCOUNT_URL=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_PUBLIC_URL=
```

### For Production (Railway/Render)

Add these environment variables in your deployment platform:

1. Go to your project settings
2. Add environment variables:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_ACCESS_KEY_ID`
   - `CLOUDFLARE_SECRET_ACCESS_KEY`
   - `CLOUDFLARE_BUCKET_NAME`
   - `CLOUDFLARE_ACCOUNT_URL`
   - `CLOUDFLARE_PUBLIC_URL` (optional)

## Step 7: (Optional) Set Up Custom Domain

Using a custom domain allows you to:
- Serve files through your own domain
- Use HTTPS with your own SSL certificate
- Improve branding and trust

### Setting Up Custom Domain

1. In R2 dashboard, select your bucket
2. Click **"Settings"** → **"Custom Domains"**
3. Click **"Connect Domain"**
4. Enter your domain (e.g., `files.yourdomain.com`)
5. Click **"Continue"**
6. Configure DNS:
   - Add a CNAME record: `files` → `[your-bucket].pub.r2.dev`
   - Or add a CNAME record for your custom domain to the provided target
7. Wait for DNS propagation (usually takes a few minutes)
8. Update your environment variable:
   ```env
   CLOUDFLARE_PUBLIC_URL=https://files.yourdomain.com
   ```

### Without Custom Domain

If you don't set up a custom domain, files will be served from R2's public URL:
- Format: `https://pub-[account-id].r2.dev/[bucket-name]/[file-path]`
- The application will return the file key instead of a full URL
- Files can be accessed via signed URLs from the backend API

## Step 8: Test the Setup

1. Start your backend server:
   ```bash
   cd backend
   npm run start:dev
   ```

2. Test file upload via API:
   ```bash
   curl -X POST http://localhost:4000/storage/upload \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -F "file=@test-file.jpg"
   ```

3. Check your R2 bucket in Cloudflare Dashboard to verify the file was uploaded

## Pricing

As of 2024, Cloudflare R2 pricing:

### Free Tier (First 10GB/month)
- Storage: 10 GB/month
- Class A Operations (Write): 1,000,000 requests/month
- Class B Operations (Read): 10,000,000 requests/month
- **Egress: Unlimited free egress!**

### Paid Tier (After Free Tier)
- Storage: $0.015/GB/month
- Class A Operations: $4.50/million requests
- Class B Operations: $0.36/million requests
- **Egress: $0 (Zero egress fees)**

This is significantly cheaper than AWS S3 for applications with high download traffic!

## Security Best Practices

1. **Never commit API keys to version control**
   - Always use environment variables
   - Add `.env` files to `.gitignore`

2. **Use appropriate permissions**
   - Don't use admin tokens for production
   - Create tokens with minimum required permissions

3. **Rotate credentials regularly**
   - Update tokens every 90 days
   - Use different tokens for dev/staging/production

4. **Enable bucket encryption** (R2 automatically encrypts at rest)
5. **Use signed URLs for sensitive files**
6. **Set up access logging** if needed

## Troubleshooting

### Error: "Access Denied"

- Verify your API token has the correct permissions
- Check that the bucket name matches exactly
- Ensure your account ID is correct

### Error: "Bucket not found"

- Verify the bucket exists in your R2 dashboard
- Check spelling of bucket name in environment variables
- Ensure the token has access to this specific bucket

### Error: "Invalid endpoint"

- Verify your account ID is correct (32 hex characters)
- Check the account URL format: `https://<account-id>.r2.cloudflarestorage.com`
- Ensure no typos in the URL

### File uploads fail

- Check file size (max 10MB by default)
- Verify file type is supported
- Check backend logs for detailed error messages

### Public URLs not accessible

- If using custom domain, verify DNS is configured correctly
- Wait for DNS propagation
- Check that custom domain is verified in Cloudflare dashboard
- If not using custom domain, use signed URLs instead

## Migration from AWS S3

If you're migrating from AWS S3:

1. **No code changes needed** - R2 is S3-compatible!
2. **Update environment variables** - Replace AWS credentials with Cloudflare R2 credentials
3. **Migrate existing files**:
   ```bash
   # Use AWS CLI or rclone to copy files
   aws s3 sync s3://your-s3-bucket r2://your-r2-bucket \
     --endpoint-url https://<account-id>.r2.cloudflarestorage.com \
     --access-key-id <r2-access-key> \
     --secret-access-key <r2-secret-key>
   ```

4. **Update database references** - Run migration to update attachment URLs if needed

## Additional Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Documentation](https://developers.cloudflare.com/api/resources/r2/subresources/)
- [Pricing](https://developers.cloudflare.com/r2/platform/pricing/)
- [AWS S3 Compatibility](https://developers.cloudflare.com/r2/api/s3-compatibility/)

## Support

If you encounter issues:

1. Check Cloudflare status page: https://www.cloudflarestatus.com/
2. Review Cloudflare R2 documentation
3. Check application logs for detailed error messages
4. Open an issue on GitHub

## Next Steps

After setting up R2:

1. Configure file upload limits in `storage.module.ts`
2. Set up file type restrictions if needed
3. Configure CDN caching if using custom domain
4. Set up monitoring and alerts for R2 usage
5. Implement file cleanup policies for old attachments
