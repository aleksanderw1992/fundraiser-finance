import React from 'react';
import {Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay} from "@chakra-ui/modal";
import {FormControl, FormHelperText, FormLabel} from "@chakra-ui/form-control";
import {Select} from "@chakra-ui/select";
import {NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper} from "@chakra-ui/number-input";
import {Input} from "@chakra-ui/input";
import {Button} from "@chakra-ui/button";

function CreateCharityModal(props) {

  return (
      <Modal size="xl" isOpen={props.createCharityModal.isOpen} onClose={() => props.resetCreateFormDataState() & props.createCharityModal.onClose()}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Create new charity</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <form onSubmit={props.handleCreate} id="create-new-charity-form">
              <fieldset>
                <legend>Create new charity</legend>

                <FormControl isRequired>
                  <FormLabel htmlFor='currency'>Currency</FormLabel>
                  <Select
                      id="currency"
                      name="currency"
                      value={props.createFormData.currency}
                      onChange={props.handleChange(props.setCreateFormData)}
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
                      value={props.createFormData.goal}
                      onChange={props.handleChangeChakraUiComponents(props.setCreateFormData, 'goal')}
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
                      value={props.createFormData.description}
                      onChange={props.handleChange(props.setCreateFormData)}
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
                      value={props.createFormData.beneficiary}
                      onChange={props.handleChange(props.setCreateFormData)}
                  />
                  <FormHelperText>Write an address of beneficiary. Beneficiary will be eligible to receive all funds after the goal is met. By default
                    it should be your
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
                      value={props.createFormData.endDate}
                      onChange={props.handleChange(props.setCreateFormData)}
                  />
                  <FormHelperText>When fundraising is going to end?</FormHelperText>
                </FormControl>
              </fieldset>
            </form>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} type="submit" form="create-new-charity-form">Add</Button>
            <Button variant='ghost' onClick={() => props.resetCreateFormDataState() & props.createCharityModal.onClose()}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>

      </Modal>

  );
}

export default CreateCharityModal;