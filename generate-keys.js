#!/usr/bin/env node

/**
 * Generate Public/Private Key Pair for eClinicalWorks Backend Services
 * This script generates the RSA key pair needed for JWT authentication
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating RSA Key Pair for eClinicalWorks Backend Services');
console.log('==============================================================\n');

// Generate RSA key pair
console.log('📋 Generating 2048-bit RSA key pair...');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('✅ Key pair generated successfully!\n');

// Create keys directory if it doesn't exist
const keysDir = path.join(process.cwd(), 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
  console.log('📁 Created keys directory');
}

// Save private key
const privateKeyPath = path.join(keysDir, 'eclinicalworks-private.pem');
fs.writeFileSync(privateKeyPath, privateKey);
console.log('💾 Private key saved to:', privateKeyPath);

// Save public key
const publicKeyPath = path.join(keysDir, 'eclinicalworks-public.pem');
fs.writeFileSync(publicKeyPath, publicKey);
console.log('💾 Public key saved to:', publicKeyPath);

// Generate X.509 certificate (alternative format)
console.log('\n📋 Generating X.509 certificate...');

// Create a self-signed certificate
const cert = crypto.createSign('RSA-SHA256');
const certData = {
  subject: { CN: 'HeadacheMD' },
  issuer: { CN: 'HeadacheMD' },
  serialNumber: '01',
  validFrom: new Date(),
  validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
};

// For simplicity, we'll just save the public key in PEM format
// In production, you might want to create a proper X.509 certificate
const certPath = path.join(keysDir, 'eclinicalworks-cert.pem');
fs.writeFileSync(certPath, publicKey);
console.log('💾 Certificate (public key) saved to:', certPath);

// Generate environment variable format
console.log('\n📋 Environment Variable Format:');
console.log('===============================');

const privateKeyEnv = privateKey.replace(/\n/g, '\\n');
console.log('Add this to your .env.development file:');
console.log('');
console.log('# eClinicalWorks Backend Services Private Key');
console.log(`ECLINICALWORKS_PRIVATE_KEY="${privateKeyEnv}"`);

// Display public key for registration
console.log('\n📋 Public Key for eClinicalWorks Registration:');
console.log('==============================================');
console.log('Send this public key to eClinicalWorks support for registration:');
console.log('');
console.log(publicKey);

// Create a summary file
const summaryPath = path.join(keysDir, 'KEY_SETUP_INSTRUCTIONS.md');
const summaryContent = `# eClinicalWorks Backend Services Key Setup

## Generated Files

- **Private Key**: \`eclinicalworks-private.pem\` (Keep this SECRET!)
- **Public Key**: \`eclinicalworks-public.pem\` (Send to eClinicalWorks)
- **Certificate**: \`eclinicalworks-cert.pem\` (Alternative format)

## Environment Variable Setup

Add this to your \`.env.development\` file:

\`\`\`bash
# eClinicalWorks Backend Services Private Key
ECLINICALWORKS_PRIVATE_KEY="${privateKeyEnv}"
\`\`\`

## eClinicalWorks Registration

Send the following information to eClinicalWorks support:

**Subject**: Enable Backend Services for Client ID

**Client ID**: p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M

**Request**:
1. Enable client_credentials grant type for this client
2. Register the attached public key for JWT validation
3. Whitelist for system-level scopes:
   - system/Patient.read
   - system/Observation.read
   - system/Condition.read
   - system/MedicationRequest.read
   - system/AllergyIntolerance.read
4. Confirm access to practice code DJDIBD

**Public Key**:
\`\`\`
${publicKey}
\`\`\`

## Security Notes

- ⚠️  **NEVER** commit the private key to version control
- ⚠️  **NEVER** share the private key with anyone
- ✅ Only share the public key with eClinicalWorks
- ✅ Store the private key securely in environment variables
- ✅ Use different key pairs for different environments (dev/staging/prod)

## Testing

Once eClinicalWorks confirms the registration:

1. Add the private key to your environment variables
2. Run the backend services test: \`npm run test:backend-auth\`
3. Check the logs for successful token exchange
`;

fs.writeFileSync(summaryPath, summaryContent);
console.log('\n💾 Setup instructions saved to:', summaryPath);

console.log('\n🎉 Key Generation Complete!');
console.log('===========================');
console.log('');
console.log('Next Steps:');
console.log('1. 📧 Send the public key to eClinicalWorks support (see instructions above)');
console.log('2. 🔐 Add the private key to your .env.development file');
console.log('3. 🧪 Test the backend services once eClinicalWorks confirms registration');
console.log('4. ⚠️  Add keys/ directory to .gitignore to prevent accidental commits');
console.log('');
console.log('⚠️  IMPORTANT: Keep your private key secure and never share it!');
