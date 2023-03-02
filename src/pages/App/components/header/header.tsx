import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import React from 'react';
import logo from '../../../../assets/img/logo.svg';
import {
  getActiveNetwork,
  getSupportedNetworks,
} from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundSelector } from '../../hooks';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const supportedNetworks = useBackgroundSelector(getSupportedNetworks);

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        mr: 4,
        ml: 4,
        mt: 2,
        mb: 2,
        height: 60,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
        sx={{ cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img height={30} src={logo} className="App-logo" alt="logo" />
        <Typography variant="h6">TRAMPOLINE</Typography>
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <FormControl sx={{ minWidth: 80 }}>
          <InputLabel id="chain-selector">Chain</InputLabel>
          <Select
            labelId="chain-selector"
            id="chain-selector"
            value={activeNetwork.chainID}
            label="Chain"
            // onChange={handleChange}
          >
            {supportedNetworks.map((network) => (
              <MenuItem key={network.chainID} value={network.chainID}>
                {network.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <SettingsIcon fontSize="large" />
      </Stack>
    </Box>
  );
};

export default Header;
