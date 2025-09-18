'use client';

import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Menu, 
  MenuItem,
  Box,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import Image from 'next/image';
import { config } from '@/lib/config';

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
    handleMenuClose();
  };

  return (
    <>
      {/* Main Navigation - Sticky with scroll effects */}
      <AppBar 
        position="fixed" 
        sx={{ 
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
          color: '#2c3e50',
          boxShadow: isScrolled ? '0 4px 20px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.06)',
          borderBottom: '1px solid #e5e7eb',
          backdropFilter: isScrolled ? 'blur(10px)' : 'none',
          transition: 'all 0.3s ease',
          top: 0, // Remove the top bar offset
        }}
        elevation={0}
      >
        <Container>
          <Toolbar sx={{ justifyContent: 'space-between', py: isScrolled ? 1 : 1.25 }}>
            {/* Logo */}
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* Favicon */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& img': {
                      maxHeight: isScrolled ? '40px' : '50px',
                      width: 'auto',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <Image
                    src="/favicon.png"
                    alt="HeadacheMD Favicon"
                    width={isScrolled ? 40 : 50}
                    height={isScrolled ? 40 : 50}
                    style={{
                      objectFit: 'contain',
                    }}
                  />
                </Box>
                
                {/* Brand Text */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    '& img': {
                      maxHeight: isScrolled ? '60px' : '75px',
                      width: 'auto',
                      transition: 'all 0.3s ease',
                    }
                  }}
                >
                  <Typography
                    variant={isScrolled ? "h5" : "h4"}
                    sx={{
                      color: '#a5c422',
                      fontWeight: 700,
                      fontFamily: '"Roboto", sans-serif',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    headache
                  </Typography>
                  <Typography
                    variant={isScrolled ? "h5" : "h4"}
                    sx={{
                      color: '#d0d0d0',
                      fontWeight: 300,
                      fontFamily: '"Roboto", sans-serif',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    MD
                  </Typography>
                </Box>
              </Box>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Typography 
                  variant="body1" 
                  onClick={() => scrollToSection('home')}
                  sx={{ 
                    color: '#47542B',
                    '&:hover': { color: '#a5c422' },
                    transition: 'color 0.2s',
                    cursor: 'pointer',
                    fontWeight: 500,
                    minWidth: '70px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                  }}
                >
                  Home
                </Typography>
                <Typography 
                  variant="body1" 
                  onClick={() => scrollToSection('about')}
                  sx={{ 
                    color: '#47542B',
                    '&:hover': { color: '#a5c422' },
                    transition: 'color 0.2s',
                    cursor: 'pointer',
                    fontWeight: 500,
                    minWidth: '70px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                  }}
                >
                  About Us
                </Typography>
                <Typography 
                  variant="body1" 
                  onClick={() => scrollToSection('services')}
                  sx={{ 
                    color: '#47542B',
                    '&:hover': { color: '#a5c422' },
                    transition: 'color 0.2s',
                    cursor: 'pointer',
                    fontWeight: 500,
                    minWidth: '70px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                  }}
                >
                  Services
                </Typography>
                <Typography 
                  variant="body1" 
                  onClick={() => scrollToSection('team')}
                  sx={{ 
                    color: '#47542B',
                    '&:hover': { color: '#a5c422' },
                    transition: 'color 0.2s',
                    cursor: 'pointer',
                    fontWeight: 500,
                    minWidth: '70px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontSize: '0.875rem',
                  }}
                >
                  Our Team
                </Typography>
                

                <Button
                  variant="contained"
                  sx={{
                    ml: 2,
                    minWidth: '110px',
                    whiteSpace: 'nowrap',
                    backgroundColor: '#a5c422',
                    fontSize: '0.875rem',
                    '&:hover': {
                      backgroundColor: '#8fb01a',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(165, 196, 34, 0.3)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  href="/contact"
                >
                  Contact Us
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    ml: 2,
                    minWidth: '110px',
                    width: '110px',
                    whiteSpace: 'nowrap',
                    borderColor: '#a5c422',
                    color: '#47542B',
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: '#8fb01a',
                      backgroundColor: 'rgba(165,196,34,0.08)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  href="/login"
                >
                  Patient Login
                </Button>

                <Button
                  variant="outlined"
                  sx={{
                    ml: 1,
                    minWidth: '110px',
                    width: '110px',
                    whiteSpace: 'nowrap',
                    borderColor: '#47542B',
                    color: '#47542B',
                    fontSize: '0.875rem',
                    '&:hover': {
                      borderColor: '#2c3e50',
                      backgroundColor: 'rgba(44,62,80,0.08)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  href="/login?role=admin"
                >
                  Staff Login
                </Button>
              </Box>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleMenuOpen}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(165, 196, 34, 0.1)',
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
        
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: '#ffffff',
              color: '#2c3e50',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              mt: 1,
            }
          }}
        >
          <MenuItem onClick={() => scrollToSection('home')}>
            Home
          </MenuItem>
          <MenuItem onClick={() => scrollToSection('about')}>
            About Us
          </MenuItem>
          <MenuItem onClick={() => scrollToSection('services')}>
            Services
          </MenuItem>
          <MenuItem onClick={() => scrollToSection('team')}>
            Our Team
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Button variant="contained" fullWidth href="/contact" sx={{ backgroundColor: '#a5c422' }}>
              Contact Us
            </Button>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Button variant="outlined" fullWidth href="/login" sx={{ borderColor: '#a5c422', color: '#47542B' }}>
              Patient Login
            </Button>
          </MenuItem>
          <MenuItem onClick={handleMenuClose}>
            <Button variant="outlined" fullWidth href="/login?role=admin" sx={{ borderColor: '#47542B', color: '#47542B' }}>
              Staff Login
            </Button>
          </MenuItem>
        </Menu>
      </AppBar>

      {/* Spacer to prevent content from hiding behind fixed header */}
      <Box sx={{ 
        height: '75px', // Adjust based on top bar visibility
        transition: 'height 0.3s ease',
      }} />
    </>
  );
};

export default Header;
