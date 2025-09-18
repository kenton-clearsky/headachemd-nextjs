import Link from 'next/link';
import { config } from '@/lib/config';

export default function PrivacyPolicy() {
  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <article className="prose lg:prose-xl mx-auto">
          <h2>Privacy Policy</h2>

          <h3>1. Introduction</h3>
          <p>Welcome to {config.app.name}. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.</p>

          <h3>2. Information We Collect</h3>
          <p>We may collect personal information such as your name, email address, and phone number when you contact us or use our services. We also collect non-personal information, such as your browser type and IP address.</p>

          <h3>3. How We Use Your Information</h3>
          <p>We use your information to provide and improve our services, to communicate with you, and to comply with legal obligations.</p>

          <h3>4. How We Share Your Information</h3>
          <p>We do not sell or rent your personal information to third parties. We may share your information with service providers, analytics partners, or law enforcement if required by law.</p>

          <h3>5. Your Choices</h3>
          <p>You may opt-out of receiving promotional emails from us by following the instructions in those emails. You may also request to access, correct, or delete your personal information.</p>

          <h3>6. Security</h3>
          <p>We take reasonable measures to protect your personal information from unauthorized access, use, or disclosure.</p>

          <h3>7. Children's Privacy</h3>
          <p>Our services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.</p>

          <h3>8. Changes to This Privacy Policy</h3>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

          <h3>9. Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us at:<br />
          <a href={`mailto:${config.app.infoEmail}`} className="text-green-600 hover:underline">{config.app.infoEmail}</a><br />
          713 426 3337</p>

          <div className="mt-8">
            <Link href="/" className="text-green-600 hover:underline">
              &larr; Back to Home
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
