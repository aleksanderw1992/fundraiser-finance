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
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  Stack,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

function App() {
  const [charities, setCharities] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [filterFormData, setFilterFormData] = React.useState(
      {
        status: "ALL_CHARITIES"
      }
  );
  const initialCreateFormDataState = {
    currency: "0",
    goal: 1,
    description: "",
    beneficiary: "0x8fCfcCa3377757dB1b11B417D2375D13ce37F580",
    endDate: 0

  };
  const [createFormData, setCreateFormData] = React.useState(
      initialCreateFormDataState
  );
  const initialDonateFormDataState = {
    donateCurrency: "0",
    contribution: 0.0001,
    charityId: null

  };
  const [donateFormData, setDonateFormData] = React.useState(
      initialDonateFormDataState
  );

  const createCharityModal = useDisclosure()
  const donateModal = useDisclosure()
  const toast = useToast()


  const enumCharityStatusToString = {
    0:'ONGOING',
    1:'CLOSED_GOAL_MET',
    2:'CLOSED_GOAL_NOT_MET'
  }
  const enumCurrencyToString = {
    0:'ETH',
    1:'USDC',
  }

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

  function resetDonateFormDataState() {
    setDonateFormData({...initialDonateFormDataState});
  }
  function resetDonateFormDataStateLeaveCharityId() {
    setDonateFormData(prevFormData => {
      return {
        charityId: prevFormData.charityId,
        contribution: 0.0001,
        donateCurrency: "0"
      }
    });
  }

  function resetCreateFormDataState() {
    setCreateFormData({...initialCreateFormDataState});
  }

  function handleDonate(event) {
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
    toast({
      title: 'Successful donation!',
      description: `We've received donation for charity id ${donateFormData.charityId}. Donation: ${donateFormData.contribution} ${enumCurrencyToString[donateFormData.donateCurrency]}. You may close the window.`,
      status: 'success',
      duration: 6000,
      isClosable: true,
    });
    resetDonateFormDataStateLeaveCharityId();
  }

  function donateModalOpen(event, charityId) {
    event.preventDefault();
    setDonateFormData(prevFormData => {
      return {
        ...prevFormData,
        charityId: charityId
      }
    })
    donateModal.onOpen();
  }

  function tryCloseCharity(event, charityId) {
    event.preventDefault();
    mockTryCloseCharity(charityId);
    toast({
      title: 'Fundraising closed!',
      description: `We've successfully closed charity with id ${charityId}!`,
      status: 'success',
      duration: 6000,
      isClosable: true,
    });
  }

  function handleCreate(event) {
    event.preventDefault();
    mockCreateCharity(createFormData.currency,
        createFormData.goal,
        createFormData.endDate,
        createFormData.description,
        createFormData.beneficiary);

    toast({
          title: 'Charity created!',
          description: `We've created a charity with id ${charities.length} and description ${createFormData.description}. You may close the window.`,
          status: 'success',
          duration: 6000,
          isClosable: true,
        });
    resetCreateFormDataState();
    // console.log(' -- handleCreate - after creation:');
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
            <RadioGroup onChange={(event) => resetDonateFormDataState() & handleChangeChakraUiComponents(setFilterFormData, 'status')(event) } value={filterFormData.status}>
              <Stack>
                <Radio value='ONGOING'>Show only ongoing charities</Radio>
                <Radio value='CLOSED_GOAL_MET'>Finished successfully - ready to receive NFT!</Radio>
                <Radio value='CLOSED_GOAL_NOT_MET'>Finished without success - ready to withdraw funds</Radio>
                <Radio value='ALL_CHARITIES'>Show me all charities</Radio>
              </Stack>
            </RadioGroup>
          </fieldset>
        </form>

        <Button type="submit" color='red' onClick={createCharityModal.onOpen}>+</Button>


        <Modal size="xl" isOpen={createCharityModal.isOpen} onClose={() => resetCreateFormDataState() & createCharityModal.onClose()}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create new charity</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCreate} id="create-new-charity-form">
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
                      precision={5}
                      step={0.2}
                      defaultValue={0.0001}
                      min={0.0001}
                      name="goal"
                      id="goal"
                      value={createFormData.goal}
                      onChange={handleChangeChakraUiComponents(setCreateFormData, 'goal')}
                  >
                    <NumberInputField/>
                    <NumberInputStepper>
                      <NumberIncrementStepper/>
                      <NumberDecrementStepper/>
                    </NumberInputStepper>
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
              </fieldset>
            </form>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} type="submit" form="create-new-charity-form">Add</Button>
            <Button variant='ghost' onClick={() => resetCreateFormDataState() & createCharityModal.onClose()}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>

      </Modal>
      <Modal isOpen={donateModal.isOpen} onClose={() => resetDonateFormDataState() & donateModal.onClose()}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Donate</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleDonate} id="donate-form">
              <fieldset>
                <legend>
                  Donate to charity with id {donateFormData.charityId}
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
                  <FormLabel htmlFor='contribution'>Donation</FormLabel>
                  <NumberInput
                      precision={5}
                      step={0.2}
                      defaultValue={0.0001}
                      min={0.0001}
                      name="contribution"
                      id="contribution"
                      value={donateFormData.contribution}
                      onChange={handleChangeChakraUiComponents(setDonateFormData, 'contribution')}
                  >
                    <NumberInputField/>
                    <NumberInputStepper>
                      <NumberIncrementStepper/>
                      <NumberDecrementStepper/>
                    </NumberInputStepper>
                  </NumberInput>
                  <FormHelperText>Choose the amount of currency that you would like to contribute</FormHelperText>
                </FormControl>
              </fieldset>
            </form>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} type="submit" form="donate-form" disabled={donateFormData.contribution === 0}>+</Button>
            <Button variant='ghost' onClick={() => resetDonateFormDataState() & donateModal.onClose()}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
