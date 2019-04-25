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
    ganacheAccounts: [],
    accounts: [],
    networkId: null,
    networkType: null,
    isMetaMask: null,
    userBalance: null,
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
    const isProd = async () => {
      let web3 = {};
      const ganacheAccounts = [];
      const accounts = [];

      web3 = await getWeb3();
      if (verbose) console.log("Web3 Loaded");

      ganacheAccounts = await getGanacheAddresses();
      if (verbose) console.log("Ganache Addresses loaded");

      accounts = await web3.eth.getAccounts();
      if (verbose) console.log("User Accounts loaded");

      const networkId = await web3.eth.net.getId();
      if (verbose) console.log(`Network ID is: ${networkId}`);

      const networkType = await web3.eth.net.getNetworkType();
      if (verbose) console.log(`Network type is: ${networkType}`);

      const isMetaMask = web3.currentProvider.isMetaMask;
      if (verbose) console.log(`Is current provider metamask: ${isMetaMask}`);

      let balance =
        accounts.length > 0
          ? await web3.eth.getBalance(accounts[0])
          : web3.utils.toWei("0");

      balance = web3.utils.fromWei(balance, "ether");

      setState({...state, web3, ganacheAccounts,accounts,networkId,networkType,isMetaMask,balance});
    };

    //I don't know why we care if it's production or not.
    if (!state.isProduction) isProd();
  },[]);

  return <div>Hello</div>;
}

export default App;
