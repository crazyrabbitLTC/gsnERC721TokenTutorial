import React, { useState, useEffect } from "react";
// import { switchToRelayer } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import { zeppelinSolidityHotLoaderOptions } from "../config/webpack";

import { Loader, Button } from "rimble-ui";
import styles from "./App.module.scss";

const tabookey = require("tabookey-gasless");
const getWeb3 = require("@drizzle-utils/get-web3");
const createDrizzleUtils = require("@drizzle-utils/core");
let contractInstance;

let verbose = true;

function App() {
  const initialState = {
    contractInstance,
    web3: null,
    web3Loaded: false,
    drizzleUtils: null,
    web3AccessEnabled: false,
    ganacheAccounts: [],
    accounts: [],
    networkId: null,
    networkType: null,
    isMetaMask: null,
    route: window.location.pathname.replace("/", ""),
    gaslessNFTName: "none set",
    totalSupply: 0,
    artifactGaslessNFT: {},
    artifactRelayHub: {},
    gaslessNFTInstance: null,
    relayHubInstance: null,
    appReady: false
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;

    const loadNetworkDetails = async () => {
      const web3 = await getWeb3();

      let deployedNetwork = null;
      let networkId = null;
      let networkType = null;
      let accounts = [];
      let contractArtifact = null;
      let contractInstance = null;
      let appReady = state.appReady;

      contractArtifact = require("../../contracts/MetaNFT.sol");

      accounts = await web3.eth.getAccounts();

      networkId = await web3.eth.net.getId();

      networkType = await web3.eth.net.getNetworkType();

      if (contractArtifact.networks) {
        deployedNetwork = contractArtifact.networks[networkId.toString()];

        if (deployedNetwork) {
          contractInstance = new web3.eth.Contract(
            contractArtifact.abi,
            deployedNetwork && deployedNetwork.address
          );
        }
      }

      appReady = true;
      setState({
        ...state,
        web3,
        accounts,
        networkId,
        networkType,
        contractInstance,
        appReady
      });
    };

    loadNetworkDetails();
  }, [state.appReady]);

  const refreshApp = () => {
    setState({ ...state, appReady: false });
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


  const switchToRelayer = () => {
    const RelayProvider = tabookey.RelayProvider;

    var provider = new RelayProvider(state.web3.currentProvider, {
      txfee: 12,
      force_gasLimit: 6000000
    });
    state.web3.setProvider(provider);
    console.log("Using Relayer");
  };

  const getGaslessNFTName = async () => {
    const { contractInstance } = state;
    //Get the Name to prove it's loaded
    const response = await contractInstance.methods.name().call();

    this.setState({ gaslessNFTName: response });
  };

  const mintGaslessNFT = async () => {
    const { accounts, contractInstance, totalSupply } = state;
    try {
      const tx = await contractInstance.methods
        .mintWithTokenURI(accounts[0], totalSupply + 1, "first Token1")
        .send({ from: accounts[0], gas: 5000000 });
      console.log("after mint");
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const initializeGasLessNFT = async () => {
    const { accounts, contractInstance } = state;
    try {
      console.log("Minter Account: ", accounts[0]);
      await contractInstance.methods
        .initialize(
          "Dennison Token",
          "DT",
          [accounts[0], "0x9C57C0F1965D225951FE1B2618C92Eefd687654F"],
          [accounts[0]]
        )
        .send({ from: accounts[0], gas: 5000000 });
    } catch (error) {
      console.log(error);
    }
  };

  const renderGaslessNFTBody = () => {
    return (
      <div className={styles.wrapper}>
        {!state.web3 && renderLoader()}
        {/* {state.web3 &&
          !state.gaslessContract &&
          renderDeployCheck("gasless-counter")} */}
        {state.web3 && (
          <div className={styles.contracts}>
            <h1>Gasless NFT Contract</h1>
            <p>
              In order to make gasless transactions, press the 'Use Relayer'
              button below.{" "}
            </p>
            <p>(to stop using relayer simply refresh the page)</p>
            <Button
              id="switchToRelayerBtn"
              onClick={() => switchToRelayer()}
            >
              Use Relayer
            </Button>
            <Button id="useDeployNFT" onClick={() => initializeGasLessNFT()}>
              Initialize Contract
            </Button>
            <Button id="mintNFT" onClick={() => mintGaslessNFT()}>
              Mint!
            </Button>
            <Button onClick={() => refreshApp()}>Refresh</Button>
            The name of your NFT is: {state.gaslessNFTName}
            <br />
            The total supply of your NFT is: {state.totalSupply}
            <div className={styles.widgets} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <Header />
      {state.route === "nft" && renderGaslessNFTBody()}
      <Footer />
    </div>
  );
}

export default App;
