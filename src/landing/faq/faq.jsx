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
import { AssignmentOutlined, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { HydrateFallback } from '../../common-components/hydrate-fallback';
import ReactMarkdown from 'react-markdown';

function AccordionIcon({ expanded }) {
  return (
    <Box
      sx={{
        fontWeight: 'bold',
        fontSize: 20,
        transition: 'transform 0.3s',
        transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)',
      }}
    >
      <Add />
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
    <Box
      sx={{
        paddingY: 6,
        height: '100dvh',
        overflowY: 'auto',
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center' }}>
          <Button onClick={() => navigate('/')} sx={{ color: 'gray' }}>
            ← Back to Home
          </Button>
        </Box>
        <Typography variant="h3" textAlign="center" gutterBottom>
          FAQ
        </Typography>

        {error && (
          <Typography textAlign="center" color="error">
            {error.message}
          </Typography>
        )}

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
              const id = `${category}-${faq.question.substring(0, 20)}-${index}`;
              return (
                <Accordion
                  key={id}
                  expanded={expandedId === id}
                  onChange={handleChange(id)}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary
                    expandIcon={<AccordionIcon expanded={expandedId === id} />}
                    sx={{
                      '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                        transform: 'none !important',
                      },
                    }}
                  >
                    <AssignmentOutlined sx={{ mr: 1 }} color="info" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      {faq.question}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails>
                    <ReactMarkdown
                      components={{
                        p: (props) => (
                          <Typography
                            variant="body1"
                            fontWeight="regular"
                            color="text.secondary"
                            paragraph
                            {...props}
                          />
                        ),
                        strong: (props) => (
                          <Typography component="strong" fontWeight="bold" {...props} />
                        ),
                        li: (props) => (
                          <li>
                            <Typography
                              variant="body1"
                              color="text.secondary"
                              {...props}
                            />
                          </li>
                        ),
                      }}
                    >
                      {faq.answer}
                    </ReactMarkdown>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        ))}
      </Container>
    </Box>
  );
}
