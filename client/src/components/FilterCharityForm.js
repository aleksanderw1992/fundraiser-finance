import React from 'react';
import { Button, Box, useRadioGroup, useRadio, HStack, Icon} from "@chakra-ui/react";
import {MdOutlineFilterList} from 'react-icons/md';

function RadioCard(props) {
    const {getInputProps, getCheckboxProps} = useRadio(props)

    const input = getInputProps()
    const checkbox = getCheckboxProps()

    return (
        <Box as='label'>
            <input {...input} />
            <Box
                {...checkbox}
                cursor='pointer'
                borderWidth='1px'
                borderRadius='md'
                boxShadow='md'
                _checked={{
                    bg: 'teal.600',
                    color: 'white',
                    borderColor: 'teal.600',
                }}
                _focus={{
                    boxShadow: 'outline',
                }}
                px={5}
                py={3}
            >
                {props.children}
            </Box>
        </Box>
    )
}

function FilterCharityForm(props) {
    const options = [
        {name: 'ONGOING', defaultValue: 'Active'},
        {name: 'CLOSED_GOAL_MET', defaultValue: 'Successful'},
        {name: 'CLOSED_GOAL_NOT_MET', defaultValue: 'Failed'},
        {name: 'ALL_CHARITIES', defaultValue: 'All'},
    ]
    const {getRootProps, getRadioProps} = useRadioGroup({
        name: 'status',
        defaultValue: 'react',
        onChange: (event) => props.handleChangeChakraUiComponents(props.setFilterFormData, 'status')(event),
    })
    const group = getRootProps()
    return (
        <form>
            <Button type="button" onClick={() => console.log(props.charities)}>Print current charities state (only for
                debugging</Button>
            <fieldset>
                <legend>
                   <Icon as={MdOutlineFilterList} /> Filter charities</legend>
                <HStack {...group}>
                    {options.map((option) => {
                        return (
                            <RadioCard
                                key={option.name}
                                value={option.name}
                                {...getRadioProps({value: option.name})}
                            >
                                {option.defaultValue}
                            </RadioCard>
                        )
                    })}
                </HStack>
            </fieldset>
        </form>
    );
}

export default FilterCharityForm;

// in Radiogroup  onChange={(event) => props.handleChangeChakraUiComponents(props.setFilterFormData, 'status')(event)}
// value={props.filterFormData.status}

// <Stack direction={['column', 'row']}>
//     <Radio value='ONGOING'>Show only ongoing charities</Radio>
//     <Radio value='CLOSED_GOAL_MET'>Finished successfully - ready to receive NFT!</Radio>
//     <Radio value='CLOSED_GOAL_NOT_MET'>Finished without success - ready to withdraw funds</Radio>
//     <Radio value='ALL_CHARITIES'>Show me all charities</Radio>
// </Stack>