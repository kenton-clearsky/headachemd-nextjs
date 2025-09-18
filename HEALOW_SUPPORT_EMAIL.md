# Email to Healow/eClinicalWorks Support

## Subject Line:
**Enable Backend Services (Client Credentials Flow) for HeadacheMD Integration - Client ID: p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M**

---

## Email Body:

Dear Healow/eClinicalWorks Support Team,

I hope this email finds you well. I am writing to request assistance with enabling Backend Services authentication for our HeadacheMD application integration with your FHIR API.

### **Current Integration Details:**
- **Application Name**: HeadacheMD
- **Client ID**: `p1VE0PKTI8nKrS4xnBL0zkNAn41xd5tv52RTxeV2X6M`
- **Client Secret**: `S8otD2UmerYQ4aCBpHZboByPLR-5cMKnKl4xlTqUHFYlGf3w-XVL0GZpRapWEkkV`
- **Practice Code**: `DJDIBD`
- **FHIR Base URL**: `https://fhir4.healow.com/fhir/r4/DJDIBD`
- **Production URL**: `https://headachemd-nextjs-sznczbmgha-uc.a.run.app`

### **Current Issue:**
We are experiencing authentication issues with the standard OAuth 2.0 authorization code flow. Specifically, we receive a `401 Unauthorized` error when including the `aud` parameter (`https://fhir4.healow.com/fhir/r4/DJDIBD`) in our OAuth requests. Our technical analysis indicates this is likely due to our client not being properly configured for the specific FHIR endpoint.

### **Requested Solution:**
To provide a better user experience and enable automated healthcare data synchronization, we would like to implement **SMART on FHIR Backend Services** using the OAuth 2.0 Client Credentials flow. This approach eliminates the need for user interaction popups and provides secure server-to-server authentication.

### **Specific Requests:**

1. **Enable Client Credentials Grant Type**
   - Please enable the `client_credentials` grant type for our client ID
   - This will allow us to use JWT-based authentication for backend services

2. **Register Public Key for JWT Validation**
   - We have generated an RSA 2048-bit key pair for JWT signing
   - Please register the attached public key for validating our JWT assertions
   - **Public Key** (also attached as `eclinicalworks-public.pem`):
   ```
   -----BEGIN PUBLIC KEY-----
   MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvasRH0UIPyaRsnBCcuec
   VdyZO7FtxQeuWQzHdJset+BrVTsKqH6XTEyCD6exZ+OwNPcsM+aOojFMJBTfnWid
   BU4n3tEY8OQbEyKz08o1NDx0By7AQXnpGqk8w8umJdZ/cHd2cEfIxcVjz2Vx6Jt1
   U62V++/1UsHm0ZOQJ4Mzf6fVefI0Sva4Snycb22+Cz2Lsb7oRHt4QkdF+x/NC3oS
   u6CPRJ0i4jmmqXwxNSsaBIP8VQHkEQYpsve3COYZKgxbNdnN+oOobaRYC4DHtXvX
   jDZYTGiL8UKVKTS0UAB5G3Bk4PAmMM4tToYKJ5uvffpnzGQqd2t2xnrtpjW19pn0
   fwIDAQAB
   -----END PUBLIC KEY-----
   ```

3. **Whitelist System-Level Scopes**
   - Please enable the following SMART on FHIR system scopes for our client:
     - `system/Patient.read`
     - `system/Observation.read`
     - `system/Condition.read`
     - `system/MedicationRequest.read`
     - `system/AllergyIntolerance.read`
     - `system/DiagnosticReport.read`

4. **Confirm Practice Access**
   - Please verify our client has proper access to practice code `DJDIBD`
   - Ensure our application is properly mapped for auditing purposes

### **Technical Implementation:**
We have already implemented the complete Backend Services authentication flow following the SMART on FHIR specification (https://build.fhir.org/ig/HL7/smart-app-launch/backend-services.html). Our implementation includes:

- ✅ JWT generation with RS256 signing
- ✅ Proper client assertion formatting
- ✅ Token endpoint integration (`https://oauthserver.eclinicalworks.com/oauth/oauth2/token`)
- ✅ FHIR API request handling
- ✅ Production HTTPS deployment

### **Current Test Results:**
- **JWT Generation**: ✅ Working correctly
- **Token Request**: ❌ Returns `401 "invalid_client"` (expected until backend services are enabled)
- **Implementation**: ✅ Complete and ready for production

### **Benefits of Backend Services:**
- **Enhanced Security**: Public/private key cryptography instead of shared secrets
- **Better User Experience**: No OAuth popups or user interaction required
- **Automated Integration**: Enables scheduled data synchronization
- **Industry Standard**: Follows SMART on FHIR Backend Services specification
- **Audit Compliance**: Proper application-level auditing

### **Urgency:**
This integration is critical for our healthcare application to provide real-time patient data access. We have completed all development work and are ready to go live as soon as backend services are enabled on your end.

### **Contact Information:**
- **Primary Contact**: [Your Name]
- **Email**: [Your Email]
- **Phone**: [Your Phone Number]
- **Application**: HeadacheMD
- **Environment**: Production

### **Attachments:**
1. `eclinicalworks-public.pem` - RSA Public Key for JWT validation
2. Technical implementation documentation (if needed)

### **Next Steps:**
Please let me know:
1. If you need any additional information or documentation
2. The expected timeline for enabling these features
3. Any additional requirements or compliance steps needed
4. A technical contact for implementation questions

Thank you for your time and assistance. We look forward to working with you to complete this integration and provide better healthcare services to our patients.

Best regards,

[Your Name]  
[Your Title]  
[Your Company]  
[Your Contact Information]

---

**P.S.**: We have comprehensive technical documentation and test results available if your technical team needs additional details about our implementation.

---

## **Attachments to Include:**
1. **File**: `keys/eclinicalworks-public.pem` (the public key file)
2. **Optional**: `EMR_INTEGRATION_FINAL_SUMMARY.md` (technical summary)

## **Follow-up Strategy:**
- **Day 1**: Send initial email
- **Day 3**: Follow up if no response
- **Day 5**: Escalate to account manager if available
- **Consider**: LinkedIn outreach to eClinicalWorks technical contacts
