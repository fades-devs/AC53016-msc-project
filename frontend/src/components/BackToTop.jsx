import React from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Fade from '@mui/material/Fade';

/**
 * A reusable "Back to Top" button component for Material-UI.
 * It appears when the user scrolls down the page and smoothly scrolls
 * back to the top on click.
 */
function backToTop() {
  // useScrollTrigger is a hook that listens for scroll events.
  // The button will appear after scrolling 100px.
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  // Handles the click event and scrolls to the top of the page.
  const handleClick = () => {
    // Find the anchor element with the specific ID.
    const anchor = document.querySelector('#back-to-top-anchor');

    if (anchor) {
      // Smoothly scroll the anchor into view.
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  return (
    // Fade transition makes the button appear and disappear smoothly.
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        // Positions the button at the bottom-right of the screen.
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 100 }}
      >
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </Box>
    </Fade>
  );
}

export default backToTop;
