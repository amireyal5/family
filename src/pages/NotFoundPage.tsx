import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          py: 8,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          הדף לא נמצא
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          מצטערים, לא מצאנו את הדף שחיפשת.
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/dashboard"
        >
          חזרה לדף הבית
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;