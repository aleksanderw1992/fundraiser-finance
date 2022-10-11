import './App.css';
import {ethers} from 'ethers'
import {badgeAbi, badgeAddress, charityFactoryAbi, charityFactoryAddress, usdcAbi, usdcAddress,} from "./constants";
import React from 'react';

import {
  Button,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  Stack
} from '@chakra-ui/react'

function App() {
  const [charities, setCharities] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [filterFormData, setFilterFormData] = React.useState(
      {
        status: "ALL_CHARITIES"
      }
  );
  const [createFormData, setCreateFormData] = React.useState(
      {
        currency: "0",
        goal: 0,
        description: "",
        beneficiary: "0x8fCfcCa3377757dB1b11B417D2375D13ce37F580",
        endDate: 0

      }
  );
  const [donateFormData, setDonateFormData] = React.useState(
      {
        donateCurrency: "0",
        contribution: 0,
        charityId: null

      }
  );
  const enumCharityStatusToString = {
    0:'ONGOING',
    1:'CLOSED_GOAL_MET',
    2:'CLOSED_GOAL_NOT_MET'
  }

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

  function handleChangeChakraUiComponents(setFormData, field) {
    return function (newVal) {
      setFormData(prevFormData => {
        return {
          ...prevFormData,
          [field]: newVal
        }
      })
    }
  }

  function handleSelectChange(e) {
    console.log(e);
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


  /*
  below are form methods
  */

  function resetDonateState() {
    setDonateFormData(prevFormData => {
      return {
        ...prevFormData,
        contribution: 0,
        charityId: null
      }
    });
  }

  function donate(event) {
    event.preventDefault();
    switch (donateFormData.donateCurrency) {
      case '0':
        mockDonateEth(donateFormData.charityId,donateFormData.contribution);
        break;
      case '1':
        mockDonateUsdc(donateFormData.charityId,donateFormData.contribution);
        break;
    }
    // close modal
    resetDonateState();
  }

  function donateModalOpen(event, charityId) {
    event.preventDefault();
    setDonateFormData(prevFormData => {
      return {
        ...prevFormData,
        charityId: charityId
      }
    })
  }

  function tryCloseCharity(event, charityId) {
    event.preventDefault();
    mockTryCloseCharity(charityId);
  }

  function mockHandleCreate(event) {
    event.preventDefault();
    mockCreateCharity(createFormData.currency,
        createFormData.goal,
        createFormData.endDate,
        createFormData.description,
        createFormData.beneficiary);
    // console.log(' -- mockHandleCreate - after creation:');
    // console.log(charities);
  }


  /*
  below are mock functions that should be replaced by calling contract with etherjs
  */

  function mockCreateCharity(currency, goal, endPeriod, description, beneficiary) {
    setCharities(prev => [...prev, {
      id: prev.length,
      currency:currency,
      goal:goal,
      endPeriod:endPeriod,
      description:description,
      beneficiary:beneficiary,
      status:0,
      ethRaised:0,
      usdcRaised:0
    }]);
    // console.log(' -- mockCreateCharity - after creation:');
    // console.log(charities);
  }

  function mockDonateEth(charityId, eth) {
    const newEth = charities.filter(charity => charity.id == charityId)[0].ethRaised + parseFloat(eth);
    setCharities(prev => {
      console.log(prev);
      prev.filter(charity => charity.id == charityId).forEach(charity => charity.ethRaised = newEth);
      return prev;
    });
  }

  function mockDonateUsdc(charityId, usdc) {
    const newUsdc = charities.filter(charity => charity.id == charityId)[0].usdcRaised + parseFloat(usdc);
    setCharities(prev => {
      prev.filter(charity => charity.id == charityId).forEach(charity => charity.usdcRaised = newUsdc);
      return prev;
    });
  }

  function mockTryCloseCharity(charityId) {
    setCharities(prev => {
      prev.filter(charity => charity.id == charityId).forEach(charity => charity.status = 1); // CLOSED_GOAL_MET
      return [...prev]; // change reference of returned array to force re-rendering
    });
  }

  return (
      <Container>
        {/*todo - delete after development*/}
        <form>
          <Button type="button" onClick={() => console.log(charities)}>Print current charities state (only for debugging</Button>
          <fieldset>
            <legend>Filter charities</legend>
            <RadioGroup onChange={(event) => resetDonateState() & handleChangeChakraUiComponents(setFilterFormData, 'status')(event) } value={filterFormData.status}>
              <Stack>
                <Radio value='ONGOING'>Show only ongoing charities</Radio>
                <Radio value='CLOSED_GOAL_MET'>Finished successfully - ready to receive NFT!</Radio>
                <Radio value='CLOSED_GOAL_NOT_MET'>Finished without success - ready to withdraw funds</Radio>
                <Radio value='ALL_CHARITIES'>Show me all charities</Radio>
              </Stack>
            </RadioGroup>
          </fieldset>
        </form>

        <form onSubmit={mockHandleCreate}>
          <fieldset>
            <legend>Create new charity</legend>

            <FormControl isRequired>
              <FormLabel htmlFor='currency'>Currency</FormLabel>
              <Select
                  id="currency"
                  name="currency"
                  value={createFormData.currency}
                  onChange={handleChange(setCreateFormData)}
                  variant='outline'
              >
                <option value='0'>ETH</option>
                <option value='1'>USDC</option>
              </Select>
              <FormHelperText>Choose the currency in which you would like the goal to be set!</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='goal'>Goal</FormLabel>
              <NumberInput
                  defaultValue={0}
                  min={0}
                  name="goal"
                  id="goal"
                  onChange={handleChangeChakraUiComponents(setCreateFormData, 'goal')}
              >
                <NumberInputField/>
              </NumberInput>
              <FormHelperText>Choose the amount of currency that you need to raise</FormHelperText>
            </FormControl>
            <FormControl isRequired>
              <FormLabel htmlFor='description'>Description</FormLabel>
              <Input
                  placeholder="Description ... "
                  type="text"
                  name="description"
                  id="description"
                  value={createFormData.description}
                  onChange={handleChange(setCreateFormData)}
              />
              <FormHelperText>Write a few words about your fundraising</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='beneficiary'>
                Beneficiary address
              </FormLabel>
              <Input
                  placeholder="Eg. 0x8fCfcCa3377757dB1b11B417D2375D13ce37F580"
                  type="text"
                  name="beneficiary"
                  id="beneficiary"
                  value={createFormData.beneficiary}
                  onChange={handleChange(setCreateFormData)}
              />
              <FormHelperText>Write an address of beneficiary. Beneficiary will be eligible to receive all funds after the goal is met. By default it should be your
                address but please double check this</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='endDate'>
                Deadline / End date
              </FormLabel>
              <Input
                  placeholder="Eg. 2022-10-23T18:58"
                  type="datetime-local"
                  name="endDate"
                  id="endDate"
                  value={createFormData.endDate}
                  onChange={handleChange(setCreateFormData)}
              />
              <FormHelperText>When fundraising is going to end?</FormHelperText>
            </FormControl>
            <Button type="submit" color='red' >+</Button>
          </fieldset>
        </form>

        {(donateFormData.charityId !=null ) &&
        <form onSubmit={donate}>
          <fieldset>
            <legend>
              Donate to charity modal -> id: {donateFormData.charityId}
            </legend>

            <FormControl isRequired>
              <FormLabel htmlFor='donateCurrency'>Currency</FormLabel>
              <Select
                  id="donateCurrency"
                  name="donateCurrency"
                  value={donateFormData.donateCurrency}
                  onChange={handleChange(setDonateFormData)}
                  variant='outline'
              >
                <option value='0'>ETH</option>
                <option value='1'>USDC</option>
              </Select>
              <FormHelperText>Choose the currency in which you would like to make donation for a goal</FormHelperText>
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor='contribution'>Goal</FormLabel>
              <NumberInput
                  defaultValue={0}
                  min={0}
                  name="contribution"
                  id="contribution"
                  onChange={handleChangeChakraUiComponents(setDonateFormData, 'contribution')}
              >
                <NumberInputField/>
              </NumberInput>
              <FormHelperText>Choose the amount of currency that you would like to contribute</FormHelperText>
            </FormControl>

            <Button type="submit" color='red'>+</Button>
          </fieldset>
        </form>
        }
        <div>
          {charities
          .filter((charity) => filterFormData.status === 'ALL_CHARITIES' ? true : enumCharityStatusToString[charity.status] === filterFormData.status)
          .map((charity) =>
              <div id={charity.id} key={charity.id}>
                id:{charity.id} |
                currency:{charity.currency} |
                goal:{charity.goal} |
                desc:{charity.description} |
                end:{charity.endPeriod} |
                status:{charity.status} |
                usdcRaised:{charity.usdcRaised} |
                ethRaised:{charity.ethRaised} |
                <Button onClick={(event) => donateModalOpen(event, charity.id)}>Donate</Button>
                <Button onClick={(event) => tryCloseCharity(event, charity.id)}>Attempt closing</Button>
              </div>
          )}
        </div>
      </Container>
  );
}

export default App;
