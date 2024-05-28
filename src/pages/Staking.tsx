import React, { useState, useContext, useEffect } from "react";
// import { Link } from "react-router-dom";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";
import { CirclesWithBar } from "react-loader-spinner";

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
    VStack,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,       
    // VStack
} from '@chakra-ui/react';

import { Address, useAccount, useContractRead, useContractWrite } from "wagmi";
import logoPRZS from "../../public/assets/images/logo.png";
import TOKENABI from "../core/TokenABI.json";
import StakingRewardsArtifact from "../core/StakingRewards.json";

import PerezosoStakingAbi from "../core/PerezosoStaking.json";
import { toast } from "react-toastify";

import { parseEther, formatEther } from "ethers";
import { commify, formatNumber, formatAndCommifyNumber } from "../utils";
import { isMobile } from "react-device-detect";
import { rewardsMap, depositMap, totalStakingTime } from "../core/Constants";
import StakeControls from '../components/StakeControls.tsx';
import axios from 'axios';

import BigNumber from "bignumber.js";

const Staking: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);
  const { address, connector, isConnected } = useAccount();

  const ticker = "perezoso";

  /** V1 Variables */
  const [amountToStakeV1, setAmountToStakeV1] = useState(parseEther(`${0}`));
  const [selectedTierV1, setSelectedTierV1] = useState("0");
  const [selectedTimeV1, setSelectedTimeV1] = useState("0");
  const [accumulatedRewards, setAccumulatedRewards] = useState(0);
  
  /** V2 Variables */
  const [amountToStake, setAmountToStake] = useState(parseEther(`${0}`));
  const [selectedTier, setSelectedTier] = useState("1");
  const [selectedTime, setSelectedTime] = useState("2592000");
  const [selectedStake, setSelectedStake] = useState("0");
 
  const tokenAddress = "0x53ff62409b219ccaff01042bb2743211bb99882e";
  const stakingAddress = "0xE2DF958c48F0245D823c2dCb012134CfDa9F8f9F";
  const stakingV2Address = "0x1FbDB5c46F6a33eC22a7AF990518Ed4610864b2c";

  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

  const [timeLeft, setTimeLeft] = useState("");
  const [expDate, setExpDate] = useState("");
  const [baseAPR, setBaseAPR] = useState(0);
  const [tierAPR, setTierAPR] = useState(0);
  const [priceUSD, setPriceUSD] = useState(0);

  const { data: realtimeRewards, refetch: refetchRewards } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "earned",
    args: [address],
    watch: true,
  });

  const {data: stakingContractBalance, refetch: refetchStakingContractBalance} = 
  useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [stakingV2Address],
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStakingContractBalance();
    }
    , 5000);

    return () => clearInterval(interval);
  }, [stakingV2Address]);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const url = 'https://api.coingecko.com/api/v3/simple/price';
        const params = {
          ids: 'perezoso',
          vs_currencies: 'usd',
        };
        const headers = {
          'x-cg-demo-api-key': process.env.REACT_APP_CG_API_KEY,
        };
  
        const response = await axios.get(url, { params, headers });
        // console.log(response.data['perezoso'])
        // console.log(`Price for PRZS is $${Number(response.data['perezoso'].usd).toFixed(11)}`)
        setPriceUSD(Number(response.data['perezoso'].usd).toFixed(11));
      } catch (err) {
        console.log(err.message);
      } 
    };

    fetchPrice();
  }, [ticker]);

  useEffect(() => {
    const key1 = `${2592000}`;
    const key2 = `${2592000 * 3}`;
    const key3 = `${2592000 * 6}`;
    const key4 = `${2592000 * 12}`;
    
    const multipliers = {
      [key1]: 1,
      [key2]: 2,
      [key3]: 3,
      [key4]: 6,
    };
    
    const calculateAPR = async () => {
      if (stakingContractBalance) {
        
        const weeklyRewards = 445_500_000_000;

        const stakingContractBalanceReadable = formatEther(stakingContractBalance); 
        const balanceWithoutRewards = Number(stakingContractBalanceReadable) - weeklyRewards;

        const numerator = weeklyRewards;
        const baseAPR = ((numerator / balanceWithoutRewards)) * 100;

        const tierAPR = baseAPR * multipliers[selectedTime];
        const tierAPRReadable = commify(tierAPR * 52, 2);

        setBaseAPR(baseAPR);
        setTierAPR(tierAPRReadable);
    
      } 
    }
  
    const interval = setInterval(() => {
      calculateAPR();
    }, 1000);

    return () => clearInterval(interval);
  }, [stakingContractBalance, selectedTime]);
      
  const {data: stakesCount } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "stakesCount",
    args: [address],
  });

  // console.log(`Stakes count is ${stakesCount} selected stake is ${selectedStake} realtime rewards is ${realtimeRewards}`)
  const { data: earnedOnStake } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "earnedOnStake",
    args: [address, selectedStake],
    watch: true,
  });
 

  // Setup an interval to refetch rewards every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRewards();  // This will refetch the contract read

    }, 5000);

    return () => clearInterval(interval);
  }, [stakesCount]);  // Depend on refetch to reset the interval when it changes

  const {data: stakes } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "getAllStakes",
    args: [address],
  });
  
  const totalStaked = stakes?.reduce((acc, stake) => acc + stake.amount, 0n) || 0;

  // console.log(`Got realtime rewards ${realtimeRewards} stakes count is ${stakesCount} selected stake is ${selectedStake}`)

  const {data: przsBalance} = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: stakedBalance } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "getStakedBalance",
    args: [address], 
    watch: true,  
  });

  const { data: totalStakers, refetch } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "getTotalStakers",
    args: [address], 
    watch: false, 
  });

  useEffect(() => {
    refetch();
  }, [address, stakingAddress, refetch]);

  // const { data: isUserStaked } = useContractRead({
  //   address: stakingAddress,
  //   abi: PerezosoStakingAbi.abi,
  //   functionName: "isUserStaked",
  //   args: [address], 
  //   watch: true
  // });
 
  const {data: unlockTime} = useContractRead({
    address: stakingAddress,
    // @ts-ignore
    abi: PerezosoStakingAbi.abi,
    functionName: "getUnlockTime",
    args: [address], 
  });
  
  const {isLoading: updatingRewards, write: updateMyRewards} = useContractWrite({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "updateMyRewards",
    args: [],
    onSuccess() {
      toast("Successfully refreshed rewards!");
      // setTimeout(() => {
      //   window.location.reload();
      // }, 5000);    
    },
    onError() {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Transaction unsuccessful.");
    },
  });

  const {isLoading: gettingRewards, write: getRewards} = useContractWrite({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "getReward",
    args: [],
    onSuccess() {
      toast("Successfully claimed your rewards!");
      setTimeout(() => {
        window.location.reload();
      }, 5000);    
    },
    onError() {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Transaction unsuccessful.");
    },
  });


  const { isLoading: staking, write: stake } = useContractWrite({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "stake",
    args: [amountToStake, selectedTime],
    onSuccess() {
      toast("Successfully staked your PRZS!");
      const now = new Date();
      const unlockDate = new Date(now.getTime());
      unlockDate.setDate(now.getDate() + 30);

      localStorage.setItem('expData', JSON.stringify(unlockDate));
      setExpDate(unlockDate.toISOString().split('T', 1)[0]);
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    },
    onError(data) {
      console.log(data?.stack)
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      if (data?.stack?.includes("Already staked.")) {
        toast("Already staked.");
        return;
      }
      if (data?.stack?.includes("Staked amount does not meet any tier minimum.")) {
        toast("Staked amount does not meet any tier minimum.");
        return;
      }
      if (data?.stack?.includes("transfer amount exceeds balance")) {
        toast("Not enough PRZS in your wallet.");
        return;
      }
      toast("Error, Transaction unsuccessful.");
    },
  });

  const {isLoading: exitingPosition, write: withdraw} = useContractWrite({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "withdraw",
    args: [selectedStake],
    onSuccess() {
      toast("Successfully withdrew your stake!");
      setTimeout(() => {
        window.location.reload();
      }, 5000);    
    },
    onError() {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Transaction unsuccessful.");
    },
  });


  useEffect(() => {
    function updateCountdown() {
      function calculateStartTime(endTimeInSeconds, durationInSeconds) {
        const startTimeInSeconds = endTimeInSeconds - durationInSeconds;
        return startTimeInSeconds;
      }

      const oneMonthInSeconds = 2592000;
      const startTime = calculateStartTime(unlockTime, oneMonthInSeconds);
        
      function calculateAccumulatedRewards(startTimeInSeconds, rewardPerSecond, unlockTime) {
        // console.log(`Got rewards per second ${rewardPerSecond}`);
        // console.log(`Staked balance ${stakedBalance}`);

        const currentTimeInSeconds = Math.floor(Date.now() / 1000); 
        const elapsedTimeInSeconds = currentTimeInSeconds - startTimeInSeconds;
        const accumulatedRewards = elapsedTimeInSeconds * rewardPerSecond;

        // console.log(`Accumulated rewards ${accumulatedRewards}`);

        const now = Math.floor(Date.now() / 1000);  
        const delta = unlockTime - now;

        if (delta <= 0) {
          return Math.min(accumulatedRewards, 300000);
        }

        return accumulatedRewards;
      }

      let rewardPerSecond = 0;
      // console.log(`StakedBalance is ${commify(formatEther(typeof stakedBalance != "undefined" ? stakedBalance : 0))} Selected tier is ${selectedTier} Reward per second is ${rewardPerSecond}`);

      if (stakedBalance == parseEther("1000000000")) {
        setSelectedTierV1(0);
        setSelectedTimeV1("0");
      } else if (stakedBalance == parseEther("10000000000")) {
        setSelectedTierV1(1);
        setSelectedTimeV1(0);
      }
      else if (stakedBalance == parseEther("100000000000")) {
        setSelectedTierV1(2);
        setSelectedTimeV1(0);
      }
      else if (stakedBalance == parseEther("1000000000000")) {
        setSelectedTierV1(3);
        setSelectedTimeV1(0);
      }

      rewardPerSecond = rewardsMap[selectedTierV1][selectedTimeV1] / totalStakingTime;    

      // console.log(rewardSpeeds[selectedTier])
      // console.log(`Selected Time ${selectedTime} Selected Tier ${selectedTier}`)
      // console.log(rewardSpeeds[selectedTier][selectedTime])

      const accumulatedRewards = calculateAccumulatedRewards(startTime, rewardPerSecond);

      setAccumulatedRewards(accumulatedRewards);
      
      function calculateTimeLeft(unlockTime) {
        const now = Math.floor(Date.now() / 1000);  
    
        let delta = unlockTime - now;

        if (delta < 0) {
          setTimeLeft("0d 0h 0m 0s");
          return;
        }

        const days = Math.floor(delta / 86400);
        delta -= days * 86400;
        const hours = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        const minutes = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        const seconds = delta % 60;
    
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      }

      calculateTimeLeft(unlockTime);
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();  
    
    return () => clearInterval(interval);  
  }, [address, unlockTime, selectedTierV1, selectedTimeV1]);

  // @ts-ignore
  const { isLoading: approving, write: approve } = useContractWrite({
    address: tokenAddress,
    abi:  TOKENABI,
    functionName: "approve",
    args: [stakingV2Address as Address, amountToStake],
    onSuccess: () => {
      setIsWaitingForApproval(true);
      setTimeout(() => {
        stake();
        setIsWaitingForApproval(false);
      }, 5000);
    },
    onError(data) {
      console.error(data?.stack)
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Approval unsuccessful.");
    },
  });

  
  const { isLoading: unstaking, write: unStake } = useContractWrite({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "unStake",
    args: [],
    onSuccess() {
      toast("Successfully unstaked your PRZS!");
      setTimeout(() => {
        window.location.reload();
      }, 5000);    
    },
    onError(data) {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      if (data?.stack?.includes("Stake is still locked.")) {
        toast("Stake is still locked.");
        return;
      }
    toast("Error, Transaction unsuccessful.");
    },
  });

  const handleAmountToStake = (value) => {
    if (value == "") {
      setAmountToStake(parseEther("0")); // Ensure this is a BigNumber
    } else {
      try {
        const formattedValue = parseEther(`${value}`);
        setAmountToStake(formattedValue);
      } catch (error) {
        console.error("Error formatting value:", error);
      }
    }
  };

  const handleAmountToStakeV1 = (value) => {
    if (value == "") {
      setAmountToStakeV1(parseEther("0")); // Ensure this is a BigNumber
    } else {
      try {
        const formattedValue = parseEther(`${value}`);
        setAmountToStakeV1(formattedValue);
      } catch (error) {
        console.error("Error formatting value:", error);
      }
    }
  };
  
  const handleStakeAll = (quantity) => {
    let toStake = 0n; 
    const przsBalanceBigInt = BigInt(przsBalance); 
  
    if (quantity === "25") {
      toStake = przsBalanceBigInt / 4n; 
    } else if (quantity === "50") {
      toStake = przsBalanceBigInt / 2n; 
    } else if (quantity === "75") {
      toStake = (przsBalanceBigInt * 75n) / 100n; 
    } else if (quantity === "100") {
      toStake = (przsBalanceBigInt * 9999n) / 10000n; 
    }
  
    setAmountToStake(toStake);
  };
  

  const handleSetSelectedStake = (value) => {
    setSelectedTime(stakes[value].lockPeriod);
    setSelectedStake(value);
  }
  
  useEffect(() => {
    if (amountToStake > 0) {
      // Trigger any action that depends on updated amountToStake
      // console.log(`Amount to stake updated: ${amountToStake}`);
    }
  }, [amountToStake]); // This effect runs whenever amountToStake changes
  
  const getDepositAmount = (tier: string) => {
    const tierIndex = Number(tier);
    if (tierIndex >= 0 && tierIndex < depositMap.length) {
      return depositMap[tierIndex];
    } else {
      return "0"; 
    }
  };
  
  const handleSelectTime = (value: string) => {
    setSelectedTime(value);
  }



  const amountToStakeReadable = formatEther(amountToStake || 0);
  // const amountToStakeReadableV1 = formatEther(amountToStakeV1);
  const sideButtonsGroupSize = isMobile ? "35px" : "25px";

  let isSelectedPositionUnlocked = false;
  if (stakes) {
    isSelectedPositionUnlocked = stakes[selectedStake]?.lockTime < Math.floor(Date.now() / 1000);
  }
 

   return(
    <>
      <section className="hero-section">
        {/* <Box w="100%" background="tomato" height="auto">
          
            <VStack>
              <Text fontSize="2xl" ml={'25%'} color="lightgray"   fontWeight="bold">
                Your positions have stopped generating rewards. Please unstake to continue!
              </Text>
              <HStack><b>APR:</b> <Text><b>0%</b></Text></HStack>
            </VStack>

        </Box> */}
        <Box className="staking-area">
          <Box className="container">
            <Box className="row justify-content-center">
              <Box className="col-12 col-md-7">
                <Box className="card no-hover staking-card single-staking">
                  <h3 className="m-0">
                    {!ctx.isSpanishCountry ? "Perezoso Farming (Phase 2)" : "Acuña tu token Perezoso"}</h3>

                  <Box className="tab-content mt-md-3" id="myTabContent">
                    <Box
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <Box className="input-box my-4 d-flex row" >
                        
                      <Box className="input-area col-lg-6 col-12 mb-3">
                        <h4>Your wallet</h4>
                        <Box className="input-text">
                            <label>Balance</label><br/>
                            <Input 
                              mt={4} 
                              value={commify(formatEther(przsBalance?.toString() || 0), 4)}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>  
                            </Box>
                          </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3">
                          <h4>Your stakes</h4>
                          {stakesCount > 0 ? 
                          <>
                          <label>Positions</label><br/>
                          <Select
                            width={220} 
                            border="1px solid" 
                            borderRadius={"10px"} 
                            onChange={(event) => handleSetSelectedStake(event.target.value)} 
                          >
                            {stakes?.map((stake, index) => {

                              return (
                                <>
                                  <option key={index} value={index}>
                                    #{index+1} - Unlock on : {new Date(Number(stake.lockEnd) * 1000).toLocaleString("en-US", {
                                      year: 'numeric', // Use 'numeric' or '2-digit'
                                      month: 'long',   // Use 'numeric', '2-digit', 'narrow', 'short', or 'long'
                                      day: 'numeric'   // Use 'numeric' or '2-digit'
                                    })}
                                  </option>
                                  <br />
                                  {index == 0 ? <Heading as="h4" size="md">Details</Heading> : <>test</> }                
                                </>
                            )})}
                            </Select> 
                          </>
                            : <>No data</>} 
                          <br />
                          <Heading as="h4" size="md">Summary</Heading>
                          <SimpleGrid>
                            <HStack>
                              <Box w={"40%"}>
                                <Text style={{fontSize:"14px"}}>Total staked</Text>
                              </Box>
                              <Box w={"60%"} >
                                <Text style={{fontSize:"11px"}} height={"20px"}>
                                  <HStack>
                                    <Text style={{fontSize:"12px", color:"lightgray"}} fontWeight={"bold"}>
                                      {formatNumber(Number(formatEther(totalStaked || 0)))} 
                                    </Text>
                                    <Image src={logoPRZS} width="15px" mt={-25}></Image>
                                  </HStack>
                                </Text>
                              </Box>
                            </HStack>
                            <HStack>
                              <Box w={"40%"}>
                                <Text style={{fontSize:"14px"}}>Total positions</Text>
                              </Box>
                              <Box w={"60%"}>
                                <Text style={{fontSize:"13px"}}>{!isNaN(Number(stakesCount)) ? Number(stakesCount) : 0}</Text>
                              </Box>
                            </HStack>
                          </SimpleGrid>
 
                              <>
                              
                          {stakesCount > 0 ?
                          <Box>
                            <Heading as="h4" size="md">Position details</Heading>
                            <SimpleGrid >
                              <HStack>
                              <Box w={"50%"} >
                                <Text style={{fontSize:"14px"}}>Position</Text>
                              </Box>
                              <Box w={"50%"} >
                                <Text style={{fontSize:"13px"}}>#{Number(selectedStake) +1}</Text>
                              </Box>
                              </HStack>
                              <HStack>
                              <Box w={"50%"} >
                                <Text style={{fontSize:"14px"}}>Unlocks on</Text>
                              </Box>
                              <Box w={"50%"} >
                                <Box><label style={{fontSize:"13px"}}><b>{new Date(Number(stakes[selectedStake]?.lockEnd) * 1000).toLocaleString("en-US", { hour12: false })}</b></label></Box>
                              </Box>
                              </HStack>
                              <HStack>
                              <Box w={"50%"} >
                                <Text style={{fontSize:"13px"}}>Amount staked</Text>
                              </Box>
                              <Box w={"50%"} >
                                <Box ><label style={{fontSize:"13px"}}><b>{ formatNumber(Number(formatEther(stakes[selectedStake]?.amount || 0)))}</b></label></Box>
                              </Box>
                              </HStack>
                              <HStack>
                                <Box w={"50%"} >
                                  <Text style={{fontSize:"13px"}}>Multiplier</Text>
                                </Box>
                                <Box w={"50%"} >
                                  <Box><label style={{fontSize:"13px"}}><b>{Number(stakes[selectedStake]?.multiplier)}x</b></label></Box>
                                </Box>
                              </HStack>
 
                            </SimpleGrid>
                            </Box>
                          : <></>}
                          </>
                        </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3"  marginTop={!isMobile && stakesCount > 0 ? -350 : isMobile ? -50 : -110  }>
                        <br /> <br />
                        <Heading as="h4" size="md">New position</Heading>
                        <Box className="input-text" >
                            <label>Choose time</label>
                            <SimpleGrid>
                              <HStack>
                              <Box w={"60%"}>
                                <Select
                                  placeholder='' 
                                  defaultValue={0}
                                  width={"100%"} 
                                  height={40}
                                  fontSize={13}
                                  style={{border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}}
                                  onChange={(ev) => handleSelectTime(ev.target.value)} 
                                  mt={4} 
                                >
                                  <option value={2592000}>30  days</option>
                                  <option value={2592000 * 3}>90  days</option>
                                  <option value={2592000 * 6}>180 days</option>
                                  <option value={2592000 * 12}>365 days</option>
                              </Select>
                              </Box>
                              &nbsp;&nbsp;
                              <Box ml={10}>
                              <Text style={{fontSize:isMobile?'16px':'14px'}}>(APR&nbsp;
                              <label fontSize={"md"} fontColor="gray" mt={-2}>
                                <b>{commify(tierAPR)}</b>%)
                                </label>
                              </Text>
                              </Box>
                              </HStack>
                            </SimpleGrid>
                          </Box>
                          <br />
                          <Box className="input-text" >
                            <label>{!ctx.isSpanishCountry ? "Choose deposit amount" : "Elija el monto del depósito"} </label>
                          <HStack>
                          <Input 
                            type="text"
                            mt={isMobile ? -60 : 4} 
                            height={35}
                            placeholder={"type here..."} // Display the formatted value
                            style={{ border: "1px solid white", borderRadius: "10px", backgroundColor: "gray" }} 
                            width={180} 
                            onChange={(ev) => handleAmountToStake(ev.target.value)}
                           >
                        </Input>
                            {isMobile ? 
                            <StakeControls
                              amountToStake={amountToStake}
                              przsBalance={przsBalance}
                              // sideButtonsGroupSize={sideButtonsGroupSize}
                              approve={approve}
                              handleStakeAll={handleStakeAll}
                             /> : <></>}
                        </HStack>
                        </Box>

                          <VStack mr={95}>
                          <Box w="200px" ml={isMobile ? "-2vh" : "1vh"} pb={20} mt={isMobile ? -60 : 10}>
                           {amountToStakeReadable > 0 ?  <Text ml={isMobile ? 18 : 0} style={{fontSize:"16px"}} color="lightgray">(Staking: {formatNumber(Number(amountToStakeReadable))})</Text> : <></>}
                          </Box>
                          </VStack>
                            <Box mt={isMobile ? 0 : -20}>
                              <HStack>
                              {!isMobile ? 
                              <Button 
                              mt={-20}
                              isDisabled={amountToStake == 0 || przsBalance == 0}
                              width={"120px"} 
                              style={{ border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => approve()}
                            > 
                            &nbsp;Stake 
                            </Button> : <></>}
                              {isMobile ? <></> : <Box ml={20}>
                                <StakeControls 
                                  amountToStake={amountToStake}
                                  przsBalance={przsBalance}
                                  sideButtonsGroupSize={sideButtonsGroupSize}
                                  approve={approve}
                                  handleStakeAll={handleStakeAll}                              
                                />  
                                </Box>}
                              {/* <Button 
                                mt={-20}
                                isDisabled={amountToStake == 0 || przsBalance == 0}
                                width={"120px"} 
                                style={{ border:"1px solid white", borderRadius:"10px"}}
                                onClick={() => approve()}
                              > 
                              &nbsp;Stake 
                              </Button>  */}
                              
                              </HStack>
                            </Box>
                          </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3" >
                          {/* <Text>test</Text>
                          <br />      */}
                          <Flex alignContent={"left"} direction={"column"}>
                            {/* <Box className="input-text">
                            <label>You stake:</label><br/>
                              <Input 
                                  mt={4} 
                                  placeholder="--"
                                  value={commify(amountToStakeReadable)}
                                  height={35} 
                                  placeHolder="0.0000" 
                                  style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                  width={180} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>                                                         
                            </Box>               */}
                            {/* <Box mt={10}>                
                            <Box className="input-text">
                            <label>You get:</label><br/>
                              <Input 
                                  mt={4} 
                                  value={commify(getRewardsFromMap(selectedTier, selectedTime))}
                                  height={35} 
                                  placeHolder="0.0000" 
                                  style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                  width={180} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>                                                           
                            </Box>
                            </Box> */}
                            </Flex>
                        </Box>
                      </Box>
                    </Box>
                  </Box>                   
                   {/* {stakedBalance == 0 || typeof stakedBalance == "undefined" ?
                   <Box className="tab-content mt-md-3" id="myTabContent">
                    <Heading as="h4" size="md">Phase 1 (Old)</Heading>
                    <Text style={{fontSize:"13px", marginTop:"-20px"}}>
                      {!ctx.isSpanishCountry ? "Earn up to 300M PRZS in 30 days" : "Gana hasta 300 millones de PRZS en 30 días"}
                    </Text>
                    <Box
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <Box className="input-box my-4 d-flex row" >
                        <Box className="input-area col-lg-6 col-12 mb-3">
                          <Box className="input-text">
                            <label>{!ctx.isSpanishCountry ? "Choose deposit amount" : "Elija el monto del depósito"} </label>
                            <Select 
                              placeholder='' 
                              defaultValue={-1}
                              width={"50%"} 
                              height={40}
                              fontSize={13}
                              style={{border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}}
                              onChange={(ev) => handleSelectTierV1(ev.target.value)} 
                              mt={4} 
                            >
                              <option value='"-1"'>Choose tier</option>
                              <option value='0'>Tier 1</option>
                              <option value='1'>Tier 2</option>
                              <option value='2'>Tier 3</option>
                              <option value='3'>Tier 4</option>
                            </Select>
                          </Box>
                        </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3">
                          <Box className="input-text">
                            <label>Choose time</label>
                            <SimpleGrid>
                              <HStack>
                              <Box w={"70%"}>
                                <Select 
                                  placeholder='' 
                                  defaultValue={0}
                                  width={"100%"} 
                                  height={40}
                                  fontSize={13}
                                  style={{border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}}
                                  onChange={(ev) => handleSelectTime(ev.target.value)} 
                                  mt={4} 
                              >
                                  <option value='0'>30 days</option>
                              </Select>
                              </Box>
                              </HStack>                             
                            </SimpleGrid>
                          </Box>
                        </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3">
                            <Flex alignContent={"left"} direction={"column"}>
                            <Box className="input-text">
                            <label>You stake:</label><br/>
                              <Input 
                                  mt={4} 
                                  placeholder="--"
                                  value={commify(amountToStakeReadableV1)}
                                  height={35} 
                                  placeHolder="0.0000" 
                                  style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                  width={180} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>                                                         
                            </Box>              
                            <Box mt={10}>                
                            <Box className="input-text" >
                            <label>You get:</label><br/>
                              <Input 
                                  mt={4} 
                                  value={commify(getRewardsFromMap(selectedTier, selectedTime))}
                                  height={35} 
                                  placeHolder="0.0000" 
                                  style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                  width={180} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>                                                           
                            </Box>
                            </Box>
                            </Flex>
                        </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3">
                        <h4>Your wallet</h4>
                        <Box className="input-text">
                            <label>Balance</label><br/>
                            <Input 
                              mt={4} 
                              value={commify(formatEther(przsBalance?.toString() || 0))}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>  
                          <Box className="input-text" mt={10}>
                            <label>Staked</label><br/>
                            <Input 
                              mt={4} 
                              value={commify(formatEther(stakedBalance?.toString() || 0))}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />&nbsp;&nbsp;
                            <Image src={logoPRZS} width="25px"></Image>  
                            { stakedBalance > 0 && !isMobile ?
                            <Box mt={10} ml={-10}>
                              <Button 
                                w={180} 
                                style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                                onClick={() => unStake()}
                              > 
                              &nbsp;Unstake & Claim
                            </Button>                              
                            </Box> : stakedBalance > 0 && isMobile ? 
                            <Box mt={-10} ml={-10}>
                              <br />
                              <Button 
                                size="md" 
                                style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                                onClick={() => unStake()}
                              > 
                              &nbsp;Unstake & Claim
                            </Button>                                                          
                            </Box> : <></> }                            
                          </Box>                        
                        </Box>
                        
                        </Box>
                      </Box>
                    </Box>
                  </Box> : 
                  <></>}  */}
                  {/* <Box className="tab-content mt-md-3" id="myTabContent">
                    
                    <Box
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <Box className="input-box my-4 d-flex row">
                        <Box className="input-area col-lg-6 col-12 mb-3">

                        </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3">

                        </Box>
                      </Box>
                    </Box>
                  </Box>  */}
                </Box>
              </Box>
              <Box className="col-12 col-md-5">
              <Box className="staking-items mt-4 mt-md-0" >
                  <Box className="card no-hover staking-card" border="1px solid" >
                  <Heading as="h5" size="md" mt={-20}>Phase 2 (Current)</Heading>
                  <SimpleGrid>
                  <Box w="50%" >
                    
                    <HStack><Heading as="h4">APR</Heading> 
                    <label fontSize={"md"} fontColor="gray" mt={-2}>
                      {commify(tierAPR)}%
                      </label>
                      </HStack>
                  </Box>
                  <Box w="50%">
                  <SimpleGrid mt={20}>
                        <HStack>
                        <Box w={"50%"} ml={150}>
                          {/* <HStack>
                            <Text>Time left</Text>
                          </HStack> */}
                        </Box>
                        <Box w={"50%"} w={150}>
                        <Box mt={!isMobile? "-100px" :"-100px"}>
                          {/* <Button 
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              w={"200px"}
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => unStake()}
                            > 
                            &nbsp;Unstake & Claim
                          </Button>                                    */}
                          <VStack>
                            {stakesCount > 0 ?
                          <Button 
                            size="sm" 
                            borderRadius={10} 
                            mt={10} 
                            ml={60}
                            w={120} 
                            onClick={() => getRewards()}
                          >Get Reward</Button> : <></>}
                          <Button 
                            mt={10}
                            ml={60}
                            w={120} 
                            style={{border:"1px solid white", borderRadius:"10px"}}
                            onClick={() => withdraw()}
                            isDisabled={!isSelectedPositionUnlocked}
                            >Exit
                            </Button>
                           </VStack>                          
                          {/* <Text style={{fontSize:"13px"}} ml={10}>You will be able to claim your reward once the countdown ends.</Text>                           */}
                          </Box>

                        </Box>
                        </HStack>
                      </SimpleGrid>
                  </Box>
                </SimpleGrid>
                  <Box ml={isMobile ? -15 : 0}>
                  <SimpleGrid>
                    <HStack>
                      <Box w="50%" h="auto">
                      <Heading as="h4" size="md">
                         Total Earned
                        </Heading>
                        <VStack>
                        <HStack>
                          <Box w="160px" textAlign="right" mr={80} >
                          <Heading as="h6" style={{color:"lightgray"}}>
                            {stakesCount > 0 && realtimeRewards > 0 ? 
                              commify(formatEther(realtimeRewards || 0), 4) : 0}
                            </Heading>
                          </Box>
                          <Image src={logoPRZS} width="15px" mt={-5} ml={-80}></Image>
                        </HStack>
                        <Text mt={-20} style={{fontSize:"14px"}}> (${formatAndCommifyNumber(Number(formatEther(realtimeRewards || 0)) * Number(priceUSD).toFixed(12))})</Text>
                        </VStack>
                      </Box>
                      <Box w="50%">
                      <Heading as="h4" size="md">
                         {isMobile ? "Position" : "Position Earned"}
                        </Heading>
                        <VStack>
                          <HStack>
                          <Box w="160px" textAlign="right" mr={80}>
                            <Heading as="h6" style={{color:"lightgray"}}>
                              {stakesCount > 0 && earnedOnStake > 0 ? 
                                commify(formatEther(earnedOnStake || 0), 4) : 0}
                              </Heading>
                            </Box>
                            <Image src={logoPRZS} width="15px" mt={-5} ml={-80}></Image>
                            </HStack>
                        <Text mt={-20} style={{fontSize:"14px"}}>(${formatAndCommifyNumber(Number(formatEther(earnedOnStake || 0)) * Number(priceUSD).toFixed(12))})</Text>
                        </VStack>
                        </Box>
                      </HStack>
                  </SimpleGrid>
                  </Box>
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
                  <Box className="card no-hover staking-card">
                  <Heading as="h4" size="md" mt={-20}>Phase 1 (Old)</Heading>
                    <SimpleGrid >
                        <HStack>
                        <Box w={"50%"} style={{marginBottom: "10px"}} >
                          <HStack> 
                          <SimpleGrid>
                            <HStack>
                              <Box w="160px" textAlign="right" mr={80}>
                              <Heading as="h6" style={{color:"lightgray"}}>
                                {stakedBalance > 0 ? accumulatedRewards > 0 ? 
                                  commify(accumulatedRewards, 2) : 0 : 0}
                                </Heading>
                              </Box>
                              <Image src={logoPRZS} width="15px" mt={-5} ml={-80}></Image>
                            </HStack>
                          </SimpleGrid>
                          
                      </HStack>                          
                        </Box>
                        <Box w={"50%"}>
                          <HStack mt={-10}>
                            &nbsp;&nbsp;<Text size={isMobile ? "small" : "md"}></Text>
                          </HStack>
                        </Box>
                        </HStack>
                      </SimpleGrid>                    
                      <SimpleGrid >
                        <HStack>
                        <Box w={"50%"} mt={10}>
                          {stakedBalance > 0 ?
                          <HStack>
                            <Heading as="h5" className="m-0" fontColor="lightgray">{timeLeft != "" ? timeLeft : expDate}</Heading>
                          </HStack> : 
                          <h4 className="m-0">-- -- --</h4>}
                        </Box>
                        <Box w={"50%"}>
                           
                        </Box>
                        </HStack>
                      </SimpleGrid>
                      <SimpleGrid mt={20}>
                        <HStack>
                        <Box w={"50%"}>
                          <HStack>
                            <Text>Time left</Text>
                          </HStack>
                        </Box>
                        <Box w={"50%"} w={150}>
                          <Box mt={!isMobile? "-100px" :"-100px"}>
                          <HStack>                       
                          <Button 
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              w={"200px"}
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => unStake()}
                            > 
                            &nbsp;Unstake & Claim
                          </Button>                                   
                          </HStack>
                          <Text style={{fontSize:"13px"}} ml={10}>You will be able to claim your reward once the countdown ends.</Text>                          
                        </Box>
                        </Box>
                        </HStack>
                      </SimpleGrid>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </section>
      {(staking ||
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
      )}
    </>
  );
}

export default Staking;