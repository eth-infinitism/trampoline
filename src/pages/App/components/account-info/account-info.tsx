import { Box, BoxProps, Typography } from '@mui/material';
import React, { FC, useCallback } from 'react';
import { getAccountInfo } from '../../../Background/redux-slices/selectors/accountSelectors';
import { useBackgroundSelector } from '../../hooks';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import SettingsIcon from '@mui/icons-material/Settings';
import { Row } from '../../../../components/Row';
import { BorderBox } from '../../../../components/BorderBox';

type Props = BoxProps & {
  address: string;
  showOptions: boolean;
};

const AccountInfo: FC<Props> = ({ address, showOptions = true, ...props }) => {
  // TODO: ツールチップを出したい
  // const [tooltipMessage, setTooltipMessage] = useState<string>('Copy address');

  const accountInfo = useBackgroundSelector((state) =>
    getAccountInfo(state, address)
  );

  const copyAddress = useCallback(async () => {
    await navigator.clipboard.writeText(address);
    // setTooltipMessage('Address copied');
  }, [address]);

  return (
    <BorderBox py={2} {...props}>
      <Row justifyContent="space-between">
        <Box>
          {/* Name */}
          <Typography variant="h6" lineHeight="28px">
            {accountInfo.name}
          </Typography>
          {/* Address */}
          <Row
            onClick={copyAddress}
            sx={{
              minWidth: 300,
              borderRadius: 4,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          >
            <span>
              {address.substring(0, 5)}...
              {address.substring(address.length - 5)}
            </span>
            <ContentCopyIcon sx={{ height: 12, cursor: 'pointer' }} />
          </Row>
        </Box>
        <SettingsIcon fontSize="large" />
      </Row>
    </BorderBox>
  );
};

export default AccountInfo;
