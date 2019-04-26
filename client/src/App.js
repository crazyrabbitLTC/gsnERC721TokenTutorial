import React, { useState, useEffect } from "react";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import { zeppelinSolidityHotLoaderOptions } from "../config/webpack";

import { Loader, Button } from "rimble-ui";
import styles from "./App.module.scss";

const tabookey = require("tabookey-gasless");
const getWeb3 = require("@drizzle-utils/get-web3");
let contractInstance;

function App() {
  const initialState = {
    web3: null,
    accounts: null,
    networkId: null,
    networkType: null,
    route: window.location.pathname.replace("/", ""),
    contractInstance: null,
    appReady: false,
    totalSupply: 0,
    gaslessNFTName: "none set"
  };

  const initialContractState = {
    name: "",
    symbol: "",
    totalSupply: 0,
    userBalance: 0,
    refresh: false,
  };

  const [state, setState] = useState(initialState);
  const [contractState, setContractState] = useState(initialContractState);

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

      contractArtifact = require("../../contracts/MetaNFT.sol");
      //contractArtifact = require("../../build/contracts/MetaNFT.json");

      accounts = await web3.eth.getAccounts();
     // console.log("Accounts", accounts);
      networkId = await web3.eth.net.getId();
      //console.log("NetowkrID", networkId);
      networkType = await web3.eth.net.getNetworkType();
     // console.log("NetworkType", networkType);

      if (contractArtifact.networks) {
     //   console.log("Contract Artifact: ", contractArtifact);
        deployedNetwork = contractArtifact.networks[networkId.toString()];
     //   console.log("Deployed NEtwork", deployedNetwork);
        if (deployedNetwork) {
          contractInstance = new web3.eth.Contract(
            contractArtifact.abi,
            deployedNetwork && deployedNetwork.address
          );
        }
    //    console.log("Contract Instance", contractInstance);
      }

      setState({
        ...state,
        web3,
        accounts,
        networkId,
        networkType,
        contractInstance,
        appReady: true
      });
    };

    loadNetworkDetails();
    //console.log("THE STATE", state);
  }, [state.appReady, window.ethereum]);

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
    console.log("Relay provider:", RelayProvider);
    var provider = new RelayProvider(state.web3.currentProvider, {
      txfee: 12,
      force_gasLimit: 6000000
    });
    state.web3.setProvider(provider);
    console.log("Using Relayer");
  };

  useEffect(() => {
    let { name, symbol, totalSupply, userBalance } = initialContractState;
    let { contractInstance, accounts } = state;

    const loadContract = async () => {
      name = await contractInstance.methods.name().call();
      symbol = await contractInstance.methods.symbol().call();
      totalSupply = await contractInstance.methods.totalSupply().call();
      userBalance = await contractInstance.methods
        .balanceOf(accounts[0])
        .call();

      totalSupply = Number(totalSupply.toString());
      userBalance = Number(userBalance.toString());

      setContractState({ name, symbol, totalSupply, userBalance, refresh: false });
    };

    if (state.appReady) loadContract();
  }, [state.appReady]);



  const mintGaslessNFT = async () => {
    const { accounts, contractInstance} = state;
    const {totalSupply} = contractState;
    try {
      const tx = await contractInstance.methods
        .mintWithTokenURI(accounts[0], totalSupply + 1, "first Token1")
        .send({ from: accounts[0]});
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
      const tx = await contractInstance.methods
        .initialize(
          "Dennison Token",
          "DT",
          [accounts[0], "0x9C57C0F1965D225951FE1B2618C92Eefd687654F"],
          [accounts[0]]
        )
        .send({ from: accounts[0], gas: 5000000 });
      console.log("Transaction: ", tx);
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
            <Button size="small" id="switchToRelayerBtn" onClick={() => switchToRelayer()}>
              Use Relayer
            </Button>
            <Button size="small" id="useDeployNFT" onClick={() => initializeGasLessNFT()}>
              Initialize Contract
            </Button>
            <Button size="small" id="mintNFT" onClick={() => mintGaslessNFT()}>
              Mint!
            </Button>
            <Button size="small" onClick={() => refreshApp()}>Refresh</Button>
            The name of your NFT is: {contractState.name}
            <br />
            The total supply of your NFT is: {contractState.totalSupply}
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
      <Button size="small" onClick={event => refreshApp()}>Refresh</Button>
      <Footer />
    </div>
  );
}

export default App;
