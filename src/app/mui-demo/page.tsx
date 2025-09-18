import MuiDemo from '@/components/demo/MuiDemo';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MUI Demo - HeadacheMD',
  description: 'Material-UI components demonstration for HeadacheMD medical platform',
};

export default function MuiDemoPage() {
  return <MuiDemo />;
}
