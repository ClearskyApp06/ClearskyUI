// @ts-check
import React from 'react';
import { Button, TextField, Container, Typography, Box, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

    // Create mailto link with form data
    const subject = encodeURIComponent('Contact Form Submission');
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Email: ${formData.email}\n` +
      `Handle: ${formData.handle || 'Not provided'}\n\n` +
      `Message:\n${formData.message}`
    );
    
    const mailtoUrl = `mailto:support@clearsky.app?subject=${subject}&body=${body}`;
    
    // Open default email client
    window.location.href = mailtoUrl;
    
    setSubmitStatus({
      type: 'success',
      message: 'Email client opened. Please send the email to complete your request.'
    });
    
    // Clear form after successful submission
    setTimeout(() => {
      setFormData({ name: '', email: '', handle: '', message: '' });
    }, 2000);
    
    setIsSubmitting(false);
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