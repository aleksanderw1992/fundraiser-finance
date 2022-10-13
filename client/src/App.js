import './App.css';
import {ethers} from 'ethers'
import {badgeAbi, badgeAddress, charityFactoryAbi, charityFactoryAddress, usdcAbi, usdcAddress,} from "./constants";
import React from 'react';

import {
  Badge,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tooltip,
  Flex,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import {Box, VStack} from "@chakra-ui/layout"
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

function App() {
  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo('en-US')
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

  const enumStatusToUi = {
    0: {
      image: 'ongoing',
      tooltip: 'You can still donate to this fundraising',
      color: 'blue',
      text: 'ongoing'
    },
    1: {
      image: 'goal_met',
      tooltip: 'This fundraising is finished. You cannot donate anymore. In case you already have donated you can receive participation NFT',
      color: 'teal',
      text: 'finished'
    },
    2: {
      image: 'goal_not_met',
      tooltip: 'This fundraising is finished. You cannot donate anymore. In case you already have donated you can receive withdraw your funds',
      color: 'brown',
      text: 'finished'
    }
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

  function handleCreateContract() {
    console.log('handleCreateContract');
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
      <VStack w='100%'>
        {/*todo - delete after development*/}
        <Box spacing='10px'>
        <form>
          <Button type="button" onClick={() => console.log(charities)}>Print current charities state (only for debugging</Button>
          <fieldset>
            <legend>Filter charities</legend>
            <RadioGroup onChange={(event) => resetDonateFormDataState() & handleChangeChakraUiComponents(setFilterFormData, 'status')(event) } value={filterFormData.status}>
              <Stack direction={['column', 'row']}>
                <Radio value='ONGOING'>Show only ongoing charities</Radio>
                <Radio value='CLOSED_GOAL_MET'>Finished successfully - ready to receive NFT!</Radio>
                <Radio value='CLOSED_GOAL_NOT_MET'>Finished without success - ready to withdraw funds</Radio>
                <Radio value='ALL_CHARITIES'>Show me all charities</Radio>
              </Stack>
            </RadioGroup>
          </fieldset>
        </form>

        <Button type="submit" color='red' onClick={createCharityModal.onOpen}>+</Button>
        </Box>

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

        <Flex flexWrap="wrap">
          {charities
          .filter((charity) => filterFormData.status === 'ALL_CHARITIES' ? true : enumCharityStatusToString[charity.status] === filterFormData.status)
          .map((charity) =>
              <Box
                  width="220px"
                  height="360px"
                  borderWidth='1px'
                  borderRadius='lg'
                  overflow='hidden'
                  id={charity.id}
                  key={charity.id}
              >
                <Image
                    src={`/img/fundraising_icon_${(charity.id % 8) + 1}.jpeg`}
                    alt='image visualizing fundraising'
                    height='125px'
                    width='220px'
                />
                <Box p='6'>
                  <Box display='flex' alignItems='baseline'>
                    <Tooltip label={enumStatusToUi[charity.status].tooltip}>
                      <Badge borderRadius='full' px='2' colorScheme={enumStatusToUi[charity.status].color}>
                        {enumStatusToUi[charity.status].text}
                      </Badge>
                    </Tooltip>
                  </Box>
          <Box
            color='gray.500'
            fontWeight='semibold'
            letterSpacing='wide'
            fontSize='xs'
            textTransform='uppercase'
            ml='2'
          >
            {charity.ethRaised} ETH &bull; {charity.usdcRaised} USDC &bull;&bull; {charity.goal} {enumCurrencyToString[charity.currency]} needed
          </Box>
        <Box
          mt='1'
          fontWeight='semibold'
          as='h4'
          lineHeight='tight'
          noOfLines={1}
        >
          {charity.status === 0? 'Ending:' : 'Finished:'} {timeAgo.format(new Date(charity.endPeriod))}
        </Box>
                    <Tooltip label={charity.description}>
                      <Box noOfLines={1}>
                          {charity.description}
                      </Box>
                    </Tooltip>
                    {
                      charity.status === 0 &&
                      <Box>
                        <Box>
                          <Button onClick={(event) => donateModalOpen(event, charity.id)}>Donate</Button>
                        </Box>
                        <Box>
                          <Button onClick={(event) => tryCloseCharity(event, charity.id)}>Attempt closing</Button>
                        </Box>
                      </Box>
                    }
                    {
                      charity.status === 1 &&
                      <Box>
                        <Button onClick={(event) => receiveNft(event, charity.id)}>Receive Nft</Button>
                      </Box>
                    }
                    {
                      charity.status === 2 &&
                      <Box>
                        <Button onClick={(event) => withdraw(event, charity.id)}>Withdraw</Button>
                      </Box>
                    }
                </Box>
              </Box>
          )}
        </Flex>
      </VStack>
  );
}

export default App;
