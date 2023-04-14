import {
  Box,
  BoxProps,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  getActiveNetwork,
  getSupportedNetworks,
} from '../../../Background/redux-slices/selectors/networkSelectors';
import { useBackgroundSelector } from '../../hooks';
import { setActiveNetwork } from '../../../Background/redux-slices/network';
import { Row } from '../../../../components/Row';
import logo from '../../../../assets/img/logo.svg';

type Props = BoxProps & {};

const Header: FC<Props> = ({ ...props }) => {
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
    <Row px={4} width="100%" justifyContent="space-between" {...props}>
      {/* Logo */}
      <Box sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img height={48} src={logo} className="App-logo" alt="logo" />
      </Box>
      {/* Switch Chain */}
      <FormControl sx={{ minWidth: 80, color: 'white' }}>
        <InputLabel
          id="chain-selector"
          children="Chain"
          sx={{ color: 'white' }}
        />
        <Select
          labelId="chain-selector"
          id="chain-selector"
          value={activeNetwork.chainID}
          label="Chain"
          onChange={switchActiveNetwork}
          sx={{ color: 'white' }}
        >
          {supportedNetworks.map((network) => (
            <MenuItem key={network.chainID} value={network.chainID}>
              {network.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Row>
  );
};

export default Header;
