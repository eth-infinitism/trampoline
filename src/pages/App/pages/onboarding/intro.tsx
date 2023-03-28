import React from 'react';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import logo from '../../../../assets/img/logo.svg';
import { useNavigate } from 'react-router-dom';

const Intro = () => {
  const navigate = useNavigate();

  return (
    <Stack
      spacing={2}
      sx={{ height: '100%' }}
      justifyContent="center"
      alignItems="center"
    >
      <div
        style={{
          fontFamily: 'Poppins',
        }}
      >
        <Box
          component="span"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: 600,
            p: 2,
            border: '1px solid #d6d9dc',
            borderRadius: 5,
            background: 'white',
          }}
        >
          <CardContent>
            <Typography
              textAlign="center"
              variant="h2"
              gutterBottom
              fontWeight="600"
              letterSpacing="-2.2px"
            >
              fuchsia
            </Typography>
            <Typography
              textAlign="center"
              variant="body1"
              color="text.secondary"
            >
              Your smart contract account with unlimited rewards,{' '}
              <Link>learn more</Link>
            </Typography>
          </CardContent>
          <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Button
                color="secondary"
                sx={{
                  borderRadius: '50px',
                  backgroundColor: '#C8366B',
                  fontFamily: 'Poppins',
                }}
                size="large"
                variant="contained"
                onClick={() => navigate('/accounts/new')}
              >
                Start
              </Button>
            </Stack>
          </CardActions>
        </Box>
      </div>
    </Stack>
  );
};

export default Intro;
