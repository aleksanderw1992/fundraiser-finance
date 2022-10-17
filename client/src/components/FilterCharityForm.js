import React from 'react';
import {Radio, RadioGroup, Button, Stack} from "@chakra-ui/react";

function FilterCharityForm(props) {

  return (
      <form>
        <Button type="button" onClick={() => console.log(props.charities)}>Print current charities state (only for debugging</Button>
        <fieldset>
          <legend>Filter charities</legend>
          <RadioGroup
              onChange={(event) => props.handleChangeChakraUiComponents(props.setFilterFormData, 'status')(event)}
              value={props.filterFormData.status}>
            <Stack direction={['column', 'row']}>
              <Radio value='ONGOING'>Show only ongoing charities</Radio>
              <Radio value='CLOSED_GOAL_MET'>Finished successfully - ready to receive NFT!</Radio>
              <Radio value='CLOSED_GOAL_NOT_MET'>Finished without success - ready to withdraw funds</Radio>
              <Radio value='ALL_CHARITIES'>Show me all charities</Radio>
            </Stack>
          </RadioGroup>
        </fieldset>
      </form>
  );
}

export default FilterCharityForm;