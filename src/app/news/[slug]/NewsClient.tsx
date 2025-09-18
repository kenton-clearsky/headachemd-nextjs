"use client";

import React from 'react';
import { notFound } from 'next/navigation';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Link as MUILink,
} from '@mui/material';
import NextLink from 'next/link';

const ARTICLES = {
  '1': {
    title: 'The Blake Method',
    hero: undefined as string | undefined,
    paragraphs: [
      <>Dr. Blake is interested in determining the underlying cause of headaches. While it is important to assign a diagnosis according to the criteria of the International Classification of Headache Disorders, the trusted resource that Headache Medicine physicians use to standardize headache treatment, it is more important to identify the reason why a certain headache disorder exists. This process requires careful questioning and physical examination, and sometimes it is not possible in the first visit or even first few visits to identify the cause of headaches. The reason for headaches usually becomes clear, however, with time and a collaborative relationship between <MUILink component={NextLink} href="/#about">Dr. Blake and her associates</MUILink> and the patient to identify additional information about headache characteristics.</>,
      <>Once the diagnosis is reached, the treatment follows in a logical method. For patients whose headaches are determined to be due to occipital nerve compression, there are a number of treatment options available; sometimes one treatment alone is effective, and sometimes numerous treatments are needed. Monitoring the response to treatment with the use of logs and frequent follow-up visits, either in-person or via <MUILink component={NextLink} href="/contact">telemedicine</MUILink>, provides further useful information. Occasionally referral to other physicians is necessary, and sometimes the exploration for emotional factors that may play a role in all types of pain is critical. Dr. Blake is experienced in the role of emotional factors in headache, and she works closely with testing and treating psychologists in identifying and treating any such factors that may be related to pain.</>,
      <>When nerve decompression surgery is indicated, Dr. Blake works closely with the surgeon to ensure the best outcomes. Dr. Blake's role is to determine if surgery is indicated to treat headaches, and whether a patient is an appropriate surgical candidate, taking various factors into consideration. Following surgery, Dr. Blake will manage post-operative interventions such as physical therapy and medication management, while the surgeon will manage incision care. Most of the patients who undergo surgery are able to reduce or eliminate medications they may have been on for prevention of headaches. Instruction in posture and best working positions, as well as the management of return to full physical activity is a critical responsibility, as is the management of post-operative flares of pain. For more information, please see our <MUILink component={NextLink} href="/#news">other news articles</MUILink> or <MUILink component={NextLink} href="/contact">contact us</MUILink> to schedule a consultation.</>,
    ],
  },
  '2': {
    title: 'Emotional Awareness',
    hero: '/legacy/images/news-image2.jpg',
    paragraphs: [
      <>The role of emotional awareness in both the generation and treatment of headaches is critical to understand. Many emotions that we experience can manifest as pain. For instance, when a person feels "sick to my stomach" when a dreadful situation is occurring, this is an example of an emotion creating a physical sensation. It is well-accepted that the stomach and the gut are very sensitive to our emotional state. This is known as the "brain-gut" connection.</>,
      <>What is not as well-accepted, but gaining in support from the medical community, is that other parts of the body can also respond to emotions with the generation of pain or other physical sensations. This is known as a "psychophysiologic disorder." The reality is that there are many people who experience pain and other symptoms such as numbness, tingling, weakness, and other neurological symptoms that have no structural explanation that can be determined on examination or with testing. The good news is that these symptoms are just as real as those that have a structural explanation, and they are also treatable. Dr. Blake is an expert in the diagnosis of psychophysiologic disorders and works with other experts in Pain Psychology and Pain Reprocessing Therapy to help people to overcome these types of disorders. To learn more, please <MUILink component={NextLink} href="/contact">contact us</MUILink>.</>,
      <>A good resource to learn more about this is the free documentary "Pain Brain" that can be found <MUILink href="https://www.youtube.com/watch?v=I-y_i53-g1g" target="_blank" rel="noopener noreferrer">here</MUILink>. A leading physician in this area is Dr. Howard Schubiner, whose book "Unlearn Your Pain" has helped many people to become pain-free. The most exciting development in this area is Pain Reprocessing Therapy, which has been shown to be effective in 2/3 of patients with chronic back pain due to a psychophysiologic disorder.</>,
    ],
  },
  '3': {
    title: 'Medical Research',
    hero: '/legacy/images/news-image3.jpg',
    paragraphs: [
      <>Dr. Blake has published research on the diagnosis and treatment of headache disorders. She and Dr. Perry have published a book chapter on the treatment of "refractory" headaches. "Refractory" headaches are those that have not responded to a number of different treatments. They have also published on their experience with nerve decompression surgery for the treatment of headache due to nerve compression. Dr. Blake and Dr. Perry have found that many people who are thought to have "refractory" headaches actually have headaches due to nerve compression. When the nerve compression is treated, the headaches resolve. <MUILink component={NextLink} href="/#about">Dr. Blake</MUILink> is a leading expert in the diagnosis of headache due to nerve compression. A list of her publications can be found on her curriculum vitae, which is available on request.</>,
      <>Dr. Blake is also a co-author of a study on the use of a new medication for the treatment of migraine. She is a consultant to a number of pharmaceutical companies and is involved in clinical trials of new medications for the treatment of migraine and other headache disorders. If you are interested in participating in a clinical trial, please <MUILink component={NextLink} href="/contact">contact us</MUILink>.</>,
      <>A good resource for learning more about headache disorders is the website of the <MUILink href="https://americanmigrainefoundation.org/" target="_blank" rel="noopener noreferrer">American Migraine Foundation</MUILink>. The National Headache Foundation also has a wealth of information at <MUILink href="https://headaches.org/" target="_blank" rel="noopener noreferrer">headaches.org</MUILink>. Dr. Blake is a member of the American Headache Society and the National Headache Foundation. She is also a member of the American Academy of Neurology.</>,
    ],
  },
} as const;

export type NewsSlug = keyof typeof ARTICLES;

export default function NewsClient({ slug }: { slug: NewsSlug }) {
  const article = ARTICLES[slug];
  if (!article) return notFound();

  return (
    <main style={{ minHeight: '100vh', background: '#F4F8E9' }}>
      <Container sx={{ maxWidth: 'lg', py: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ border: '1px solid #dbe3c9' }}>
              <CardContent>
                {article.hero && (
                  <Box component="img" src={article.hero} alt={article.title} sx={{ width: '100%', mb: 2, borderRadius: 1 }} />
                )}
                <Typography component="h1" variant="h4" sx={{ mb: 2, color: '#3A4523', fontWeight: 700 }}>
                  {article.title}
                </Typography>
                <Stack spacing={2}>
                  {article.paragraphs.map((p, i) => (
                    <Typography key={i} variant="body1" sx={{ color: '#47542B' }}>
                      {p}
                    </Typography>
                  ))}
                </Stack>
                <Box component="ul" sx={{ mt: 2, color: '#47542B' }}>
                  <li>Pamela Blake, MD, FAHS</li>
                  <li>Diplomate, American Board of Psychiatry and Neurology</li>
                  <li>2711 Ferndale Street, Houston, TX</li>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Card sx={{ border: '1px solid #dbe3c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#3A4523', fontWeight: 700 }}>About the author</Typography>
                  <Typography variant="body2" sx={{ color: '#47542B' }}>
                    Dr. Pamela Blake has helped many people with chronic headaches lead a more fulfilling life. Let's discuss her process and publications in an open forum where you can ask questions and leave feedback.
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ border: '1px solid #dbe3c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#3A4523', fontWeight: 700 }}>Recent Posts</Typography>
                  <Stack spacing={1}>
                    <MUILink component={NextLink} href="/news/1" underline="hover">Introducing a new healing process</MUILink>
                    <MUILink component={NextLink} href="/news/2" underline="hover">About Amazing Technology</MUILink>
                    <MUILink component={NextLink} href="/news/3" underline="hover">Medical Research</MUILink>
                  </Stack>
                </CardContent>
              </Card>

              <Card sx={{ border: '1px solid #dbe3c9' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1, color: '#3A4523', fontWeight: 700 }}>Categories</Typography>
                  <Stack spacing={0.5}>
                    <Typography variant="body2" color="#47542B">Medical</Typography>
                    <Typography variant="body2" color="#47542B">Surgery</Typography>
                    <Typography variant="body2" color="#47542B">Health</Typography>
                    <Typography variant="body2" color="#47542B">License</Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </main>
  );
}
