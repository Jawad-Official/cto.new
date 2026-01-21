# Storage Migration Guide: AWS S3 to Cloudflare R2

This guide helps you migrate from AWS S3 to Cloudflare R2 storage.

## Quick Summary

**What Changed:**
- All AWS S3 references removed from the codebase
- Cloudflare R2 implemented for file storage
- Zero egress fees (major cost savings)
- Same S3-compatible API (minimal code changes)

**Why Migrate?**
- **87% cost reduction** for applications with high download traffic
- **Zero egress fees** - no charge for file downloads
- **Global edge network** - faster file delivery
- **S3-compatible** - works with existing S3 SDK

## Prerequisites

Before starting, ensure you have:
- ✅ Cloudflare account (free at https://dash.cloudflare.com)
- ✅ R2 enabled in your Cloudflare dashboard
- ✅ R2 bucket created
- ✅ R2 API token generated

**Missing any of these?** Follow the complete setup guide: [R2_SETUP.md](./R2_SETUP.md)

## Migration Steps

### Step 1: Get Cloudflare R2 Credentials

1. **Account ID**:
   - Go to Cloudflare Dashboard → Profile
   - Copy your 32-character Account ID

2. **Create R2 API Token**:
   - Navigate to R2 → Manage R2 API Tokens
   - Click "Create API Token"
   - Permissions: Admin Read & Write
   - Resources: Include → Your account → Your bucket
   - Save Access Key ID and Secret Access Key

3. **Note Account URL**:
   - Format: `https://<account-id>.r2.cloudflarestorage.com`
   - Example: `https://abc123def456.r2.cloudflarestorage.com`

### Step 2: Update Environment Variables

#### Development (.env)

**Remove these AWS variables:**
```bash
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

**Add these Cloudflare variables:**
```bash
CLOUDFLARE_ACCOUNT_ID=your-32-char-account-id
CLOUDFLARE_ACCESS_KEY_ID=your-r2-access-key-id
CLOUDFLARE_SECRET_ACCESS_KEY=your-r2-secret-access-key
CLOUDFLARE_BUCKET_NAME=linear-attachments
CLOUDFLARE_ACCOUNT_URL=https://<account-id>.r2.cloudflarestorage.com
CLOUDFLARE_PUBLIC_URL=  # Leave empty for now
```

#### Production (Railway/Render/Vercel)

1. Go to your project's environment variables
2. Remove all AWS_ variables
3. Add all CLOUDFLARE_ variables above
4. Redeploy application

#### Docker Compose

Update root `.env` file with same variables as above.

### Step 3: Test Configuration

Run the R2 setup test:

```bash
cd backend
npm run test:r2
```

This will:
- ✅ Verify environment variables
- ✅ Test R2 connection
- ✅ Test upload/delete operations
- ✅ Confirm setup is working

**All tests passed?** Great! Your setup is ready.

**Tests failed?** Check:
- Environment variables are set correctly
- R2 bucket exists in Cloudflare dashboard
- API token has correct permissions
- Account ID and URL are correct

### Step 4: Migrate Existing Data (Optional)

If you have existing files in AWS S3 that you want to keep:

#### Option A: Use AWS CLI

```bash
# Install AWS CLI if not already installed
# npm install -g aws-cli

# Configure for R2
aws configure set default.s3.max_concurrent_requests 20
aws configure set default.s3.multipart_threshold 64MB
aws configure set default.s3.multipart_chunksize 16MB

# Sync files from S3 to R2
aws s3 sync s3://your-aws-bucket r2://your-r2-bucket \
  --endpoint-url https://<account-id>.r2.cloudflarestorage.com \
  --access-key-id <r2-access-key-id> \
  --secret-access-key <r2-secret-access-key>
```

#### Option B: Use rclone

```bash
# Install rclone
# See: https://rclone.org/install/

# Configure rclone for R2
rclone config create r2-storage type s3
# Provide your R2 credentials

# Copy files
rclone copy s3:your-aws-bucket r2:your-r2-bucket
```

#### Option C: Start Fresh (Recommended for New Projects)

If you don't have critical data in S3, it's easier to start fresh:
- New uploads will go to R2
- Old S3 files will still be accessible if needed
- Gradually migrate as users upload new files

### Step 5: Update Database References (If Needed)

If your database stores full S3 URLs (e.g., `https://s3.amazonaws.com/bucket/file.jpg`), update them:

```sql
-- Update to use R2 file keys instead of full URLs
-- The app will use signed URLs or custom domain
UPDATE "IssueAttachment" 
SET "url" = SPLIT_PART("url", '/', -1)
WHERE "url" LIKE 'https://s3.amazonaws.com/%';
```

Or run a migration script:
```bash
cd backend
# Create migration to update URLs
npm run prisma:migrate:dev --name update_attachment_urls_to_r2
```

### Step 6: Restart Application

```bash
# Development
cd backend
npm run start:dev

# Docker
docker-compose down
docker-compose up -d

# Production
# Redeploy via Railway/Render/Vercel dashboard
```

### Step 7: Verify Everything Works

1. **Test file upload**:
   ```bash
   curl -X POST http://localhost:4000/storage/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.jpg"
   ```

2. **Test issue attachment**:
   ```bash
   curl -X POST http://localhost:4000/issues/ISSUE_ID/attachments \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.jpg"
   ```

3. **Check R2 dashboard**:
   - Navigate to R2 → Your bucket
   - Verify files are being uploaded
   - Check file organization (`issues/{issueId}/`)

4. **Test file access**:
   - Get signed URL: `GET /storage/signed-url?key=...`
   - Open URL in browser
   - Verify file loads correctly

## Cost Comparison

### Example: Application with 1TB/month downloads

| Cost Component | AWS S3 | Cloudflare R2 | Savings |
|---------------|----------|----------------|---------|
| Storage (1TB) | $23.00 | $15.00 | $8.00 |
| Egress (1TB) | $90.00 | **$0.00** | **$90.00** |
| Operations | ~$5.00 | ~$4.50 | $0.50 |
| **Total** | **$118.00** | **$19.50** | **$98.50** |
| **% Saved** | - | - | **83%** |

### Additional Benefits

- **Free Tier**: 10GB storage, 1M write ops, 10M read ops/month
- **No Minimum**: Pay only for what you use
- **Global Edge**: Files cached at 300+ locations worldwide
- **No Egress Limits**: No restrictions on data transfer

## Troubleshooting

### Issue: "Access Denied"

**Cause**: API token doesn't have correct permissions

**Solution**:
1. Go to Cloudflare Dashboard → R2 → API Tokens
2. Check token has "Admin Read & Write" permissions
3. Verify token includes your specific bucket
4. Regenerate token if needed

### Issue: "Bucket not found"

**Cause**: Bucket doesn't exist or wrong bucket name

**Solution**:
1. Check R2 dashboard for bucket
2. Verify `CLOUDFLARE_BUCKET_NAME` matches exactly
3. Create bucket if it doesn't exist

### Issue: Files not accessible

**Cause**: Not using signed URLs or custom domain

**Solution**:
- **Option 1**: Use signed URLs: `GET /storage/signed-url?key=...`
- **Option 2**: Set up custom domain (see R2_SETUP.md)
- **Option 3**: Return file keys and use proxy endpoint

### Issue: Upload failures

**Cause**: File size exceeds limit or wrong file type

**Solution**:
1. Check file is under 10MB (default limit)
2. Adjust limit in `storage.module.ts` if needed
3. Verify file type is supported
4. Check backend logs for detailed errors

### Issue: Old S3 URLs broken

**Cause**: Database still has full S3 URLs

**Solution**:
1. Update database references (Step 5)
2. Or implement URL proxy endpoint
3. Or keep S3 bucket alive for old files

## Rollback Plan

If you need to rollback to AWS S3:

1. **Update environment variables**:
   - Revert to AWS credentials
   - Update `CLOUDFLARE_ACCOUNT_URL` to S3 endpoint

2. **Keep R2 data**:
   - Don't delete R2 bucket
   - Can migrate back later if needed

3. **Monitor costs**:
   - Compare AWS vs R2 costs
   - Make decision after 1-2 months

## Support

### Documentation
- **R2 Setup**: [R2_SETUP.md](./R2_SETUP.md)
- **Migration Summary**: [MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)
- **Cloudflare Docs**: https://developers.cloudflare.com/r2/

### Getting Help
- Cloudflare Community: https://community.cloudflare.com/
- Stack Overflow: Tag questions with `cloudflare-r2`
- GitHub Issues: Open issue in this repo

## Success Checklist

- ✅ Cloudflare R2 account created
- ✅ R2 bucket created
- ✅ API token generated
- ✅ Environment variables updated
- ✅ Configuration tested (`npm run test:r2`)
- ✅ Existing data migrated (if needed)
- ✅ Database references updated (if needed)
- ✅ Application restarted
- ✅ File uploads working
- ✅ File downloads working
- ✅ Cost savings verified

---

**Congratulations!** 🎉

You've successfully migrated to Cloudflare R2 storage. Enjoy the cost savings and better performance!

Next steps:
- Monitor usage in Cloudflare dashboard
- Set up custom domain for better branding
- Configure CDN caching if needed
- Implement file cleanup policies
