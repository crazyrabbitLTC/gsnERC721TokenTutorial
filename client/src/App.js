import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, useRelayer } from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Hero from "./components/Hero/index.js";
import Instructions from "./components/Instructions/index.js";
import { Loader, Button } from "rimble-ui";

import { zeppelinSolidityHotLoaderOptions } from "../config/webpack";

import styles from "./App.module.scss";

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    route: window.location.pathname.replace("/", ""),
    gaslessNFTName: "none set",
    totalSupply: 0
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  };

  componentDidMount = async () => {
    const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;

    let GaslessNFT = {};

    try {
      GaslessNFT = require("./contracts/MetaNFT.json");
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === "production";
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        let ganacheAccounts = [];
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log("Ganache is not running");
        }
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance =
          accounts.length > 0
            ? await web3.eth.getBalance(accounts[0])
            : web3.utils.toWei("0");
        balance = web3.utils.fromWei(balance, "ether");
        let gaslessNFTInstance = null;
        let deployedNetwork = null;

        if (GaslessNFT.networks) {
          console.log("Deployed networks for NFT", GaslessNFT.networks);
          deployedNetwork = GaslessNFT.networks[networkId.toString()];
          if (deployedNetwork) {
            gaslessNFTInstance = new web3.eth.Contract(
              GaslessNFT.abi,
              deployedNetwork && deployedNetwork.address
            );
          }
        }

        if (gaslessNFTInstance) {
          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState(
            {
              web3,
              ganacheAccounts,
              accounts,
              balance,
              networkId,
              networkType,
              hotLoaderDisabled,
              isMetaMask,
              gaslessNFT: gaslessNFTInstance
            },
            () => {
              this.refreshValues(gaslessNFTInstance);
              setInterval(() => {
                this.refreshValues(gaslessNFTInstance);
              }, 2500);
            }
          );
        } else {
          this.setState({
            web3,
            ganacheAccounts,
            accounts,
            balance,
            networkId,
            networkType,
            hotLoaderDisabled,
            isMetaMask
          });
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = gaslessNFTInstance => {
    if (gaslessNFTInstance) {
      this.getGaslessNFTName();
      this.getTotalNFTSupply();
    }
  };

  getGaslessNFTName = async () => {
    const { gaslessNFT } = this.state;
    //Get the Name to prove it's loaded
    const response = await gaslessNFT.methods.name().call();
    console.log("Contract NFT name is: ", response);
    this.setState({ gaslessNFTName: response });
  };

  initializeGasLessNFT = async () => {
    const { accounts, gaslessNFT } = this.state;
    try {
      console.log("Minter Account: ", accounts[0]);
      await gaslessNFT.methods
        .initialize("Dennison Token", "DT", [accounts[0],'0x9C57C0F1965D225951FE1B2618C92Eefd687654F'], [accounts[0]])
        .send({ from: accounts[0], gas: 5000000 });
    } catch (error) {
      console.log(error);
    }
  };

  mintGaslessNFT = async () => {
    const { accounts, gaslessNFT, totalSupply } = this.state;
    try {
      console.log("Account minting: ", accounts[0]);
      console.log(gaslessNFT);
      const tx = await gaslessNFT.methods.mintWithTokenURI(accounts[0], totalSupply+1, "first Token1").send({ from: accounts[0], gas: 5000000 });
      console.log("after mint");
      console.log(tx);
    } catch (error) {
      console.log(error);
    }
  };

  getTotalNFTSupply = async () => {
    const { gaslessNFT } = this.state;
    try {
      const response = await gaslessNFT.methods.totalSupply().call();
      this.setState({ totalSupply: response.toString() });
    } catch (error) {
      console.log(error);
    }
  };

  useRelayerBtnPress() {
    var btn = document.getElementById("useRelayerBtn");
    btn.disabled = true;
    btn.innerText = "Using Relayer";
    useRelayer(this.state.web3);
  }

  renderLoader() {
    return (
      <div className={styles.loader}>
        <Loader size="80px" color="red" />
        <h3> Loading Web3, accounts, and contract...</h3>
        <p> Unlock your metamask </p>
      </div>
    );
  }

  renderDeployCheck(instructionsKey) {
    return (
      <div className={styles.setup}>
        <div className={styles.notice}>
          Your <b> contracts are not deployed</b> in this network. Two potential
          reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.
            <br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey}
          accounts={this.state.accounts}
        />
      </div>
    );
  }

  renderGaslessNFTBody() {
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {/* {this.state.web3 &&
          !this.state.gaslessContract &&
          this.renderDeployCheck("gasless-counter")} */}
        {this.state.web3 && this.state.gaslessNFT && (
          <div className={styles.contracts}>
            <h1>Gasless NFT Contract</h1>
            <p>
              In order to make gasless transactions, press the 'Use Relayer'
              button below.{" "}
            </p>
            <p>(to stop using relayer simply refresh the page)</p>
            <Button
              id="useRelayerBtn"
              onClick={() => this.useRelayerBtnPress()}
            >
              Use Relayer
            </Button>
            <Button
              id="useDeployNFT"
              onClick={() => this.initializeGasLessNFT()}
            >
              Initialize Contract
            </Button>
            <Button id="mintNFT" onClick={() => this.mintGaslessNFT()}>
              Mint!
            </Button>
            The name of your NFT is: {this.state.gaslessNFTName}
            <br />
            The total supply of your NFT is: {this.state.totalSupply}
            <div className={styles.widgets} />
          </div>
        )}
      </div>
    );
  }

  renderInstructions() {
    return (
      <div className={styles.wrapper}>
        <Hero />
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name="setup"
          accounts={this.state.accounts}
        />
      </div>
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
        {this.state.route === "" && this.renderInstructions()}
        {this.state.route === "nft" && this.renderGaslessNFTBody()}
        {this.state.route === "counter" && this.renderBody()}
        {this.state.route === "gasless-counter" && this.renderGaslessBody()}

        <Footer />
      </div>
    );
  }
}

export default App;
