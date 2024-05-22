import React, { useState, useContext, useEffect } from "react";
// import { Link } from "react-router-dom";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";

import { 
    Heading, 
    Box,
    // Stack, 
    Image,
    Text,
    Input,
    Button,
    Flex,
    HStack,
    Select,
    SimpleGrid,
    Stat, StatLabel, StatNumber    
    // VStack
} from '@chakra-ui/react';

import data from '../core/data.json';
import dataSummary from '../core/summary.json';

import { useAccount } from "wagmi";
import logoPRZS from "../../public/assets/images/logo.png";

import { parseEther, formatEther } from "ethers";
import { commify, formatNumber } from "../utils";
import { isMobile } from "react-device-detect";
import StakingTable from '../components/StakingTable'; 
import './stats.css';

const calculateStats = (data) => {
    const uniqueAddresses = new Set();
    let totalStaked = BigInt(0);
    let totalEarned = BigInt(0);
    let totalRewardsDistributed = BigInt(0);
  
    data.forEach(item => {
      uniqueAddresses.add(item.address);
      item.stakes.forEach(stake => {
        totalStaked += BigInt(stake.totalStaked);
      });
      totalEarned += BigInt(item.totalEarned);
      totalRewardsDistributed += BigInt(item.rewardPaid);
    });
  
    return {
      uniqueAddresses: uniqueAddresses.size,
      totalStaked: totalStaked.toString(),
      totalEarned: totalEarned.toString(),
      totalRewardsDistributed: totalRewardsDistributed.toString()
    };
}

const formatAddress = address => `${address.slice(0, 8)}...${address.slice(-8)}`;

const Stats: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);
  const { address, connector, isConnected } = useAccount();
  const [stats, setStats] = useState({});

  const stakingV1Address = "0xE2DF958c48F0245D823c2dCb012134CfDa9F8f9F";
  const stakingV2Address = "0x1FbDB5c46F6a33eC22a7AF990518Ed4610864b2c";
  const totalSupply = 420000000000000;
  const mobileFontSize = isMobile ? "13px" : "16px";

  useEffect(() => {
    setStats(calculateStats(data));
  }, []);

  const totalStakedReadablePerct = Number(2.70)  + 
  Number(formatEther(stats?.totalStaked ? stats?.totalStaked : 0)) * 100 / totalSupply 
  

   return(
    <>
      <section className="hero-section">
        <Box className="staking-area">
          <Box className="container">
            <Box className="row justify-content-center">
                <br /><br />
                <Box className="col-12 col-md-7">
                    <Box className="card no-hover staking-card single-staking">
                        <Heading as="h3" size={isMobile ? "md" : "lg"} textAlign="left" color="white" className="card-title">
                            Perezoso Farming Stats
                        </Heading>
                           <SimpleGrid>
                            <HStack>
                                <Box w="33.33%" >
                                <Stat>
                                    <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Total stakers</StatLabel>
                                    <StatNumber><b>{stats?.uniqueAddresses}</b></StatNumber>
                                </Stat>
                                </Box>
                                <Box w="33.33%">
                                <Stat >
                                    <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Total Staked</StatLabel>
                                    
                                    <Box >
                                        <HStack>
                                        <StatNumber><b>{formatNumber(formatEther(stats?.totalStaked != null ? stats.totalStaked : 0))}</b></StatNumber>
                                        <Image  src={logoPRZS} alt="logo" width="20" height="20" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                        </HStack>
                                    </Box>
                                </Stat>
                                </Box>
                                <Box w="33.33%">
                                <Stat>
                                <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Total Earned</StatLabel>
                                    
                                    <Box>
                                        <HStack>
                                        <StatNumber><b>{formatNumber(formatEther(stats?.totalEarned != null ? stats.totalEarned : 0))}</b></StatNumber>
                                        <Image  src={logoPRZS} alt="logo" width="20" height="20" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                        </HStack>
                                    </Box>                                
                                  </Stat>
                                </Box>                                
                            </HStack>
                           </SimpleGrid>
                           <SimpleGrid>
                            <HStack>
                                <Box w="33.33%" >
                                  <Stat>                           
                                  <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Total distributed</StatLabel>
                                      <Box>
                                          <HStack>
                                          <StatNumber><b>{formatNumber(formatEther(stats?.totalRewardsDistributed != null ? stats.totalRewardsDistributed : 0))}</b></StatNumber>
                                          <Image  src={logoPRZS} alt="logo" width="20" height="20" />&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

                                          </HStack>
                                      </Box>                                
                                    </Stat>
                                </Box>
                                <Box w="33.33%">

                                </Box>
                                <Box w="33.33%">

                                </Box>                                
                            </HStack>
                           </SimpleGrid>                           
                    
                            <br />
                            <Heading as="h4" size="md" >
                                Detailed summary
                            </Heading>
                           <StakingTable data={dataSummary} />

                    </Box>
                </Box>
                <Box className="col-12 col-md-5">
              <Box className="staking-items mt-4 mt-md-0" >
                  <Box className="card no-hover staking-card" border="1px solid" >
                  <SimpleGrid>
                  <Box w="90%" >
                  <Heading as="h4" size="md" >
                    Contract info
                  </Heading>
                    <Stat>                           
                    <Box>
                    <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Perezoso Farming (Current)</StatLabel> 
                    <HStack>
                    <label style={{color:"lightgray"}}>Address:&nbsp;</label>
                      <b>
                        <a  href={`https://bscscan.com/address/${stakingV2Address}`} target="_blank" rel="noreferrer">
                          <Text className="customLink" style={{fontSize:"16px"}}> {formatAddress(stakingV2Address)}</Text>
                        </a>
                      </b>
                    </HStack>
                     </Box>                                
                    </Stat>
                    <Stat>                           
                    <Box>
                    <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Perezoso Staking (Old)</StatLabel> 
                    <HStack>  
                    <label style={{color:"lightgray"}}>Address:&nbsp;</label>
                      <b>
                        <a href={`https://bscscan.com/address/${stakingV1Address}`} target="_blank" rel="noreferrer">
                        <Text className="customLink" style={{fontSize:"16px"}}> {formatAddress(stakingV1Address)}</Text>
                        </a>
                      </b>
                    </HStack>
                    </Box>                                
                    </Stat>
                  </Box> 
                </SimpleGrid>
                  
                  <SimpleGrid>
                    <HStack>
                      <Box w="100%">

                      </Box>
                    </HStack>
                  </SimpleGrid>


                    
                      <SimpleGrid >
                        <HStack>
                        <Box w={"50%"} mt={10}>
                          {/* {stakedBalance > 0 ?
                          <HStack>
                            <h5 className="m-0">{timeLeft != "" ? timeLeft : expDate}</h5>
                          </HStack> : 
                          <h4 className="m-0">-- -- --</h4>} */}

                        </Box>
                        <Box w={"50%"}>

                            
                        </Box>
                        </HStack>
                      </SimpleGrid>

                  </Box>
                </Box>
                <br />
                <Box className="staking-items mt-4 mt-md-0" >
                  <Box className="card no-hover staking-card" pt={10}>
                    <Heading as="h4" size="md">
                          Total supply staked
                        </Heading>
                        <Stat>      
                        <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Perezoso Farming (Current)</StatLabel>                     
                          <Box>
                            <HStack>
                            <StatNumber>
                              <b>{typeof stats?.totalStaked != "undefined" ? Number(formatEther(stats?.totalStaked) * 100 / totalSupply ).toFixed(2) : 0}% </b>
                            </StatNumber>
                            <Box color="lightgray" fontSize="13px">
                            {typeof stats?.totalStaked != "undefined" ? formatNumber(formatEther(stats?.totalStaked)) : 0 } of {formatNumber(totalSupply)}
                            </Box>
                            </HStack>
                          </Box>                                
                        </Stat>
                        <Stat>      
                        <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Perezoso Staking (Old)</StatLabel>                     
                          <Box>
                            <HStack>
                            <StatNumber>
                              <b>9.02% </b>
                            </StatNumber>
                            <Box color="lightgray" fontSize="13px">
                              11.3T of {formatNumber(totalSupply)}
                            </Box>
                            </HStack>
                          </Box>                                
                        </Stat>
                        <Stat>      
                        <StatLabel style={{color:"lightgray", fontSize:mobileFontSize}}>Global total</StatLabel>                     
                          <Box>
                            <HStack>
                            <StatNumber>
                              <b><Text className="globalTotal" style={{color:"#9ca0d2"}}>{totalStakedReadablePerct.toFixed(2)}%</Text> </b>
                            </StatNumber>
                            <Box color="lightgray" fontSize="13px">
                            {typeof stats?.totalStaked != "undefined" ? formatNumber(Number(formatEther(stats?.totalStaked)) + Number(11.35e12)) : 0 } of {formatNumber(totalSupply)}
                            </Box>
                            </HStack>
                          </Box>                                
                        </Stat>

                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </section>
      {/* {(staking ||
        approving ||
        isWaitingForApproval) && (
        <Box className="loader">
          <CirclesWithBar
            height="100"
            width="100"
            color="#fff"
            outerCircleColor="#fff"
            innerCircleColor="#fff"
            barColor="#fff"
            wrapperStyle={{}}
            wrapperClass=""
            visible={
              staking ||
              approving ||
              // gettingPlayerWinning ||
              // gettingNoOfPlayers ||
              isWaitingForApproval
            }
          />
        </Box>
      )} */}
    </>
  );
}

export default Stats;