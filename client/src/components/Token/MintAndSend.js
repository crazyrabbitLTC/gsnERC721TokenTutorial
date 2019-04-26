import React from "react";
import { OutlineButton, Tooltip } from "rimble-ui";

const MintAndSend = () => {
  return (
    <div>
      <Tooltip message="Mint it daddio!" placement="top">
        <OutlineButton>Mint</OutlineButton>
      </Tooltip>
      <Tooltip message="Send It daddio!" placement="top">
        <OutlineButton>Send</OutlineButton>
      </Tooltip>
    </div>
  );
};

export default MintAndSend;
