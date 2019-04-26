import React, { useState, useEffect } from "react";
// import { switchToRelayer } from "./utils/getWeb3";
// import Header from "./components/Header/index.js";
// import Footer from "./components/Footer/index.js";
// import Hero from "./components/Hero/index.js";
// import Instructions from "./components/Instructions/index.js";

import { Loader, Button } from "rimble-ui";
import { zeppelinSolidityHotLoaderOptions } from "../config/webpack";
import styles from "./App.module.scss";
//import { thisExpression } from "@babel/types";

//const Web3 = require("web3");

const tabookey = require("tabookey-gasless");
const getWeb3 = require("@drizzle-utils/get-web3");
const createDrizzleUtils = require("@drizzle-utils/core");

let verbose = true;

function App() {
  const initialState = {
    storageValue: 0,
    web3: null,
    drizzleUtils: null,
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
    reset: false
  };

  const [state, setState] = useState(initialState);

  //load web3
  useEffect(()=> {
    const loadWeb3 = async () => {
      const web3 = await getWeb3();
      const drizzleUtils = await createDrizzleUtils({ web3 });

      setState({...state, web3, drizzleUtils});
      console.log("State of web3:", state.web3);
    }

    if(!state.web3) loadWeb3();
  },[state.reset])

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

    setState({ ...state, artifactGaslessNFT, artifactRelayHub, isProduction });

    if (verbose) console.log("Artifacts Set");
  }, [state.reset]);

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
      if (verbose) console.log(`Is current provider metamask: ${isMetaMask}`);

      let balance =
        accounts.length > 0
          ? await state.web3.eth.getBalance(accounts[0])
          : state.web3.utils.toWei("0");

      balance = state.web3.utils.fromWei(balance, "ether");
      if (verbose) console.log(`The current Account balance is: ${balance}`);

      setState({
        ...state,
        ganacheAccounts,
        accounts,
        networkId,
        networkType,
        isMetaMask,
        balance,
        reset: false
      });
    };

    if (state.web3 && state.web3.eth) {
      loadNetworkDetails();
    }
  }, [state.web3]);

  const resetApp = () => {
    setState({ ...state, reset: true });
  };

  const renderLoader = () => {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  };

  const switchToRelayerBtnPress = () => {
    var btn = document.getElementById("switchToRelayerBtn");
    btn.disabled = true;
    btn.innerText = "Using Relayer";
    switchToRelayer(state.web3);
  };

  const switchToRelayer = () => {
    const RelayProvider = tabookey.RelayProvider;
    console.log("what is current provider?", state.web3);
    var provider = new RelayProvider(state.web3.currentProvider, {
      txfee: 12,
      force_gasLimit: 6000000
    });
    state.web3.setProvider(provider);
    if (verbose) console.log("USING RELAYER");
  };

  // const getGaslessNFTName = async () => {
  //   const { gaslessNFT } = this.state;
  //   //Get the Name to prove it's loaded
  //   const response = await gaslessNFT.methods.name().call();
  //   console.log("Contract NFT name is: ", response);
  //   this.setState({ gaslessNFTName: response });
  // };

  // const mintGaslessNFT = async (tokenId, tokenURI) => {
  //   const { accounts, gaslessNFT } = this.state;
  //   try {
  //     const response = await gaslessNFT.methods
  //       .metaMint(tokenId, tokenURI)
  //       .send({ from: accounts[0], gas: 5000000 });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const mintGaslessNFT = async () => {
  //   const { accounts, gaslessNFT, totalSupply } = state;
  //   try {
  //     console.log("Account minting: ", accounts[0]);
  //     console.log(gaslessNFT);
  //     const tx = await gaslessNFT.methods
  //       .mintWithTokenURI(accounts[0], totalSupply + 1, "first Token1")
  //       .send({ from: accounts[0], gas: 5000000 });
  //     console.log("after mint");
  //     console.log(tx);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const initializeGasLessNFT = async () => {
  //   const { accounts, gaslessNFT } = state;
  //   try {
  //     console.log("Minter Account: ", accounts[0]);
  //     await gaslessNFT.methods
  //       .initialize(
  //         "Dennison Token",
  //         "DT",
  //         [accounts[0], "0x9C57C0F1965D225951FE1B2618C92Eefd687654F"],
  //         [accounts[0]]
  //       )
  //       .send({ from: accounts[0], gas: 5000000 });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  // const renderGaslessNFTBody = () => {
  //   return (
  //     <div className={styles.wrapper}>
  //       {!state.web3 && renderLoader()}
  //       {/* {state.web3 &&
  //         !state.gaslessContract &&
  //         renderDeployCheck("gasless-counter")} */}
  //       {state.web3 && state.gaslessNFT && (
  //         <div className={styles.contracts}>
  //           <h1>Gasless NFT Contract</h1>
  //           <p>
  //             In order to make gasless transactions, press the 'Use Relayer'
  //             button below.{" "}
  //           </p>
  //           <p>(to stop using relayer simply refresh the page)</p>
  //           <Button
  //             id="switchToRelayerBtn"
  //             onClick={() => switchToRelayerBtnPress()}
  //           >
  //             Use Relayer
  //           </Button>
  //           <Button
  //             id="useDeployNFT"
  //             onClick={() => initializeGasLessNFT()}
  //           >
  //             Initialize Contract
  //           </Button>
  //           <Button id="mintNFT" onClick={() => mintGaslessNFT()}>
  //             Mint!
  //           </Button>
  //           The name of your NFT is: {state.gaslessNFTName}
  //           <br />
  //           The total supply of your NFT is: {state.totalSupply}
  //           <div className={styles.widgets} />
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <div>
      Hello
      <br />
      {!state.web3 && renderLoader()}
      <Button size="small" onClick={event => resetApp()}>
        Reset App
      </Button>
      <Button size="small" onClick={event => switchToRelayer()}>
        User Relayer
      </Button>
    </div>
  );
}

export default App;
