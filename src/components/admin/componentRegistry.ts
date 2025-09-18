import { config } from '@/lib/config';

export interface PropertyDefinition {
  type: 'string' | 'boolean' | 'number' | 'color';
  label: string;
  defaultValue: any;
}

export interface ComponentDefinition {
  name: string;
  props: Record<string, PropertyDefinition>;
}

export const componentRegistry: Record<string, ComponentDefinition> = {
  hero: {
    name: 'Hero',
    props: {
      title: { type: 'string', label: 'Title', defaultValue: `Welcome to ${config.app.name}` },
      subtitle: { type: 'string', label: 'Subtitle', defaultValue: 'Your personal headache relief companion.' },
    },
  },
  FeatureList: {
    name: 'FeatureList',
    props: {
      title: { type: 'string', label: 'Title', defaultValue: 'Features' },
    },
  },
  NewComponent: {
    name: 'NewComponent',
    props: {
      text: { type: 'string', label: 'Text', defaultValue: 'Some default text' },
    },
  },
  HeroSlider: {
    name: 'Hero Slider',
    props: {},
  },
  About: {
    name: 'About Section',
    props: {},
  },
  Services: {
    name: 'Services Section',
    props: {},
  },
  Team: {
    name: 'Team Section',
    props: {},
  },
  Badge: {
    name: 'Badge',
    props: {
      children: { type: 'string', label: 'Content', defaultValue: 'Badge Text' },
      variant: { type: 'string', label: 'Variant', defaultValue: 'default' },
    },
  },
  Button: {
    name: 'Button',
    props: {
      children: { type: 'string', label: 'Label', defaultValue: 'Button Text' },
      variant: { type: 'string', label: 'Variant', defaultValue: 'default' },
      size: { type: 'string', label: 'Size', defaultValue: 'default' },
    },
  },
  Card: {
    name: 'Card',
    props: {},
  },
  Dialog: {
    name: 'Dialog',
    props: {
      open: { type: 'boolean', label: 'Open', defaultValue: false },
      title: { type: 'string', label: 'Title', defaultValue: 'Dialog Title' },
      description: { type: 'string', label: 'Description', defaultValue: 'Dialog content goes here' },
    },
  },
  Progress: {
    name: 'Progress',
    props: {
      value: { type: 'number', label: 'Value', defaultValue: 50 },
    },
  },
  Tabs: {
    name: 'Tabs',
    props: {},
  },
  Toaster: {
    name: 'Toaster',
    props: {},
  },
  Box: {
    name: 'Box',
    props: {
      children: { type: 'string', label: 'Content', defaultValue: 'Box Content' },
      backgroundColor: { type: 'color', label: 'Background Color', defaultValue: '#ffffff' },
      padding: { type: 'number', label: 'Padding', defaultValue: 2 },
      margin: { type: 'number', label: 'Margin', defaultValue: 2 },
      width: { type: 'string', label: 'Width', defaultValue: '100%' },
      height: { type: 'string', label: 'Height', defaultValue: 'auto' },
    },
  },
  Container: {
    name: 'Container',
    props: {
      children: { type: 'string', label: 'Content', defaultValue: 'Container Content' },
      backgroundColor: { type: 'color', label: 'Background Color', defaultValue: '#ffffff' },
      maxWidth: { type: 'string', label: 'Max Width', defaultValue: 'lg' },
      disableGutters: { type: 'boolean', label: 'Disable Gutters', defaultValue: false },
    },
  },
  Grid: {
    name: 'Grid',
    props: {
      children: { type: 'string', label: 'Content', defaultValue: 'Grid Content' },
      backgroundColor: { type: 'color', label: 'Background Color', defaultValue: '#ffffff' },
      container: { type: 'boolean', label: 'Is Container', defaultValue: true },
      spacing: { type: 'number', label: 'Spacing', defaultValue: 2 },
      columns: { type: 'number', label: 'Columns', defaultValue: 12 },
    },
  },
};
