import React from 'react';
import { formatEther } from "ethers";
import { formatNumber } from "../utils";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableContainer,
} from '@chakra-ui/react';
import { isMobile } from "react-device-detect";

function StakingTable({ data }) {
  const { totalStakedPerLockTime, totalEarnedPerLockTime } = data;

  const lockTimes = [30, 90, 180, 360]; // Defined lock times

  const tableWidth = isMobile ? "100%" : "80%";
  const tableFontSize = isMobile ? "13px" : "md";
  const columnWidth1 = isMobile ? "20px" : "200px";
  const columnWidth2 = isMobile ? "20px" : "200px";
  const columnWidth3 = isMobile ? "20px" : "200px";

  const sumStaked = lockTimes.reduce(
    (acc, time) => acc + BigInt(totalStakedPerLockTime[time] || '0'),
    BigInt(0)
  );

  return (
    <TableContainer width={tableWidth}>
      <Table variant="simple" fontSize={tableFontSize}>
        <Thead>
          <Tr>
            <Th width={columnWidth1} color={"lightgray"}>Lock Time</Th>
            <Th width={columnWidth2} color={"lightgray"}>Total Staked</Th>
            <Th width={columnWidth3} color={"lightgray"}>APR (historical)</Th>
          </Tr>
        </Thead>
        <Tbody width={tableWidth}>
          {lockTimes.map((days) => {
            const staked = totalStakedPerLockTime[days] || '0';
            const earned = totalEarnedPerLockTime[days] || '0';

            const apr = (Number(formatEther(earned)) * 100 * 52) / Number(formatEther(sumStaked)); // Calculate APR annually

            return (
              <Tr key={days}>
                <Td>{days} days</Td>
                <Td>{formatNumber(formatEther(staked))}</Td>
                <Td><b>{`${apr.toFixed(2)}%`}</b></Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default StakingTable;

