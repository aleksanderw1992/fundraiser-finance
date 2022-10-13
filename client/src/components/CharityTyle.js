import React from 'react';
import {Image} from "@chakra-ui/image";
import {Badge, Box} from "@chakra-ui/layout";
import {Tooltip} from "@chakra-ui/tooltip";
import {ui} from "../constants";
import {Button} from "@chakra-ui/button";
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'


function CharityTyle(props) {
  TimeAgo.addLocale(en)
  const timeAgo = new TimeAgo('en-US')
  
  return (
      <Box
          width="250px"
          height="360px"
          borderWidth='1px'
          borderRadius='lg'
          overflow='hidden'

      >
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
                <Button onClick={(event) => props.donateModalOpen(event, props.charity.id)}>Donate</Button>
              </Box>
              <Box>
                <Button onClick={(event) => props.tryCloseCharity(event, props.charity.id)}>Attempt closing</Button>
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