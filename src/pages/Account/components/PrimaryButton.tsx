import React, { useCallback, useState } from 'react';

import { Button } from '@mui/material';
import { ComponentProps } from 'react';
import useOnWindowEnter from '../../App/hooks/onWindowEnter';

/** `Button` wrapper which is auto-clicked when the user presses enter. */
const PrimaryButton = (props: ComponentProps<typeof Button>) => {
  const [ref, setRef] = useState<HTMLButtonElement | null>(null);
  const click = useCallback(() => ref?.click(), [ref]);
  useOnWindowEnter(click);

  return (
    <Button
      {...props}
      ref={(r) => {
        setRef(r);

        if (typeof props.ref === 'function') {
          props.ref(r);
        }
      }}
    />
  );
};

export default PrimaryButton;
