import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormGroup,
  FormHelperText,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Stack,
  Typography,
} from '@mui/material';
import React, { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { initializeKeyring } from '../../../Background/redux-slices/keyrings';
import { selectKeyringStatus } from '../../../Background/redux-slices/selectors/keyringsSelectors';
import { useBackgroundDispatch, useBackgroundSelector } from '../../hooks';
import Config from '../../../../exconfig.json';

const InitializeKeyring = () => {
  const keyringState = useBackgroundSelector(selectKeyringStatus);
  const navigate = useNavigate();
  const { state } = useLocation();

  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [declaration, setDeclaration] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showLoader, setShowLoader] = useState<boolean>(false);

  const backgroundDispatch = useBackgroundDispatch();

  useEffect(() => {
    if (Config.enablePasswordEncryption === false) {
      setShowLoader(true);
      backgroundDispatch(initializeKeyring('12345'));
    }
  }, [backgroundDispatch, setShowLoader]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const validatePassword = useCallback((): boolean => {
    if (password !== confirmPassword) {
      setError("Passwords don't match with each other");
      return false;
    }
    setError('');
    return true;
  }, [password, confirmPassword]);

  const onSetPasswordClick = useCallback(() => {
    if (!validatePassword()) return;
    setShowLoader(true);
    backgroundDispatch(initializeKeyring(password));
    // setShowLoader(false);
  }, [validatePassword, backgroundDispatch, password]);

  useEffect(() => {
    if (keyringState === 'locked') {
      navigate('/keyring/unlock');
    }
    if (keyringState === 'unlocked') {
      navigate((state && state.redirectTo) || '/');
    }
  }, [keyringState, navigate, state]);

  return Config.enablePasswordEncryption ? (
    <Container sx={{ height: '100vh' }}>
      <Stack
        spacing={2}
        sx={{ height: '100%' }}
        justifyContent="center"
        alignItems="center"
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
            <Typography textAlign="center" variant="h3" gutterBottom>
              Create password
            </Typography>
            <Typography
              textAlign="center"
              variant="body1"
              color="text.secondary"
            >
              This password will unlock your account only on this device. We can
              not recover this password, <Link>learn more</Link>
            </Typography>
            <FormGroup sx={{ p: 2, pt: 4 }}>
              <FormControl sx={{ m: 1 }} variant="outlined">
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoFocus
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Password"
                />
              </FormControl>
              <FormControl sx={{ m: 1, mt: 2 }} variant="outlined">
                <InputLabel htmlFor="confirm-password">
                  Confirm Password
                </InputLabel>
                <OutlinedInput
                  onBlur={validatePassword}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Confirm Password"
                />
                {error ? <FormHelperText error>{error}</FormHelperText> : null}
              </FormControl>
              <FormControl sx={{ m: 1 }} variant="outlined">
                <Stack direction="row" alignItems="center">
                  <Checkbox
                    checked={declaration}
                    onChange={(e, checked) => setDeclaration(checked)}
                  />{' '}
                  <Typography variant="body2" color="text.secondary">
                    I understand that TRAMPOLINE Account cannot recover this
                    password for me
                  </Typography>
                </Stack>
              </FormControl>
            </FormGroup>
          </CardContent>
          <CardActions sx={{ width: '100%', pl: 2, pr: 2, pt: 0 }}>
            <Stack spacing={2} sx={{ width: '100%', pl: 2, pr: 2 }}>
              <Box sx={{ position: 'relative' }}>
                <Button
                  sx={{ width: '100%' }}
                  disabled={
                    password.length === 0 ||
                    confirmPassword.length === 0 ||
                    showLoader
                  }
                  size="large"
                  variant="contained"
                  onClick={onSetPasswordClick}
                >
                  Set password
                </Button>
                {showLoader && (
                  <CircularProgress
                    size={24}
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </Stack>
          </CardActions>
        </Box>
      </Stack>
    </Container>
  ) : null;
};

export default InitializeKeyring;
