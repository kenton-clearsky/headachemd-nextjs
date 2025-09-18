import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import NewsClient, { type NewsSlug } from './NewsClient';

const titles: Record<NewsSlug, string> = {
  '1': 'The Blake Method',
  '2': 'Emotional Awareness',
  '3': 'Medical Research',
};

const descriptions: Record<NewsSlug, string> = {
  '1': 'Understanding causes of headaches and a logical, personalized approach to treatment at headacheMD.',
  '2': 'How emotions can manifest as pain and the role of psychophysiologic disorders and Pain Reprocessing Therapy.',
  '3': 'Research and clinical experience including nerve decompression surgery and ongoing clinical trials.',
};

const images: Partial<Record<NewsSlug, string>> = {
  '2': '/legacy/images/news-image2.jpg',
  '3': '/legacy/images/news-image3.jpg',
};

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const typedSlug = slug as NewsSlug;
  if (!(typedSlug in titles)) return {};
  const title = `${titles[typedSlug]} | headacheMD`;
  const description = descriptions[typedSlug];
  const url = `https://headachemd.org/news/${typedSlug}`;
  const ogImage = images[typedSlug];
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'headacheMD',
      type: 'article',
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: Params) {
  const { slug } = await params;
  const typedSlug = slug as NewsSlug;
  if (!(typedSlug in titles)) return notFound();
  return <NewsClient slug={typedSlug} />;
}
