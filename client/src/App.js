import React, { Component, useState, useEffect } from "react";
import getWeb3, {
  getGanacheWeb3,
  useRelayer,
  getGanacheAddresses
} from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Hero from "./components/Hero/index.js";
import Instructions from "./components/Instructions/index.js";
import { Loader, Button } from "rimble-ui";

import { zeppelinSolidityHotLoaderOptions } from "../config/webpack";

import styles from "./App.module.scss";

let verbose = true;

function App() {
  const initialState = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    route: window.location.pathname.replace("/", ""),
    gaslessNFTName: "none set",
    totalSupply: 0,
    artifactGaslessNFT: {},
    artifactRelayHub: {},
    isProduction: false,
    localAccounts: [],
    ganacheAccounts: []
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
    const isProduction = process.env.NODE_ENV === "production";
    let artifactGaslessNFT = {};
    let artifactRelayHub = {};

    try {
      artifactGaslessNFT = require("./contracts/MetaNFT.json");
      artifactRelayHub = require("./contracts/RelayHub.json");
    } catch (e) {
      console.log(e);
    }

    setState({ ...state, artifactGaslessNFT, artifactRelayHub, isProduction });

    if (verbose) console.log("Artifacts Set");
  }, []);

  useEffect(() => {
    const web3 = {};

    const loadWeb3 = async () => {
      web3 = await getWeb3();
    };

    const isProd = async () => {};

    if (!state.isProduction) isProd();
  });

  return <div>Hello</div>;
}

export default App;
