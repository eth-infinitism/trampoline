import { Box, Tab, Tabs } from '@mui/material';
import React, { useState } from 'react';

const AccountActivity = () => {
  const [activeTab, setActiveTab] = useState<'assets' | 'activity'>('assets');

  return (
    <Box>
      <Tabs
        variant="fullWidth"
        value={activeTab}
        onChange={(e, newTab) => setActiveTab(newTab)}
        sx={{
          borderBottom: '1px solid rgb(0, 0, 0, 0.2)',
        }}
      >
        <Tab label="Assets" value="assets" />
        <Tab label="Activity" value="activity" />
      </Tabs>
      {/* <TabPanel value="assets">Assets List</TabPanel> */}
      {/* <TabPanel value="activity">Activity</TabPanel> */}
    </Box>
  );
};

export default AccountActivity;
