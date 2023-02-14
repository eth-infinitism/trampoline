import React, { useCallback, useEffect } from 'react';

const Home = () => {
  const openExpandedView = useCallback(() => {
    const url = chrome.runtime.getURL('app.html');
    chrome.tabs.create({
      url,
    });
  }, []);

  useEffect(() => {
    openExpandedView();
  }, [openExpandedView]);

  return <div>Home</div>;
};

export default Home;
