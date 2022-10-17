import React from 'react';
import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
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
  Select
} from "@chakra-ui/react";

function DonateModal(props) {

  return (
      <Modal isOpen={props.donateModal.isOpen} onClose={() => props.resetDonateFormDataState() & props.donateModal.onClose()}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Donate</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <form onSubmit={props.handleDonate} id="donate-form">
              <fieldset>
                <legend>
                  Donate to charity with id {props.donateFormData.charityId}
                </legend>

                <FormControl isRequired>
                  <FormLabel htmlFor='donateCurrency'>Currency</FormLabel>
                  <Select
                      id="donateCurrency"
                      name="donateCurrency"
                      value={props.donateFormData.donateCurrency}
                      onChange={props.handleChange(props.setDonateFormData)}
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
                      value={props.donateFormData.contribution}
                      onChange={props.handleChangeChakraUiComponents(props.setDonateFormData, 'contribution')}
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
            <Button colorScheme='blue' mr={3} type="submit" form="donate-form" disabled={props.donateFormData.contribution === 0}>+</Button>
            <Button variant='ghost' onClick={() => props.resetDonateFormDataState() & props.donateModal.onClose()}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

  );
}

export default DonateModal;