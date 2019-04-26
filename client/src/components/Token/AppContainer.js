import React from "react";
import TokenList from "../Token/TokenList";
import MintAndSend from "./MintAndSend";
import AddressBar from "./AddressBar";
import MetaOrRelay from "./MetaOrRelay";

const AppContainer = () => {
  return (
    <div>
      <div>GasFrei Demo!</div>
      <div><TokenList/></div>
      <div><MintAndSend/></div>
      <div><AddressBar/></div>
      <div><MetaOrRelay/></div>
    </div>
  );
};

export default AppContainer;
