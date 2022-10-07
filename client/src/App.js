import logo from './logo.svg';
import './App.css';
import {ethers} from 'ethers'
import {badgeAbi, badgeAddress, charityFactoryAbi, charityFactoryAddress, usdcAbi, usdcAddress,} from "./constants";

import React from 'react';

function App() {
  const [charities, setCharities] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);

  function precondition(expression, message) {
    if (!expression) {
      throw message;
    }
  }

  React.useEffect(() => {
    const chainId = "31337";
    precondition(!!charityFactoryAddress[chainId] &&
      !!badgeAddress[chainId] &&
      !!usdcAddress[chainId], `Could not find proper address for chain id ${chainId}`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();


    const charityFactoryContract = new ethers.Contract(
        charityFactoryAddress[chainId],
        charityFactoryAbi,
        signer
    );
    const badgeContract = new ethers.Contract(
        badgeAddress[chainId],
        badgeAbi,
        signer
      );
    const usdcContract = new ethers.Contract(
        usdcAddress[chainId],
        usdcAbi,
        signer
      );

    setContracts({
      charityFactoryContract: charityFactoryContract,
      badgeContract: badgeContract,
      usdcContract: usdcContract
    });



  }, []);

  const loadCharites = async (charityFactoryContract) => {

    console.log("before getCharities");
    let result = await charityFactoryContract.getCharities();
    console.log("after getCharities");
    console.log(result);
    setCharities(result);
  };
  const createCharity = async (charityFactoryContract) => {
    console.log("before createCharity");
    const options = {value: ethers.utils.parseEther("0.01"), gasLimit :3000000000}
    var result = await charityFactoryContract.createCharity(0,10,1665031732,"asdf","0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", options);
    console.log("after createCharity");
    console.log(result);
  };

  function handleCreate() {
    console.log('handleCreate');
    loadCharites(contracts.charityFactoryContract);
    createCharity(contracts.charityFactoryContract);
    loadCharites(contracts.charityFactoryContract);
  }


  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <p onClick={handleCreate}>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
