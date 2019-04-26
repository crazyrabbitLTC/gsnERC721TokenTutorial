import React, { useState, useEffect } from "react";
// import { switchToRelayer } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
// import Hero from "./components/Hero/index.js";
// import Instructions from "./components/Instructions/index.js";

import { Loader, Button } from "rimble-ui";
import styles from "./App.module.scss";

const tabookey = require("tabookey-gasless");
const getWeb3 = require("@drizzle-utils/get-web3");
const createDrizzleUtils = require("@drizzle-utils/core");
let contractInstance;

let verbose = true;

function App() {
  const initialState = {
    storageValue: 0,
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

  //load web3
  useEffect(() => {
    const loadWeb3 = async () => {
      const web3 = await getWeb3();
      const drizzleUtils = await createDrizzleUtils({ web3 });

      setState({ ...state, web3, drizzleUtils, web3Loaded: true });
    };

    if (!state.web3) loadWeb3();
  }, []);

  //load network details
  useEffect(() => {
    const loadNetworkDetails = async () => {
      let gaslessNFTInstance = null;
      let relayHubInstance = null;
      let deployedNetwork = null;
      let ganacheAccounts = [];
      let accounts = [];

      let artifactGaslessNFT = {};

      try {
        artifactGaslessNFT = require("./contracts/MetaNFT.json");
      } catch (e) {
        console.log(e);
      }

      accounts = await state.web3.eth.getAccounts();
      console.log("Accounts:", accounts);
      const networkId = await state.web3.eth.net.getId();
      const networkType = await state.web3.eth.net.getNetworkType();
      const isMetaMask = window.ethereum.isMetaMask;
      let balance =
        accounts.length > 0
          ? await state.web3.eth.getBalance(accounts[0])
          : state.web3.utils.toWei("0");

      balance = state.web3.utils.fromWei(balance, "ether");

      if (artifactGaslessNFT.networks) {
        deployedNetwork = artifactGaslessNFT.networks[networkId.toString()];

        if (deployedNetwork) {
          gaslessNFTInstance = new state.web3.eth.Contract(
            artifactGaslessNFT.abi,
            deployedNetwork && deployedNetwork.address
          );
        }
      }
      contractInstance = gaslessNFTInstance;

      setState({
        ...state,
        ganacheAccounts,
        accounts,
        networkId,
        networkType,
        isMetaMask,
        balance,
        gaslessNFTInstance: contractInstance,
        appReady: true,
        artifactGaslessNFT,
        
      });


    };

    if (state.web3) loadNetworkDetails();
  }, [state.web3]);

  useEffect(()=> {

    if(contractInstance){
      setState({...state, gaslessNFT: contractInstance })
    }
  }, [contractInstance]);

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

  const getGaslessNFTName = async () => {
    const { gaslessNFT } = state;
    //Get the Name to prove it's loaded
    const response = await gaslessNFT.methods.name().call();
    console.log("Contract NFT name is: ", response);
    this.setState({ gaslessNFTName: response });
  };

  const mintGaslessNFT = async () => {
    const { accounts, gaslessNFT, totalSupply } = state;
    try {
      console.log("Account minting: ", accounts[0]);
      console.log(gaslessNFT);
      const tx = await gaslessNFT.methods
        .mintWithTokenURI(accounts[0], totalSupply + 1, "first Token1")
        .send({ from: accounts[0], gas: 5000000 });
      console.log("after mint");
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  const initializeGasLessNFT = async () => {
    const { accounts, gaslessNFTInstance } = state;
  console.log("Before initialize: ", gaslessNFTInstance);
    try {
      console.log("Minter Account: ", accounts[0]);
      await gaslessNFTInstance.methods
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
    if (verbose) console.log("Rendering inside GasLessNFTBody");
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
              onClick={() => switchToRelayerBtnPress()}
            >
              Use Relayer
            </Button>
            <Button id="useDeployNFT" onClick={() => initializeGasLessNFT()}>
              Initialize Contract
            </Button>
            <Button id="mintNFT" onClick={() => mintGaslessNFT()}>
              Mint!
            </Button>
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
    <div><Header/>
      {state.route === "nft" && renderGaslessNFTBody()}
      <Footer/>
    </div>
  );
}

export default App;
