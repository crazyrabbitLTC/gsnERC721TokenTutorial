import React from "react";
import TokenList from "../Token/TokenList";
import MintAndSend from "./MintAndSend";
const AppContainer = () => {
  return (
    <div>
      <div>GasFrei Demo!</div>
      <div><TokenList/></div>
      <div><MintAndSend/></div>
      <div>Address Bar</div>
      <div>Meta or Relay</div>
    </div>
  );
};

export default AppContainer;
