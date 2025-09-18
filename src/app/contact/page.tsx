import type { Metadata } from 'next';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | headacheMD',
  description:
    "Contact headacheMD in Houston. Ask questions about treatments, appointments, and care—our team is here to help.",
  openGraph: {
    title: 'Contact Us | headacheMD',
    description:
      'Contact headacheMD in Houston. Ask questions about treatments, appointments, and care—our team is here to help.',
    url: 'https://headachemd.org/contact',
    siteName: 'headacheMD',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
