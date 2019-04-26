import React, { useState, useEffect } from "react";
// import getWeb3, {
//   getGanacheWeb3,
//   useRelayer,
//   getGanacheAddresses
// } from "./utils/getWeb3";
// import Header from "./components/Header/index.js";
// import Footer from "./components/Footer/index.js";
// import Hero from "./components/Hero/index.js";
// import Instructions from "./components/Instructions/index.js";
import { Loader, Button } from "rimble-ui";
import { zeppelinSolidityHotLoaderOptions } from "../config/webpack";
//import styles from "./App.module.scss";

const Web3 = require("web3");
// const FALLBACK_WEB3_PROVIDER =
//   process.env.REACT_APP_NETWORK || "http://0.0.0.0:8545";

let verbose = true;
let web3 = {};

function App() {
  const initialState = {
    storageValue: 0,
    web3: null,
    web3AccessEnabled: false,
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
    reset: false,
  };

  const [state, setState] = useState(initialState);

  //load web3
  useEffect(() => {

    const loadWeb3 = async () => {
      //This code is originally from Drizzle-Utils

      const resolveWeb3 = (resolve, options, isBrowser) => {
        let provider;
      
        if (options.customProvider) {
          // use custom provider from options object
          provider = options.customProvider;
        } else if (isBrowser && window.ethereum) {
          // use `ethereum` object injected by MetaMask
          provider = window.ethereum;
        } else if (isBrowser && typeof window.web3 !== "undefined") {
          // use injected web3 object by legacy dapp browsers
          provider = window.web3.currentProvider;
        } else if (options.fallbackProvider) {
          // use fallback provider from options object
          provider = options.fallbackProvider;
        } else {
          // connect to development blockchain from `truffle develop`
          provider = new Web3.providers.HttpProvider("http://127.0.0.1:9545");
        }
      
        const web3 = new Web3(provider);
        resolve(web3);
      };
      
      const getWeb3 = (options = {}) =>
        new Promise(resolve => {
          // handle server-side and React Native environments
          const isReactNative =
            typeof navigator !== "undefined" && navigator.product === "ReactNative";
          const isNode = typeof window === "undefined";
          if (isNode || isReactNative) {
            return resolveWeb3(resolve, options, false);
          }
      
          // if page is ready, resolve for web3 immediately
          if (document.readyState === `complete`) {
            return resolveWeb3(resolve, options, true);
          }
      
          // otherwise, resolve for web3 when page is done loading
          return window.addEventListener("load", () =>
            resolveWeb3(resolve, options, true),
          );
        });
      
        const web3 = await getWeb3();
        const web3AccessEnabled = true;
      

      setState({...state, web3, web3AccessEnabled});
    }

    loadWeb3();

  },[state.reset]);

  //Load Contract Artifacts
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

    setState({ ...state, artifactGaslessNFT, artifactRelayHub, isProduction});

    if (verbose) console.log("Artifacts Set");
  },[state.reset]);

  //load network details
  useEffect(() => {

    const loadNetworkDetails = async () => {

      let ganacheAccounts = [];
      let accounts = [];

      // ganacheAccounts = await getGanacheAddresses();
      // if (verbose) console.log("Ganache Addresses loaded");

      accounts = await state.web3.eth.getAccounts();
      if (verbose) console.log("User Accounts loaded");
      if (verbose) console.log(accounts);

      const networkId = await state.web3.eth.net.getId();
      if (verbose) console.log(`Network ID is: ${networkId}`);

      const networkType = await state.web3.eth.net.getNetworkType();
      if (verbose) console.log(`Network type is: ${networkType}`);

      //change this to a switch for all possible provider cases
      const isMetaMask = window.ethereum.isMetaMask;
      if (verbose) console.log(`Is current provider metamask: ${isMetaMask}`)

      let balance =
        accounts.length > 0
          ? await state.web3.eth.getBalance(accounts[0])
          : state.web3.utils.toWei("0");

      balance = state.web3.utils.fromWei(balance, "ether");
      if(verbose) console.log(`The current Account balance is: ${balance}`);

      setState({...state, web3, ganacheAccounts,accounts,networkId,networkType,isMetaMask,balance, reset: false});
    };


    if(state.web3 && state.web3.eth){
      loadNetworkDetails();
    }

  },[state.web3]);

  const reset = () => {
    setState({...state, reset: true});
  }

  return <div>Hello<br/>
<Button size="small" onClick={event => reset()}>
  Reset App
</Button>
  </div>;
}

export default App;
