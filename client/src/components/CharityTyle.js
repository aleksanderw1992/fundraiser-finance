import React from 'react';
import {Image} from "@chakra-ui/image";
import {Badge, Box} from "@chakra-ui/layout";
import {Tooltip} from "@chakra-ui/tooltip";
import {ui} from "../constants";
import {Button,useDisclosure} from "@chakra-ui/react";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import DonateModal from "./DonateModal";


function CharityTyle(props) {
  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo('en-US')
  const donateModal = useDisclosure()

  const [donateFormData, setDonateFormData] = React.useState(
      ui.initialDonateFormDataState
  );


  function handleDonate(event) {
    event.preventDefault();
    switch (donateFormData.donateCurrency) {
      case '0':
        props.mockDonateEth(donateFormData.charityId,donateFormData.contribution);
        break;
      case '1':
        props.mockDonateUsdc(donateFormData.charityId,donateFormData.contribution);
        break;
    }
    // close modal
    props.toast({
      title: 'Successful donation!',
      description: `We've received donation for charity id ${donateFormData.charityId}. Donation: ${donateFormData.contribution} ${ui.enumCurrencyToString[donateFormData.donateCurrency]}. You may close the window.`,
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

  function resetDonateFormDataState() {
    setDonateFormData({...ui.initialDonateFormDataState});
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
  return (
      <Box
          width="250px"
          height="360px"
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'

      >
        <DonateModal
            donateModal={donateModal}
            resetDonateFormDataState={resetDonateFormDataState}
            handleDonate={handleDonate}
            donateFormData={donateFormData}
            handleChange={props.handleChange}
            handleChangeChakraUiComponents={props.handleChangeChakraUiComponents}
            setDonateFormData={setDonateFormData}
        />
        <Image
            src={`/img/fundraising_icon_${(props.charity.id % 8) + 1}.jpeg`}
            alt='image visualizing fundraising'
            height='125px'
            width='220px'
        />
        <Box p='6'>
          <Box display='flex' alignItems='baseline'>
            <Tooltip label={ui.enumStatusToUi[props.charity.status].tooltip}>
              <Badge borderRadius='full' px='2' colorScheme={ui.enumStatusToUi[props.charity.status].color}>
                {ui.enumStatusToUi[props.charity.status].text}
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
            {props.charity.ethRaised} ETH &bull; {props.charity.usdcRaised} USDC
          </Box>
          <Box
              color='gray.500'
              fontWeight='bold'
              letterSpacing='wide'
              fontSize='xs'
              textTransform='uppercase'
              ml='2'
          >
            {props.charity.goal} {ui.enumCurrencyToString[props.charity.currency]} needed
          </Box>
          <Box
              mt='1'
              fontWeight='semibold'
              as='h4'
              lineHeight='tight'
              noOfLines={1}
          >
            {props.charity.status === 0 ? 'Ending:' : 'Finished:'} {timeAgo.format(new Date(props.charity.endPeriod))}
          </Box>
          <Tooltip label={props.charity.description}>
            <Box noOfLines={1}>
              {props.charity.description}
            </Box>
          </Tooltip>
          {
            props.charity.status === 0 &&
            <Box>
              <Box>
                <Button onClick={(event) => donateModalOpen(event, props.charity.id)}>Donate</Button>
              </Box>
              <Box>
                <Button onClick={(event) => props.tryCloseCharity(event, props.charity.id, true)}>Attempt closing goal met</Button>
              </Box>
              <Box>
                <Button onClick={(event) => props.tryCloseCharity(event, props.charity.id, false)}>Attempt closing goal not met</Button>
              </Box>
            </Box>
          }
          {
            props.charity.status === 1 &&
            <Box>
              <Button onClick={(event) => props.receiveNft(event, props.charity.id)}>Receive Nft</Button>
            </Box>
          }
          {
            props.charity.status === 2 &&
            <Box>
              <Button onClick={(event) => props.withdraw(event, props.charity.id)}>Withdraw</Button>
            </Box>
          }
        </Box>
      </Box>
  );
}

export default CharityTyle;