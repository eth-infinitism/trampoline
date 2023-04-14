import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import React from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  getActiveNetwork,
  getSupportedNetworks,
} from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundSelector } from '../../hooks';
import { setActiveNetwork } from '../../../Background/redux-slices/network';
import logo from '../../../../assets/img/logo.svg';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeNetwork = useBackgroundSelector(getActiveNetwork);
  const supportedNetworks = useBackgroundSelector(getSupportedNetworks);

  const switchActiveNetwork = (e: SelectChangeEvent<string>) => {
    const payload = supportedNetworks.find((network) => {
      return network.chainID === e.target.value;
    });
    if (!payload) return;
    dispatch(setActiveNetwork(payload));
  };

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{ mr: 4, ml: 4, mt: 2, mb: 2, height: 60 }}
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
      </Stack>
      <Stack
        direction="row"
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <FormControl sx={{ minWidth: 80 }}>
          <InputLabel id="chain-selector" children="Chain" />
          <Select
            labelId="chain-selector"
            id="chain-selector"
            value={activeNetwork.chainID}
            label="Chain"
            onChange={switchActiveNetwork}
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
