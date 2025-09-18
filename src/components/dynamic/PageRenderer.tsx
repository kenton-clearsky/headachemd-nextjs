'use client';

import React from 'react';
import { PageSection } from '@/lib/firebase/page-editor';
import Hero from './Hero';
import FeatureList from './FeatureList';
import Testimonial from './Testimonial';
import HeroSlider from '@/components/landing/HeroSlider';
import About from '@/components/landing/About';
import Services from '@/components/landing/Services';
import Team from '@/components/landing/Team';
import Footer from '@/components/landing/Footer';
import BadgeWrapper from './ui/BadgeWrapper';
import ButtonWrapper from './ui/ButtonWrapper';
import CardWrapper from './ui/CardWrapper';
import DialogWrapper from './ui/DialogWrapper';
import ProgressWrapper from './ui/ProgressWrapper';
import TabsWrapper from './ui/TabsWrapper';
import ToasterWrapper from './ui/ToasterWrapper';
import BoxWrapper from './ui/BoxWrapper';
import ContainerWrapper from './ui/ContainerWrapper';
import GridWrapper from './ui/GridWrapper';
import { CircularProgress, Alert, Box } from '@mui/material';

// A mapping from component names (as stored in Firestore) to the actual React components.
const componentMap: { [key: string]: React.ComponentType<any> } = {
  Hero,
  FeatureList,
  Testimonial,
  HeroSlider,
  About,
  Services,
  Team,
  Footer,
  Badge: BadgeWrapper,
  Button: ButtonWrapper,
  Card: CardWrapper,
  Dialog: DialogWrapper,
  Progress: ProgressWrapper,
  Tabs: TabsWrapper,
  Toaster: ToasterWrapper,
  Box: BoxWrapper,
  Container: ContainerWrapper,
  Grid: GridWrapper,
};

interface PageRendererProps {
  sections: PageSection[];
}

const PageRenderer: React.FC<PageRendererProps> = ({ sections }) => {
  if (!sections || sections.length === 0) {
    return <Alert severity="info">This page has no content yet. Add sections in the editor.</Alert>;
  }

  return (
    <Box>
      {sections.map((section) => {
        if (!section.visible) {
          return null; // Don't render hidden sections
        }
        const Component = componentMap[section.component];
        if (!Component) {
          return <Alert severity="warning" key={section.id}>Unknown component type: {section.component}</Alert>;
        }
        return <Component key={section.id} {...section.props} backgroundColor={section.backgroundColor} />;
      })}
      
      {/* Always include Footer */}
      <Footer />
    </Box>
  );
};

export default PageRenderer;
