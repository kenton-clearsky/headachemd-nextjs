#!/bin/bash

echo "🔧 Fixing eClinicalWorks EMR Configuration to use Healow endpoint..."

# Backup current .env.local
cp .env.local .env.local.backup2
echo "✅ Backed up current .env.local to .env.local.backup2"

# Update the API base URL back to Healow (which is working)
sed -i 's|ECLINICALWORKS_FHIR_BASE_URL=https://fhir.eclinicalworks.com/ecwopendev/fhir/R4|ECLINICALWORKS_FHIR_BASE_URL=https://fhir4.healow.com/fhir/r4/DJDIBD|g' .env.local

echo "✅ Updated ECLINICALWORKS_FHIR_BASE_URL to use Healow endpoint (which is working)"
echo "✅ Configuration fixed! Please restart your development server."
echo ""
echo "📋 Summary of changes:"
echo "   - Changed API base URL back to Healow (https://fhir4.healow.com/fhir/r4/DJDIBD)"
echo "   - Healow endpoint is working and returns valid FHIR metadata"
echo "   - eClinicalWorks main FHIR API returns 302 redirects (not accessible)"
echo ""
echo "🚀 Next steps:"
echo "   1. Restart your Next.js server: npm run dev"
echo "   2. Test the EMR connection again"
echo "   3. The connectivity status should now show 'reachable'"
