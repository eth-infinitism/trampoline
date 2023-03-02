import {
    Button,
    CardActions,
    CardContent,
    Stack,
    Typography,
  } from '@mui/material';
  import React from 'react';

  const SignMessage = ({
    onComplete,
  }: {
    onComplete: (context: any) => void;
  }) => {
    return (
      <>
        <CardContent>
          <Typography variant="h3" gutterBottom>
            Customaisable sign message Account Component
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You can show as many steps as you want in this dummy component. You
            need to call the function <b>onComplete</b> passed as a props to this
            component. <br />
            <br />
            The function takes a context as a parameter, this context will be
            passed to your AccountApi when creating a new account.
            <br />
            This Component is defined in exported in <pre>trampoline/src/pages/Account/components/sign-message/index.ts</pre>
          </Typography>
        </CardContent>
        <CardActions sx={{ pl: 4, pr: 4, width: '100%' }}>
          <Stack spacing={2} sx={{ width: '100%' }}>
            <Button size="large" variant="contained" onClick={() => onComplete()}>
              Continue
            </Button>
          </Stack>
        </CardActions>
      </>
    );
  };

  export default SignMessage;