import React, { useState, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";
import { CirclesWithBar } from "react-loader-spinner";

import { 
    Heading, 
    Box,
    Stack, 
    Image,
    Text,
    Input,
    Button,
    Flex,
    HStack,
    Select,
    SimpleGrid,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,       
    VStack
} from '@chakra-ui/react';

import { Address, useAccount, useContractRead, useContractWrite } from "wagmi";
import logoPRZS from "../../public/assets/images/logo.png";
import TOKENABI from "../core/TokenABI.json";
import PerezosoStakingAbi from "../core/PerezosoStaking.json";
import { toast } from "react-toastify";

import { parseEther, formatEther } from "ethers";
import { commify } from "../utils";
import { isMobile } from "react-device-detect";
import { rewardsMap, depositMap, totalStakingTime, rewardSpeeds } from "../core/Constants";

const Staking: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);
  const { address, connector, isConnected } = useAccount();

  const [amountToStake, setAmountToStake] = useState(0);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [selectedTier, setSelectedTier] = useState("0");
  const [selectedTime, setSelectedTime] = useState("0");
  const tokenAddress = "0x53Ff62409B219CcAfF01042Bb2743211bB99882e";
  const stakingAddress = "0xE2DF958c48F0245D823c2dCb012134CfDa9F8f9F";
  const [timeLeft, setTimeLeft] = useState("");
  const [expDate, setExpDate] = useState("");
  
    const [realtimeRewards, setRealtimeRewards] = useState(() => {
      return JSON.parse(localStorage.getItem('realtimeRewards') || "0");
  });

  const {data: przsBalance, refetch: refetchPrzsBalance} = useContractRead({
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

  const { data: isUserStaked  } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "isUserStaked",
    args: [address], 
    watch: true
  });
 
  const {data: unlockTime} = useContractRead({
    address: stakingAddress,
    // @ts-ignore
    abi: PerezosoStakingAbi.abi,
    functionName: "getUnlockTime",
    args: [address], 
  });
  
  const { isLoading: staking, write: stake } = useContractWrite({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "stake",
    args: [selectedTier, selectedTime],
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
      if (data?.stack?.includes("ransfer amount exceeds balance")) {
        toast("Not enough PRZS in your wallet.");
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
        
      function calculateAccumulatedRewards(startTimeInSeconds, rewardPerSecond) {

        const currentTimeInSeconds = Math.floor(Date.now() / 1000); 
        const elapsedTimeInSeconds = currentTimeInSeconds - startTimeInSeconds;
        const accumulatedRewards = elapsedTimeInSeconds * rewardPerSecond;
    
        return accumulatedRewards;
      }

      let rewardPerSecond = 0;
      console.log(`StakedBalance is ${commify(formatEther(typeof stakedBalance != "undefined" ? stakedBalance : 0))} Selected tier is ${selectedTier} Reward per second is ${rewardPerSecond}`);

      if (stakedBalance == parseEther("1000000000")) {
        setSelectedTier(0);
        setSelectedTime("0");
      } else if (stakedBalance == parseEther("10000000000")) {
        setSelectedTier(1);
        setSelectedTime(0);
      }
      else if (stakedBalance == parseEther("100000000000")) {
        setSelectedTier(2);
        setSelectedTime(0);
      }
      else if (stakedBalance == parseEther("1000000000000")) {
        setSelectedTier(3);
        setSelectedTime(0);
      }

      // console.log(rewardSpeeds[selectedTier])
      // console.log(`Selected Time ${selectedTime} Selected Tier ${selectedTier}`)
      // console.log(rewardSpeeds[selectedTier][selectedTime])
    
      rewardPerSecond = rewardsMap[selectedTier][selectedTime] / totalStakingTime;  

      const accumulatedRewards = calculateAccumulatedRewards(startTime, rewardPerSecond);
  
      setRealtimeRewards(accumulatedRewards);
  
      function calculateTimeLeft(unlockTime) {
        const now = Math.floor(Date.now() / 1000);  
    
        let delta = unlockTime - now;
        
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
  }, [unlockTime, selectedTier, selectedTime]);

  // @ts-ignore
  const { isLoading: approving, write: approve } = useContractWrite({
    address: tokenAddress,
    abi:  TOKENABI,
    functionName: "approve",
    args: [stakingAddress as Address, amountToStake],
    onSuccess: () => {
      setIsWaitingForApproval(true);
      setTimeout(() => {
        stake();
        setIsWaitingForApproval(false);
      }, 5000);
    },
    onError() {
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


  const handleAmountToStake = (value: string) => {
    if (typeof value != "undefined") {
      setAmountToStake(value);
    }
  };

  const getDepositAmount = (tier: string) => {
    const tierIndex = Number(tier);
    if (tierIndex >= 0 && tierIndex < depositMap.length) {
      return depositMap[tierIndex];
    } else {
      return "0"; 
    }
  };
  
  const handleSelectTier = (value: string) => {
    setSelectedTier(value);
    console.log(`Selected tier is ${value}`)
    if (Number(value) >= 0) {
       
      handleAmountToStake(parseEther(`${getDepositAmount(value)}`));
      console.log(`${getDepositAmount(value)}`)
    } else {
      handleAmountToStake(0);
      return;
    }
  }

  const handleSelectTime = (value: string) => {
    setSelectedTime(value);
  }

  const getRewardsFromMap = (tier: string, time: string) => {
    if (Number(tier) >= 0) {
      return rewardsMap[Number(tier)][Number(time)];
    } else {
      return 0;
    }    
  }

  const amountToStakeReadable = commify(formatEther(amountToStake));

  return(
    <>
      <section className="hero-section">
        <Box className="staking-area">
          <Box className="container">
            <Box className="row justify-content-center">
              <Box className="col-12 col-md-7">
                <Box className="card no-hover staking-card single-staking">
                  <h3 className="m-0">
                    {!ctx.isSpanishCountry ? "Stake your Perezoso token" : "Acuña tu token Perezoso"}</h3>
                  <span className="balance">
                  {!ctx.isSpanishCountry ? "Earn up to 10 Billion PRZS in 365 days" : "Gana hasta 10 Billones de PRZS en 365 días"}
                  </span>
                  {stakedBalance == 0 || typeof stakedBalance == "undefined" ?
                   <Box className="tab-content mt-md-3" id="myTabContent">
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
                              onChange={(ev) => handleSelectTier(ev.target.value)} 
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
                                  <option value='0'>30  days</option>
                              </Select>
                              </Box>
                              </HStack>
                              {stakedBalance == 0 || typeof stakedBalance == "undefined"?
                                    <Button 
                                      mt={10}
                                      isDisabled={amountToStake == 0}
                                      width={"60%"} 
                                      style={{ border:"1px solid white", borderRadius:"10px"}}
                                      onClick={() => approve()}
                                  > 
                                  &nbsp;Stake 
                                  </Button> : 
                                  <></>}                              
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
                                  value={commify(amountToStake)}
                                  height={35} 
                                  placeHolder="0.0000" 
                                  style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                  width={180} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>                                                         
                            </Box>              
                            <Box mt={10}>                
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
                            </Box>
                            </Flex>
                        </Box>
                      </Box>
                    </Box>
                  </Box> : 
                  <></>}
                  <Box className="tab-content mt-md-3" id="myTabContent">
                    <h4>Your wallet</h4>
                    <Box
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <Box className="input-box my-4 d-flex row">
                        <Box className="input-area col-lg-6 col-12 mb-3">
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
                          </Box>
                        </Box>
                        <Box className="input-area col-lg-6 col-12 mb-3">
                          <Box className="input-text">
                            <label>Staked</label><br/>
                            <Input 
                              mt={4} 
                              value={commify(formatEther(stakedBalance?.toString() || 0))}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>  
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
                </Box>
              </Box>
              <Box className="col-12 col-md-5">
                <Box className="staking-items mt-4 mt-md-0">
                  <Box className="card no-hover staking-card">
                    <SimpleGrid >
                        <HStack>
                        <Box w={"20%"} style={{marginBottom: "10px"}}>
                          <HStack >
                            <h5 className="m-0" style={{width:"220px"}}>{
                              isUserStaked ? realtimeRewards > 0 ? 
                              commify(realtimeRewards.toFixed(2)) : 0 : 0
                            }</h5> 
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
                            <h5 className="m-0">{timeLeft != "" ? timeLeft : expDate}</h5>
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