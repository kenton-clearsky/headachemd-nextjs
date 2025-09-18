'use client';

import React from 'react';
import Slider from 'react-slick';
import { Box, Typography, Button, Container, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// Import slick-carousel styles
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// --- Enhanced Data for the slides ---
const sliderItems = [
  {
    pretitle: 'Revolutionary Headache Care',
    title: 'Expert Treatment for Chronic Headaches',
    subtitle: 'Board Certified Neurologists Specializing in Nerve Compression Headaches',
    buttonText: 'Schedule Consultation',
    buttonLink: '/admin',
    backgroundImage: '/images/slider/item-first.jpg',
    icon: <LocalHospitalIcon sx={{ fontSize: 60, color: '#a5c422' }} />,
  },
  {
    pretitle: 'Advanced Medical Technology',
    title: 'Innovative Nerve Block Treatments',
    subtitle: 'State-of-the-art procedures for lasting headache relief',
    buttonText: 'Learn About Treatments',
    buttonLink: '/admin',
    backgroundImage: '/images/slider/item-second.jpg',
    icon: <LocalHospitalIcon sx={{ fontSize: 60, color: '#a5c422' }} />,
  },
  {
    pretitle: 'Dr. Pamela Blake',
    title: 'Leading Headache Medicine Expert',
    subtitle: 'Board Certified Neurologist and Headache Medicine Specialist',
    buttonText: 'Meet Our Team',
    buttonLink: '/admin',
    backgroundImage: '/images/slider/item-third.jpg',
    icon: <LocalHospitalIcon sx={{ fontSize: 60, color: '#a5c422' }} />,
  },
];

// --- Enhanced Styled components ---
const SliderContainer = styled(Box)(({ theme }) => ({
  '& .slick-dots': {
    bottom: 40,
    'li button:before': {
      color: '#a5c422',
      opacity: 0.3,
      fontSize: '12px',
    },
    'li.slick-active button:before': {
      opacity: 1,
      color: '#a5c422',
    },
  },
  '& .slick-list': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  '& .slick-prev, & .slick-next': {
    color: '#a5c422',
    '&:before': {
      color: '#a5c422',
    },
  },
}));

const Caption = styled(Container)(({ theme }) => ({
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '800px',
  '& .pretitle': {
    textTransform: 'uppercase',
    fontWeight: 300,
    margin: '0 auto',
    color: '#a5c422',
    letterSpacing: '2px',
    fontSize: '1rem',
    [theme.breakpoints.down('md')]: {
      fontSize: '0.9rem',
    },
  },
  '& .title': {
    fontSize: '4rem',
    fontWeight: 700,
    margin: theme.spacing(2, 'auto'),
    color: '#ffffff',
    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
    lineHeight: 1.1,
    [theme.breakpoints.down('lg')]: {
      fontSize: '3rem',
    },
    [theme.breakpoints.down('md')]: {
      fontSize: '2.5rem',
    },
    [theme.breakpoints.down('sm')]: {
      fontSize: '2rem',
    },
  },
  '& .subtitle': {
    fontWeight: 400,
    fontSize: '1.3rem',
    color: '#f0f0f0',
    marginBottom: theme.spacing(4),
    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
    [theme.breakpoints.down('md')]: {
      fontSize: '1.1rem',
    },
  },
  '& .cta-button': {
    backgroundColor: '#a5c422',
    color: '#ffffff',
    padding: theme.spacing(1.5, 4),
    fontSize: '1.1rem',
    fontWeight: 600,
    borderRadius: '50px',
    textTransform: 'none',
    boxShadow: '0 4px 20px rgba(165, 196, 34, 0.3)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#8fb01a',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 25px rgba(165, 196, 34, 0.4)',
    },
  },
}));

// --- Enhanced Slide Sub-component ---
interface SlideItemProps {
  item: typeof sliderItems[0];
}

const SlideItem: React.FC<SlideItemProps> = ({ item }) => {
  const { backgroundImage, pretitle, title, subtitle, buttonText, buttonLink, icon } = item;
  
  return (
    <Box
      sx={{
        display: 'flex !important',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        minHeight: '600px',
        color: 'common.white',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Icon */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          opacity: 0.1,
          transform: 'rotate(15deg)',
          display: { xs: 'none', md: 'block' },
        }}
      >
        {icon}
      </Box>
      
      <Caption>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography className="pretitle" variant="h6">
            {pretitle}
          </Typography>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography className="title" component="h1">
            {title}
          </Typography>
        </motion.div>
        
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Typography className="subtitle" variant="h3">
              {subtitle}
            </Typography>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center' }}>
            <Button 
              className="cta-button"
              variant="contained" 
              href={buttonLink} 
              size="large"
              endIcon={<ArrowForwardIcon />}
            >
              {buttonText}
            </Button>
            
            {/* Login Buttons */}
            <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button 
                variant="outlined" 
                href="/login" 
                size="medium"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: '#a5c422',
                    backgroundColor: 'rgba(165, 196, 34, 0.1)'
                  }
                }}
              >
                Patient Login
              </Button>
              <Button 
                variant="outlined" 
                href="/login?role=admin" 
                size="medium"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: '#a5c422',
                    backgroundColor: 'rgba(165, 196, 34, 0.1)'
                  }
                }}
              >
                Staff Login
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Caption>
    </Box>
  );
};

// --- Main HeroSlider Component ---
interface HeroSliderProps {
  backgroundColor?: string;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ backgroundColor }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    fade: true,
    pauseOnHover: true,
    arrows: true,
  };

  return (
    <SliderContainer sx={{ backgroundColor }} component="section" id="home">
      <Slider {...settings}>
        {sliderItems.map((item, index) => (
          <div key={index}>
            <SlideItem item={item} />
          </div>
        ))}
      </Slider>
    </SliderContainer>
  );
};

export default HeroSlider;
