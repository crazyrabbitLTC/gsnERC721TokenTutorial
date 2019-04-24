import React, { Component } from "react";
import getWeb3, { getGanacheWeb3, useRelayer} from "./utils/getWeb3";
import Header from "./components/Header/index.js";
import Footer from "./components/Footer/index.js";
import Hero from "./components/Hero/index.js";
import Web3Info from "./components/Web3Info/index.js";
import CounterUI from "./components/Counter/index.js";
import GaslessCounterUI from "./components/GaslessCounter/index.js";
import Wallet from "./components/Wallet/index.js";
import Instructions from "./components/Instructions/index.js";
import { Loader, Button } from 'rimble-ui';

import { zeppelinSolidityHotLoaderOptions } from '../config/webpack';

import styles from './App.module.scss';

class App extends Component {
  state = {
    storageValue: 0,
    web3: null,
    accounts: null,
    contract: null,
    route: window.location.pathname.replace("/",""),
    gaslessNFTName: "none set"
  };

  getGanacheAddresses = async () => {
    if (!this.ganacheProvider) {
      this.ganacheProvider = getGanacheWeb3();
    }
    if (this.ganacheProvider) {
      return await this.ganacheProvider.eth.getAccounts();
    }
    return [];
  }

  componentDidMount = async () => {
    const hotLoaderDisabled = zeppelinSolidityHotLoaderOptions.disabled;
    let GaslessCounter = {};
    let GaslessNFT = {};
    let Counter = {};
    let Wallet = {};
    try {
      GaslessCounter = require("./contracts/GaslessCounter.json");
      GaslessNFT = require("./contracts/MetaNFT.json");
      Counter = require("./contracts/Counter.json");
      Wallet = require("./contracts/Wallet.json");
    } catch (e) {
      console.log(e);
    }
    try {
      const isProd = process.env.NODE_ENV === 'production';
      if (!isProd) {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();
        let ganacheAccounts = [];
        try {
          ganacheAccounts = await this.getGanacheAddresses();
        } catch (e) {
          console.log('Ganache is not running');
        }
        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();
        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        const isMetaMask = web3.currentProvider.isMetaMask;
        let balance = accounts.length > 0 ? await web3.eth.getBalance(accounts[0]): web3.utils.toWei('0');
        balance = web3.utils.fromWei(balance, 'ether');
        let gaslessInstance = null;
        let gaslessNFTInstance = null;
        let instance = null;
        let instanceWallet = null;
        let deployedNetwork = null;
        if (GaslessCounter.networks) {
          deployedNetwork = GaslessCounter.networks[networkId.toString()];
          if (deployedNetwork) {
            gaslessInstance = new web3.eth.Contract(
              GaslessCounter.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (GaslessNFT.networks) {
          deployedNetwork = GaslessNFT.networks[networkId.toString()];
          if (deployedNetwork) {
            gaslessNFTInstance = new web3.eth.Contract(
              GaslessNFT.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (Counter.networks) {
          deployedNetwork = Counter.networks[networkId.toString()];
          if (deployedNetwork) {
            instance = new web3.eth.Contract(
              Counter.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (Wallet.networks) {
          deployedNetwork = Wallet.networks[networkId.toString()];
          if (deployedNetwork) {
            instanceWallet = new web3.eth.Contract(
              Wallet.abi,
              deployedNetwork && deployedNetwork.address,
            );
          }
        }
        if (gaslessNFTInstance || gaslessInstance || instance || instanceWallet) {
          // Set web3, accounts, and contract to the state, and then proceed with an
          // example of interacting with the contract's methods.
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled,
            isMetaMask, gaslessNFT: gaslessNFTInstance, gaslessContract: gaslessInstance, contract: instance, wallet: instanceWallet }, () => {
              this.refreshValues(gaslessNFTInstance, gaslessInstance, instance, instanceWallet);
              setInterval(() => {
                this.refreshValues(gaslessNFTInstance, gaslessInstance, instance, instanceWallet);
              }, 5000);
            });
        }
        else {
          this.setState({ web3, ganacheAccounts, accounts, balance, networkId, networkType, hotLoaderDisabled, isMetaMask });
        }
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshValues = (gaslessNFTInstance, gaslessInstance, instance, instanceWallet) => {
    if (instance) {
      this.getCount();
    }
    if (gaslessInstance) {
      this.getGaslessCount();
    }
    if(gaslessNFTInstance){
      this.getGaslessNFTName();
    }
    if (instanceWallet) {
      this.updateTokenOwner();
    }
  }

  getCount = async () => {
    const { contract } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getCounter().call();
    // Update state with the result.
    this.setState({ count: response });
  };

  getGaslessCount = async () => {
    const { gaslessContract } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await gaslessContract.methods.getCounter().call();
    // Update state with the result.
    this.setState({ gaslessCount: response });
  };

  getGaslessNFTName = async () => {
    const {gaslessNFT} = this.state;
    //Get the Name to prove it's loaded
    const response = await gaslessNFT.methods.name().call();
    console.log("Contract NFT name is: ", response);
    this.setState({gaslessNFTName: response});
  }

  updateTokenOwner = async () => {
    const { wallet, accounts } = this.state;
    // Get the value from the contract to prove it worked.
    const response = await wallet.methods.owner().call();
    // Update state with the result.
    this.setState({ tokenOwner: response.toString() === accounts[0].toString() });
  };

  increaseCount = async (number) => {
    const { accounts, contract } = this.state;
    await contract.methods.increaseCounter(number).send({ from: accounts[0] });
    this.getCount();
  };

  decreaseCount = async (number) => {
    const { accounts, contract } = this.state;
    await contract.methods.decreaseCounter(number).send({ from: accounts[0] });
    this.getCount();
  };

  increaseGaslessCount = async (number) => {
    const { accounts, gaslessContract } = this.state;
    try {
      await gaslessContract.methods.increaseCounter(number).send({ from: accounts[0] });
    } catch (err) {
      window.alert(err);
    }
    this.getGaslessCount();
  };

  initializeGasLessNFT = async () => {
    const {accounts, gaslessNFT } = this.state;
    try {
      await gaslessNFT.methods.initialize("Dennison Token", "DT", [accounts[0]], [accounts[0]]).send({from: accounts[0], gas: 5000000});
    } catch (error) {
      console.log(error)
    }
  }

  mintGaslessNFT = async () => {
    const {accounts, gaslessNFT} = this.state;
  }

  decreaseGaslessCount = async (number) => {
    const { accounts, gaslessContract } = this.state;
    try {
      await gaslessContract.methods.decreaseCounter(number).send({ from: accounts[0] });
    } catch(err) {
      window.alert(err);
    }
    this.getGaslessCount();
  };

  renounceOwnership = async (number) => {
    const { accounts, wallet } = this.state;
    await wallet.methods.renounceOwnership().send({ from: accounts[0] });
    this.updateTokenOwner();
  };

  useRelayerBtnPress() {
    var btn = document.getElementById('useRelayerBtn');
    btn.disabled = true;
    btn.innerText = 'Using Relayer';
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
          Your <b> contracts are not deployed</b> in this network. Two potential reasons: <br />
          <p>
            Maybe you are in the wrong network? Point Metamask to localhost.<br />
            You contract is not deployed. Follow the instructions below.
          </p>
        </div>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name={instructionsKey} accounts={this.state.accounts}/>
      </div>
    );
  }

  renderGaslessNFTBody() {
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {this.state.web3 && !this.state.gaslessContract && (
          this.renderDeployCheck('gasless-counter')
        )}
        {this.state.web3 && this.state.gaslessContract && (
          <div className={styles.contracts}>
            <h1>Gasless NFT Contract</h1>
            <p>In order to make gasless transactions, press the 'Use Relayer' button below. </p>
            <p>(to stop using relayer simply refresh the page)</p>
            <Button id='useRelayerBtn' onClick={() => this.useRelayerBtnPress()}>
              Use Relayer
            </Button>
            <Button id='useDeployNFT' onClick={() => this.initializeGasLessNFT()}>
              Initialize Contract
            </Button>
            The name of your NFT is: {this.state.gaslessNFTName}
            <div className={styles.widgets}>
            </div>

          </div>
        )}
      </div>
    );
  }

  renderGaslessBody() {
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {this.state.web3 && !this.state.gaslessContract && (
          this.renderDeployCheck('gasless-counter')
        )}
        {this.state.web3 && this.state.gaslessContract && (
          <div className={styles.contracts}>
            <h1>Gasless Counter Contract</h1>
            <p>In order to make gasless transactions, press the 'Use Relayer' button below. </p>
            <p>(to stop using relayer simply refresh the page)</p>
            <Button id='useRelayerBtn' onClick={() => this.useRelayerBtnPress()}>
              Use Relayer
            </Button>
            <div className={styles.widgets}>
              <Web3Info {...this.state} />
              <GaslessCounterUI
                decrease={this.decreaseGaslessCount}
                increase={this.increaseGaslessCount}
                {...this.state} />
            </div>
              <Instructions
                ganacheAccounts={this.state.ganacheAccounts}
                name="gasless-upgrade" accounts={this.state.accounts} />
          </div>
        )}
      </div>
    );
  }

  renderBody() {
    const { hotLoaderDisabled, networkType, accounts, ganacheAccounts } = this.state;
    const updgradeCommand = (networkType === 'private' && !hotLoaderDisabled) ? "upgrade-auto" : "upgrade";
    return (
      <div className={styles.wrapper}>
        {!this.state.web3 && this.renderLoader()}
        {this.state.web3 && !this.state.contract && (
          this.renderDeployCheck('counter')
        )}
        {this.state.web3 && this.state.contract && (
          <div className={styles.contracts}>
            <h1>Counter Contract is good to Go!</h1>
            <p>Interact with your contract on the right.</p>
            <p> You can see your account onfo on the left </p>
            <div className={styles.widgets}>
              <Web3Info {...this.state} />
              <CounterUI
                decrease={this.decreaseCount}
                increase={this.increaseCount}
                {...this.state} />
            </div>
            {this.state.balance < 0.1 && (
              <Instructions
                ganacheAccounts={ganacheAccounts}
                name="metamask"
                accounts={accounts} />
            )}
            {this.state.balance >= 0.1 && (
              <Instructions
                ganacheAccounts={this.state.ganacheAccounts}
                name={updgradeCommand}
                accounts={accounts} />
            )}
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
          name="setup" accounts={this.state.accounts} />
      </div>
    );
  }

  renderFAQ() {
    return (
      <div className={styles.wrapper}>
        <Instructions
          ganacheAccounts={this.state.ganacheAccounts}
          name="faq" accounts={this.state.accounts} />
      </div>
    );
  }

  renderEVM() {
    return (
      <div className={styles.wrapper}>
      {!this.state.web3 && this.renderLoader()}
      {this.state.web3 && !this.state.wallet && (
        this.renderDeployCheck('evm')
      )}
      {this.state.web3 && this.state.wallet && (
        <div className={styles.contracts}>
          <h1>Wallet Contract is good to Go!</h1>
          <p>Interact with your contract on the right.</p>
          <p> You can see your account onfo on the left </p>
          <div className={styles.widgets}>
            <Web3Info {...this.state} />
            <Wallet
              renounce={this.renounceOwnership}
              {...this.state} />
          </div>
          <Instructions
            ganacheAccounts={this.state.ganacheAccounts}
            name="evm" accounts={this.state.accounts} />
        </div>
      )}
      </div>
    );
  }

  render() {
    return (
      <div className={styles.App}>
        <Header />
          {this.state.route === '' && this.renderInstructions()}
          {this.state.route === 'nft' && this.renderGaslessNFTBody()}
          {this.state.route === 'counter' && this.renderBody()}
          {this.state.route === 'gasless-counter' && this.renderGaslessBody()}
          {this.state.route === 'evm' && this.renderEVM()}
          {this.state.route === 'faq' && this.renderFAQ()}
        <Footer />
      </div>
    );
  }
}

export default App;
