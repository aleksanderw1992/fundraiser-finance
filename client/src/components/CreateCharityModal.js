import React from 'react';
import {
  Button,
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select
} from "@chakra-ui/react";
import {ui} from "../constants";

function CreateCharityModal(props) {
  const [createFormData, setCreateFormData] = React.useState(
      ui.initialCreateFormDataState
  );
  function resetCreateFormDataState() {
    setCreateFormData({...ui.initialCreateFormDataState});
  }
  function handleCreate(event) {
    event.preventDefault();
    props.mockCreateCharity(createFormData.currency,
        createFormData.goal,
        createFormData.endDate,
        createFormData.description,
        createFormData.beneficiary);

    props.toast({
      title: 'Charity created!',
      description: `We've created a charity - ${createFormData.description}. You may close the window.`,
      status: 'success',
      duration: 6000,
      isClosable: true,
    });
    resetCreateFormDataState();
  }
  return (
      <Modal size="xl" isOpen={props.createCharityModal.isOpen} onClose={() => resetCreateFormDataState() & props.createCharityModal.onClose()}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Create new charity</ModalHeader>
          <ModalCloseButton/>
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
                      onChange={props.handleChange(setCreateFormData)}
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
                      onChange={props.handleChangeChakraUiComponents(setCreateFormData, 'goal')}
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
                      onChange={props.handleChange(setCreateFormData)}
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
                      onChange={props.handleChange(setCreateFormData)}
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
                      value={createFormData.endDate}
                      onChange={props.handleChange(setCreateFormData)}
                  />
                  <FormHelperText>When fundraising is going to end?</FormHelperText>
                </FormControl>
              </fieldset>
            </form>

          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} type="submit" form="create-new-charity-form">Add</Button>
            <Button variant='ghost' onClick={() => resetCreateFormDataState() & props.createCharityModal.onClose()}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>

      </Modal>

  );
}

export default CreateCharityModal;