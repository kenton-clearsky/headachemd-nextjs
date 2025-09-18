import type { Metadata } from 'next';
import AppointmentClient from './AppointmentClient';

export const metadata: Metadata = {
  title: 'Request an Appointment | headacheMD',
  description:
    'Request an appointment with headacheMD in Houston. Our team will contact you promptly to confirm details and answer questions.',
  openGraph: {
    title: 'Request an Appointment | headacheMD',
    description:
      'Request an appointment with headacheMD in Houston. Our team will contact you promptly to confirm details and answer questions.',
    url: 'https://headachemd.org/appointment',
    siteName: 'headacheMD',
    type: 'website',
  },
};

export default function AppointmentPage() {
  return <AppointmentClient />;
}
