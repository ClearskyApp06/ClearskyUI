// @ts-check
import React from 'react';
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { postClearskyApi } from '../../api/core';
import appleTouchIcon from '../../assets/apple-touch-icon.png';
import './contact.css';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    handle: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState(null);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Send data to backend API
      const response = await postClearskyApi('v1', 'contact/email/message', {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        handle: formData.handle || null,
      });
      
      // Check if the response indicates success
      if (response && response.status === 'success') {
        setSubmitStatus({
          type: 'success',
          message: 'Your message has been sent successfully. We&apos;ll get back to you soon!'
        });
        
        // Clear form after successful submission
        setFormData({ name: '', email: '', handle: '', message: '' });
      } else {
        // Handle unexpected response format
        setSubmitStatus({
          type: 'error',
          message: 'Failed to send your message. Please try again later.'
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send your message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim();

  return (
    <div className="contact-page">
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Button 
              onClick={() => navigate('/')}
              sx={{ mb: 2, color: 'gray' }}
            >
              ← Back to Home
            </Button>
            <Box sx={{ mb: 2 }}>
              <img
                src={appleTouchIcon}
                alt="ClearSky Logo"
                className="contact-logo"
              />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Contact Us
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Send us a message and we&apos;ll get back to you as soon as possible.
            </Typography>
          </Box>

          {submitStatus && (
            <Alert 
              severity={submitStatus.type} 
              sx={{ mb: 3 }}
              onClose={() => setSubmitStatus(null)}
            >
              {submitStatus.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <TextField
              label="Name"
              required
              fullWidth
              value={formData.name}
              onChange={handleInputChange('name')}
              margin="normal"
              variant="outlined"
            />

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              margin="normal"
              variant="outlined"
            />

            <TextField
              label="Handle (optional)"
              fullWidth
              value={formData.handle}
              onChange={handleInputChange('handle')}
              margin="normal"
              variant="outlined"
              placeholder="@yourhandle.bsky.social"
              helperText="Your Bluesky handle (optional)"
            />

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              rows={6}
              value={formData.message}
              onChange={handleInputChange('message')}
              margin="normal"
              variant="outlined"
            />

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={!isFormValid || isSubmitting}
                sx={{ minWidth: 200 }}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </Box>
          </form>
        </Box>
      </Container>
    </div>
  );
}