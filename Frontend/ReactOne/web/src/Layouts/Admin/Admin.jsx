import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import SubjectAdmin from './Subject';
import ChapterAdmin from './Chapter';
import TopicsAdmin from './Topics';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState(0);
  const handleChange = (_e, newValue) => setTab(newValue);

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Admin Panel</Typography>
      <Tabs value={tab} onChange={handleChange} aria-label="admin tabs">
        <Tab label="Subjects" id="admin-tab-0" aria-controls="admin-tabpanel-0" />
        <Tab label="Chapters" id="admin-tab-1" aria-controls="admin-tabpanel-1" />
        <Tab label="Topics" id="admin-tab-2" aria-controls="admin-tabpanel-2" />
      </Tabs>
      <TabPanel value={tab} index={0}>
        <SubjectAdmin />
      </TabPanel>
      <TabPanel value={tab} index={1}>
        <ChapterAdmin />
      </TabPanel>
      <TabPanel value={tab} index={2}>
        <TopicsAdmin />
      </TabPanel>
    </Box>
  );
}
