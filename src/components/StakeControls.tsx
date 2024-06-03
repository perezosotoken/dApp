import {
    Box,
    VStack,
    HStack,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import { isMobile } from "react-device-detect";

function StakingTable({amountToStake, przsBalance, sideButtonsGroupSize, approve, handleStakeAll}) {
  return (
    <Box>
      <VStack>
        <Box mt={isMobile ? 0 : 10}>
        <HStack>
          <Button isDisabled={przsBalance == 0} size={sideButtonsGroupSize} borderRadius={10} mt={5} onClick={() => handleStakeAll("25")}>25%</Button>&nbsp;
          <Button isDisabled={przsBalance == 0} size={sideButtonsGroupSize} borderRadius={10} mt={5} onClick={() => handleStakeAll("50")}>50%</Button>&nbsp;
          </HStack>
        <HStack>
        <Button isDisabled={przsBalance == 0} size={sideButtonsGroupSize} borderRadius={10} mt={5} onClick={() => handleStakeAll("75")}>75%</Button>&nbsp;
        <Button isDisabled={przsBalance == 0} border="4px solid green" size={sideButtonsGroupSize} borderRadius={10} mt={5} onClick={() => handleStakeAll("100")}>MAX</Button>&nbsp;
        </HStack>      
        </Box>

        {isMobile ? 
          <Button 
          isDisabled={amountToStake == 0 || przsBalance == 0}
          width={"120px"} 
          style={{ border:"1px solid white", borderRadius:"10px"}}
          onClick={() => approve()}
        > 
        &nbsp;Stake 
        </Button> : <></>}
      </VStack>
    </Box>
  )
}

export default StakingTable;

