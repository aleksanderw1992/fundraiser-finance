import './App.css';
import {ethers} from 'ethers'
import {badgeAbi, badgeAddress, charityFactoryAbi, charityFactoryAddress, ui, usdcAbi, usdcAddress} from "./constants";
import React from 'react';

import {Button, Flex, useDisclosure, useToast, Box, VStack} from '@chakra-ui/react'
import { ConnectButton } from '@web3modal/react'

import FilterCharityForm from './components/FilterCharityForm'
import CreateCharityModal from './components/CreateCharityModal'
import CharityTyle from './components/CharityTyle'

function App() {

  const [charities, setCharities] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [filterFormData, setFilterFormData] = React.useState(
      ui.initialFilterFormData
  );

  const createCharityModal = useDisclosure()
  const toast = useToast()


  function handleChange(setFormData) {
    return function(event) {
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

  function precondition(expression, message) {
    if (!expression) {
      throw message;
    }
  }

  React.useEffect(() => {

    // web3Connect();

  }, []);

  function web3Connect() {
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
  }

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

  function handleCreateContract() {
    console.log('handleCreateContract');
    loadCharites(contracts.charityFactoryContract);
    createCharity(contracts.charityFactoryContract);
    loadCharites(contracts.charityFactoryContract);
  }


  /*
  below are form methods
  */



  function tryCloseCharity(event, charityId, goalMet) {
    event.preventDefault();
    mockTryCloseCharity(charityId, goalMet);
    toast({
      title: 'Fundraising closed!',
      description: `We've successfully closed charity with id ${charityId}!`,
      status: 'success',
      duration: 6000,
      isClosable: true,
    });
  }


  /*
  below are mock functions that should be replaced by calling contract with etherjs
  */

  function withdraw(event, charityId) {
    event.preventDefault();// todo
    toast({
      title: 'Fundraising closed!',
      description: `We've successfully withdrew funds for charity with id ${charityId}!`,
      status: 'success',
      duration: 6000,
      isClosable: true,
    });
  }

  function receiveNft(event, charityId) {
    event.preventDefault(); // todo
    toast({
      title: 'Fundraising closed!',
      description: `We've successfully received nft for charity with id ${charityId}!`,
      status: 'success',
      duration: 6000,
      isClosable: true,
    });
  }


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
      usdcRaised:0,
      ethDonatedByCurrentUser:0,
      usdcDonatedByCurrentUser:0
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

  function mockTryCloseCharity(charityId, goalMet) {
    setCharities(prev => {
      prev.filter(charity => charity.id == charityId).forEach(charity => charity.status = goalMet?1:2); // CLOSED_GOAL_MET
      return [...prev]; // change reference of returned array to force re-rendering
    });
  }

  return (
      <VStack w='100%'>
        {/*todo - delete after development*/}
        <ConnectButton />
        <Box spacing='10px'>
          <FilterCharityForm
              charities={charities}
              handleChangeChakraUiComponents={handleChangeChakraUiComponents}
              setFilterFormData={setFilterFormData}
              filterFormData={filterFormData}
          />
          <Button type="submit" color='red' onClick={createCharityModal.onOpen}>+</Button>
        </Box>

        <CreateCharityModal
            createCharityModal={createCharityModal}
            mockCreateCharity={mockCreateCharity}
            handleChange={handleChange}
            handleChangeChakraUiComponents={handleChangeChakraUiComponents}
            toast={toast}
        />

        <Flex flexWrap="wrap">
          {charities
          .filter(
              (charity) => filterFormData.status === 'ALL_CHARITIES' ? true : ui.enumCharityStatusToString[charity.status] === filterFormData.status)
          .map((charity) =>
              <CharityTyle
                  charity={charity}
                  tryCloseCharity={tryCloseCharity}
                  receiveNft={receiveNft}
                  withdraw={withdraw}
                  mockDonateEth={mockDonateEth}
                  mockDonateUsdc={mockDonateUsdc}
                  toast={toast}
                  handleChange={handleChange}
                  handleChangeChakraUiComponents={handleChangeChakraUiComponents}
                  id={charity.id}
                  key={charity.id}
              />
          )}
        </Flex>
      </VStack>
  );
}

export default App;
