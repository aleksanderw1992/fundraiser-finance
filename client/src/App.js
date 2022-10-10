import './App.css';
import {ethers} from 'ethers'
import {badgeAbi, badgeAddress, charityFactoryAbi, charityFactoryAddress, usdcAbi, usdcAddress,} from "./constants";
import mockCharityFactory from "./helpers/mockCharityFactory";
import React from 'react';

function App() {
  const [charities, setCharities] = React.useState([]);
  const mockCharityFactoryInstance = mockCharityFactory(charities, setCharities);
  const [contracts, setContracts] = React.useState([]);
  const [filterFormData, setFilterFormData] = React.useState(
      {
        status: "allCharities"
      }
  );
  const [createFormData, setCreateFormData] = React.useState(
      {
        currency: "0",
        goal: "0",
        description: "",
        beneficiary: "0x8fCfcCa3377757dB1b11B417D2375D13ce37F580"

      }
  );
  const [donateFormData, setDonateFormData] = React.useState(
      {
        currency: "0",
        contribution: "0",
        charityId: null

      }
  );
  function handleChange(setFormData) {
    return function(event) {
      console.log(event)
      const {name, value, type, checked} = event.target
      setFormData(prevFormData => {
        return {
          ...prevFormData,
          [name]: type === "checkbox" ? checked : value
        }
      })
    }
  }

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
    const options = {value: ethers.utils.parseEther("0.01"), gasLimit: 3000000000}
    var result = await charityFactoryContract.createCharity(0, 10, 1665031732, "asdf", "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266", options);
    console.log("after createCharity");
    console.log(result);
  };

  function handleCreate() {
    console.log('handleCreate');
    loadCharites(contracts.charityFactoryContract);
    createCharity(contracts.charityFactoryContract);
    loadCharites(contracts.charityFactoryContract);
  }

  function mockHandleCreate() {
    mockCharityFactoryInstance.createCharity(createFormData.currency,
        createFormData.goal,
        new Date().getMilliseconds(),
        createFormData.description,
        createFormData.beneficiary);
    let newArr = mockCharityFactoryInstance.getCharities();
    console.log(newArr);
  }

  function donate() {
    setDonateFormData(prevFormData => {
      return {
        ...prevFormData,
        charityId: null
      }
    })
  }

  function donateModalOpen(charityId) {
    setDonateFormData(prevFormData => {
      return {
        ...prevFormData,
        charityId: charityId
      }
    })
  }

  function tryCloseCharity(charityId) {
    mockCharityFactory.tryCloseCharity(charityId);
    setDonateFormData(prevFormData => {
      return {
        ...prevFormData,
        charityId: charityId
      }
    })
  }

  return (
      <div>
        <fieldset>
        <legend>Filter charities</legend>
          <label htmlFor="eligibleToReceiveNft">
            Finished successfully - ready to receive NFT!
            <input
                type="radio"
                name="status"
                id="eligibleToReceiveNft"
                value="eligibleToReceiveNft"
                onChange={handleChange(setFilterFormData)}
                checked={filterFormData.status=== "eligibleToReceiveNft"}
            ></input>
          </label>
          <label htmlFor="eligibleToWithdrawFunds">
            Finished without success - ready to withdraw funds
            <input
                type="radio"
                name="status"
                id="eligibleToWithdrawFunds"
                value="eligibleToWithdrawFunds"
                onChange={handleChange(setFilterFormData)}
                checked={filterFormData.status=== "eligibleToWithdrawFunds"}

            ></input>
          </label>
          <label htmlFor="allCharities">
            Show me all charities
            <input
                type="radio"
                name="status"
                id="allCharities"
                value="allCharities"
                onChange={handleChange(setFilterFormData)}
                checked={filterFormData.status=== "allCharities"}

            ></input>
          </label>
        </fieldset>

        <p>
          Create new charity
        </p>
        <form onSubmit={mockHandleCreate}>
          <label>
            Choose the currency:
            <select
                id="currency"
                name="currency"
                value={createFormData.currency}
                onChange={handleChange(setCreateFormData)}>
              <option value="0">ETH</option>
              <option value="1">USDC</option>
            </select>
          </label>
          <label htmlFor="goal">
            Choose goal:
            <input
                type="number"
                name="goal"
                id="goal"
                value={createFormData.goal}
                onChange={handleChange(setCreateFormData)}
            ></input>
          </label>
          <label htmlFor="description">
            Write a few words about it:
            <input
                type="text"
                name="description"
                id="description"
                value={createFormData.description}
                onChange={handleChange(setCreateFormData)}
            ></input>
          </label>
          <label htmlFor="beneficiary">
            Write an address of beneficiary. Beneficiary will be eligible to receive all funds after the goal is met. By default it should be your
            address but please double check this
            <input
                type="text"
                name="beneficiary"
                id="beneficiary"
                value={createFormData.beneficiary}
                onChange={handleChange(setCreateFormData)}
            ></input>
          </label>
          {/*to do end date*/}
          <button>+</button>
        </form>

        {(donateFormData.charityId ) &&
        <form onSubmit={donate}>
          <legend>
            Donate to charity modal
          </legend>
          <label>
            Choose the currency:
            <select
                id="donateCurrency"
                name="donateCurrency"
                value={donateFormData.currency}
                onChange={handleChange(setDonateFormData)}>
              <option value="0">ETH</option>
              <option value="1">USDC</option>
            </select>
          </label>
          <label htmlFor="contribution">
            Choose goal:
            <input
                type="number"
                name="contribution"
                id="contribution"
                value={donateFormData.contribution}
            ></input>
          </label>
          <button>+</button>
        </form>
        }
        <div>
          {charities
          .filter((charity) => filterFormData.status ==='allCharities'?true : charity.status === filterFormData.status)
          .map((charity) =>
              <div id={charity.id} key={charity.id}>
                {charity.id} {charity.currency} {charity.goal} {charity.description} {charity.endPeriod} {charity.status}
                <button onClick={() => donateModalOpen(charity.id)}>Donate</button>
                <button onClick={() => tryCloseCharity(charity.id)}>Attempt closing</button>
              </div>
          )}
        </div>
      </div>
  );
}

export default App;
/*
1. states for those forms so that it is clickable
2. chakra-ui interface
 */
