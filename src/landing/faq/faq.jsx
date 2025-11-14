import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Container,
  Box,
  Button,
} from '@mui/material';
import { useFaq } from '../../api/faq';
import { AssignmentOutlined, CloseOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { HydrateFallback } from '../../common-components/hydrate-fallback';

function AccordionIcon({ expanded }) {
  return (
    <Box
      sx={{
        fontWeight: 'bold',
        fontSize: 20,
        transition: 'transform 0.3s',
        transform: expanded ? 'rotate(0deg)' : 'rotate(45deg)',
      }}
    >
      <CloseOutlined />
    </Box>
  );
}

export default function FAQ() {
  const navigate = useNavigate();
  const { data: faqs = [], isLoading, error } = useFaq();
  const [expandedId, setExpandedId] = useState(null); // track by unique id

  const handleChange = (id) => (_, isExpanded) => {
    setExpandedId(isExpanded ? id : null);
  };

  if (isLoading) return <HydrateFallback />;

  const faqsByCategory = faqs.reduce((acc, faq) => {
    const category = faq.category || 'Uncategorized';
    if (!acc[category]) acc[category] = [];
    acc[category].push(faq);
    return acc;
  }, {});

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Button onClick={() => navigate('/')} sx={{ color: 'gray' }}>
          ← Back to Home
        </Button>
      </Box>
      <Typography variant="h3" textAlign="center" gutterBottom>
        FAQ
      </Typography>

      {Object.entries(faqsByCategory).map(([category, faqsInCategory]) => (
        <Box key={category} mb={3}>
          <Box display="flex" alignItems="center" mb={1}>
            <Typography
              variant="h6"
              textTransform="capitalize"
              fontWeight="bold"
              sx={{ flexGrow: 1 }}
            >
              {category}
            </Typography>
          </Box>

          {faqsInCategory.map((faq, index) => {
            const id = `${category}-${index}`;
            return (
              <Accordion
                key={id}
                expanded={expandedId === id}
                onChange={handleChange(id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary
                  expandIcon={<AccordionIcon expanded={expandedId === id} />}
                >
                  <AssignmentOutlined sx={{ mr: 1 }} color="info" />
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    variant="body1"
                    fontWeight="regular"
                    color="text.secondary"
                  >
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      ))}
    </Container>
  );
}
