/**
 * Cloudflare R2 Setup Test Script
 * 
 * Run this script to verify your Cloudflare R2 configuration
 * Usage: npm run test-r2-setup
 */

import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

const config = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
  bucketName: process.env.CLOUDFLARE_BUCKET_NAME || 'linear-attachments',
  accountUrl: process.env.CLOUDFLARE_ACCOUNT_URL,
};

async function testR2Setup() {
  console.log('🔍 Testing Cloudflare R2 Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('   Account ID:', config.accountId ? '✅ Set' : '❌ Missing');
  console.log('   Access Key ID:', config.accessKeyId ? '✅ Set' : '❌ Missing');
  console.log('   Secret Key:', config.secretAccessKey ? '✅ Set' : '❌ Missing');
  console.log('   Bucket Name:', config.bucketName);
  console.log('   Account URL:', config.accountUrl || `https://${config.accountId}.r2.cloudflarestorage.com`);
  console.log('');

  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey) {
    console.log('❌ Error: Required environment variables are missing!');
    console.log('Please set:');
    console.log('   CLOUDFLARE_ACCOUNT_ID');
    console.log('   CLOUDFLARE_ACCESS_KEY_ID');
    console.log('   CLOUDFLARE_SECRET_ACCESS_KEY');
    process.exit(1);
  }

  // Initialize R2 client
  console.log('🔧 Initializing R2 Client...');
  const r2Client = new S3Client({
    region: 'auto',
    endpoint: config.accountUrl || `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId!,
      secretAccessKey: config.secretAccessKey!,
    },
  });
  console.log('✅ R2 Client initialized\n');

  // Test 1: List bucket contents
  console.log('📂 Test 1: Listing bucket contents...');
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      MaxKeys: 5,
    });
    const response = await r2Client.send(listCommand);
    console.log('✅ Successfully connected to bucket:', config.bucketName);
    console.log(`   Found ${response.Contents?.length || 0} objects in bucket`);
    if (response.Contents && response.Contents.length > 0) {
      console.log('   Recent files:');
      response.Contents.slice(0, 3).forEach((obj) => {
        console.log(`     - ${obj.Key} (${formatBytes(obj.Size || 0)})`);
      });
    }
    console.log('');
  } catch (error: any) {
    console.log('❌ Failed to list bucket contents');
    console.log('   Error:', error.message);
    if (error.message.includes('Access Denied')) {
      console.log('   💡 Check your API token permissions');
    }
    if (error.message.includes('NoSuchBucket')) {
      console.log('   💡 Create the bucket in Cloudflare R2 dashboard');
    }
    process.exit(1);
  }

  // Test 2: Upload a test file
  console.log('⬆️  Test 2: Uploading test file...');
  const testFileName = `test-${Date.now()}.txt`;
  const testContent = 'Cloudflare R2 setup test file';
  try {
    const uploadCommand = new PutObjectCommand({
      Bucket: config.bucketName,
      Key: testFileName,
      Body: testContent,
      ContentType: 'text/plain',
    });
    await r2Client.send(uploadCommand);
    console.log('✅ Successfully uploaded test file:', testFileName);
    console.log('');
  } catch (error: any) {
    console.log('❌ Failed to upload test file');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // Test 3: Verify file exists
  console.log('🔍 Test 3: Verifying file exists...');
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: config.bucketName,
      Prefix: testFileName,
    });
    const response = await r2Client.send(listCommand);
    if (response.Contents && response.Contents.length > 0) {
      console.log('✅ Test file verified in bucket');
      console.log('');
    } else {
      console.log('❌ Test file not found in bucket');
      process.exit(1);
    }
  } catch (error: any) {
    console.log('❌ Failed to verify file');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // Test 4: Delete test file
  console.log('🗑️  Test 4: Deleting test file...');
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: testFileName,
    });
    await r2Client.send(deleteCommand);
    console.log('✅ Successfully deleted test file');
    console.log('');
  } catch (error: any) {
    console.log('❌ Failed to delete test file');
    console.log('   Error:', error.message);
    process.exit(1);
  }

  // All tests passed
  console.log('🎉 All tests passed! Your Cloudflare R2 setup is working correctly.');
  console.log('');
  console.log('Next steps:');
  console.log('   1. Start the backend server: npm run start:dev');
  console.log('   2. Test file upload via API');
  console.log('   3. Check files in R2 dashboard');
}

// Helper function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Run tests
testR2Setup().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
