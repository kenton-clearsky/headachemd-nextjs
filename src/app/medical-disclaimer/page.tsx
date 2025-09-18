import type { Metadata } from 'next';
import MedicalDisclaimerClient from './MedicalDisclaimerClient';

export const metadata: Metadata = {
  title: 'Medical Disclaimer | headacheMD',
  description:
    'Important medical disclaimer for headacheMD. Educational information only—not a substitute for professional medical advice, diagnosis, or treatment.',
  openGraph: {
    title: 'Medical Disclaimer | headacheMD',
    description:
      'Important medical disclaimer for headacheMD. Educational information only—not a substitute for professional medical advice, diagnosis, or treatment.',
    url: 'https://headachemd.org/medical-disclaimer',
    siteName: 'headacheMD',
    type: 'website',
  },
};

export default function MedicalDisclaimerPage() {
  return <MedicalDisclaimerClient />;
}
