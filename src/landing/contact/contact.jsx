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
  const [fieldErrors, setFieldErrors] = React.useState({
    name: '',
    email: '',
    handle: '',
    message: ''
  });

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Name is required';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters long';
    }
    if (name.trim().length > 100) {
      return 'Name must be less than 100 characters';
    }
    if (!/^[a-zA-Z\s\-'.]+$/.test(name.trim())) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return 'Please enter a valid email address';
    }
    if (email.length > 254) {
      return 'Email address is too long';
    }
    return '';
  };

  const validateHandle = (handle) => {
    if (!handle.trim()) {
      return ''; // Optional field
    }
    const cleanHandle = handle.trim();
    
    // Check if it starts with @ and remove it for validation
    const handleToValidate = cleanHandle.startsWith('@') ? cleanHandle.slice(1) : cleanHandle;
    
    if (handleToValidate.length < 3) {
      return 'Handle must be at least 3 characters long';
    }
    if (handleToValidate.length > 253) {
      return 'Handle is too long';
    }
    
    // Bluesky handle format: handle.domain.tld
    const handleRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    if (!handleRegex.test(handleToValidate)) {
      return 'Please enter a valid handle format (e.g., username.bsky.social)';
    }
    
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) {
      return 'Message is required';
    }
    if (message.trim().length < 10) {
      return 'Message must be at least 10 characters long';
    }
    if (message.trim().length > 2000) {
      return 'Message must be less than 2000 characters';
    }
    return '';
  };

  const validateField = (field, value) => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'handle':
        return validateHandle(value);
      case 'message':
        return validateMessage(value);
      default:
        return '';
    }
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBlur = (field) => (event) => {
    const value = event.target.value;
    const error = validateField(field, value);
    setFieldErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const validateAllFields = () => {
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      handle: validateHandle(formData.handle),
      message: validateMessage(formData.message)
    };
    
    setFieldErrors(errors);
    
    // Return true if no errors
    return !Object.values(errors).some(error => error !== '');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitStatus(null);

    // Validate all fields before submission
    if (!validateAllFields()) {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix the errors in the form before submitting.'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Send data to backend API
      const response = await postClearskyApi('v1', 'contact/email/message', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        handle: formData.handle.trim() || null,
      });
      
      // Check if the response indicates success
      if (response && response.status === 'success') {
        setSubmitStatus({
          type: 'success',
          message: 'Your message has been sent successfully. We&apos;ll get back to you soon!'
        });
        
        // Clear form and errors after successful submission
        setFormData({ name: '', email: '', handle: '', message: '' });
        setFieldErrors({ name: '', email: '', handle: '', message: '' });
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

  const isFormValid = formData.name.trim() && 
                     formData.email.trim() && 
                     formData.message.trim() && 
                     !Object.values(fieldErrors).some(error => error !== '');

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
              onBlur={handleBlur('name')}
              margin="normal"
              variant="outlined"
              error={!!fieldErrors.name}
              helperText={fieldErrors.name || 'Enter your full name'}
            />

            <TextField
              label="Email"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={handleInputChange('email')}
              onBlur={handleBlur('email')}
              margin="normal"
              variant="outlined"
              error={!!fieldErrors.email}
              helperText={fieldErrors.email || 'Enter a valid email address'}
            />

            <TextField
              label="Handle (optional)"
              fullWidth
              value={formData.handle}
              onChange={handleInputChange('handle')}
              onBlur={handleBlur('handle')}
              margin="normal"
              variant="outlined"
              placeholder="@yourhandle.bsky.social"
              error={!!fieldErrors.handle}
              helperText={fieldErrors.handle || 'Your Bluesky handle (optional)'}
            />

            <TextField
              label="Message"
              required
              fullWidth
              multiline
              rows={6}
              value={formData.message}
              onChange={handleInputChange('message')}
              onBlur={handleBlur('message')}
              margin="normal"
              variant="outlined"
              error={!!fieldErrors.message}
              helperText={fieldErrors.message || `${formData.message.length}/2000 characters (minimum 10)`}
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