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
import { rewardsMap, depositMap } from "../core/Constants";

const Staking: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);
  const { address, connector, isConnected } = useAccount();

  const [unlockTime, setUnlockTime] = useState("");
  const [amountToStake, setAmountToStake] = useState(0);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [selectedTier, setSelectedTier] = useState("0");
  const [selectedTime, setSelectedTime] = useState("0");
  const tokenAddress = "0x53Ff62409B219CcAfF01042Bb2743211bB99882e";
  const stakingAddress = "0xAffd47A9d9d8c99E629d10F57523d201c6070509";
  const [timeLeft, setTimeLeft] = useState("");
    // Initialize state with value from localStorage
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
    watch: false,  // Ensure it doesn't refetch on every render automatically if not desired
  });

  const { data: totalStakers, refetch } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "getTotalStakers",
    args: [address], 
    watch: false,  // Ensure it doesn't refetch on every render automatically if not desired
  });

  // console.log(`Total stakers: ${totalStakers} realtimeTime rewards ${realtimeRewards} stakedBalance ${stakedBalance}`)

  // Effect to trigger the refetch on mount and when address or stakingAddress changes
  useEffect(() => {
    refetch();
  }, [address, stakingAddress, refetch]);

  const { data: isUserStaked  } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "isUserStaked",
    args: [address], 
  });
 
  // const {data: unlockTime} = useContractRead({
  //   address: stakingAddress,
  //   // @ts-ignore
  //   abi: PerezosoStakingAbi.abi,
  //   functionName: "getUnlockTime",
  //   args: [address], 
  // });
  

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
      // Retrieve the expiration date from localStorage
      const expData = localStorage.getItem('expData');
      if (!expData) {
          console.error("Expiration data not found in localStorage.");
          return;
      }
  
      // Parse the expiration date reliably
      const unlockDate = new Date(expData);
      if (!unlockDate) {
          console.error("Failed to parse the expiration date.");
          return;
      }
  
      // Get the current date and time
      const now = new Date();
  
      // Calculate the time left until the unlock date in seconds
      let delta = Math.floor((unlockDate - now) / 1000);
  
      // Check if the countdown has finished
      if (delta <= 0) {
          console.log("Countdown has finished.");
          clearInterval(interval);  // Assuming 'interval' is the interval ID for setInterval
          return;
      }
    
      function countdown(seconds, setTimeleft) {
        function printTime(secondsLeft) {
              if (secondsLeft < 0) return; // Stop the countdown when less than zero
              console.log(`${secondsLeft} / 86400`);
              
              const days = Math.floor(secondsLeft / 86400);
              const hours = Math.floor((secondsLeft % 86400) / 3600);
              const minutes = Math.floor((secondsLeft % 3600) / 60);
              const seconds = secondsLeft % 60;
      
              console.log(`${days}d ${hours}h ${minutes}m ${seconds}s`);
              if (!isNaN(days) && !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds)) {
                setTimeleft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
              }

              if (secondsLeft > 0) {
                  setTimeout(() => printTime(secondsLeft - 1), 1000);  // Recursive call
              }
          }
      
          printTime(seconds);
      } 

      // Calculate the reward increment per second
      const totalReward = rewardsMap[selectedTier][selectedTime]; // Ensure these variables are defined and accessible
      const rewardIncrement = totalReward / 2592000;  // Fixed reward rate per second
      
      const realtimeRewards = JSON.parse(localStorage.getItem('realtimeRewards') || "0");

      // Update the rewards
      setRealtimeRewards(prev => {
        const updatedRewards = prev + rewardIncrement;
        localStorage.setItem('realtimeRewards', JSON.stringify(updatedRewards));
        return updatedRewards;
      });
      
      // Log the current reward rate
      console.log(`Realtime Rewards Updated: ${realtimeRewards.toFixed(8)}`);
      console.log(`Delta is ${delta}`);

      if (!isNaN(delta))
        countdown(delta, setTimeLeft);

      // Optionally update UI or perform further actions with `realtimeRewards` and formatted time
    }

     
    // Update the countdown every 1 second
    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();  // Initial update
    
    return () => clearInterval(interval);  // Cleanup
  }, [unlockTime]);

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
      setAmountToStake(parseEther(`${value}`));
    }
  };

  const getDepositAmount = (tier: string) => {
    const tierIndex = Number(tier);
    if (tierIndex >= 0 && tierIndex < depositMap.length) {
      return depositMap[tierIndex];
    } else {
      return "0"; // Default or error value
    }
  };
  
  const handleSelectTier = (value: string) => {
    setSelectedTier(value);
    console.log(`Selected tier is ${value}`)
    if (Number(value) >= 0) {
       
      handleAmountToStake(getDepositAmount(value));
      console.log(`${getDepositAmount(value)}`)
    } else {
      handleAmountToStake(0);
      return;
    }
  }

  const handleSelectTime = (value: string) => {
    setSelectedTime(value);
    console.log(`Selected time is ${value}`)
  }

  const getRewardsFromMap = (tier: string, time: string) => {
    if (Number(tier) >= 0) {
      return rewardsMap[Number(tier)][Number(time)];
    } else {
      return 0;
    }    
  }

  useEffect(() => {
      // Check if it's the first time the user has visited this component
      const isFirstVisit = localStorage.getItem('hasVisitedBefore');

      if (!isFirstVisit) {
          console.log("Welcome! This is your first time here.");
          
          // Now set the flag in localStorage so next time this won't run
          localStorage.setItem('hasVisitedBefore', 'true');

          const expData = localStorage.getItem('expData');

          if (expData == null) {
            const now = new Date();
            let unlockDate = new Date(now.getTime());
            unlockDate.setDate(now.getDate() + 30);
            unlockDate = unlockDate.toISOString().split('T', 1)[0];
            console.log(`Unlock date is ${unlockDate}`)
            localStorage.setItem('expData', JSON.stringify(unlockDate));        
          }          

          // Perform any other actions for first-time visit
      } else {
          console.log("Welcome back!");
      }
  }, []);  // The empty array ensures this hook is only run on mount

  useEffect(() => {
    console.log(`Is user staked ${isUserStaked} realtime rewards ${realtimeRewards} stakedBalance ${stakedBalance}`)

    async function updateRewardsLs() {
      if (realtimeRewards > 0)  {
        if (isUserStaked != "") {
          localStorage.setItem('realtimeRewards', realtimeRewards.toString());
        } else 
        {
          localStorage.setItem('realtimeRewards', "0");
        } 
      }
    }
    const interval = setInterval(updateRewardsLs, 1000);
    updateRewardsLs();  // Initial update

    return () => clearInterval(interval);  // Cleanup
  }, [realtimeRewards, stakedBalance, isUserStaked])

  return(
    <>
      <section className="hero-section">
        <div className="staking-area">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-7">
                <div className="card no-hover staking-card single-staking">
                  <h3 className="m-0">
                    {!ctx.isSpanishCountry ? "Stake your Perezoso token" : "Acuña tu token Perezoso"}</h3>
                  <span className="balance">
                  {!ctx.isSpanishCountry ? "Earn up to 10 Billion PRZS in 365 days" : "Gana hasta 10 Billones de PRZS en 365 días"}
                  </span>
                  {stakedBalance == 0 || typeof stakedBalance == "undefined" ?
                   <div className="tab-content mt-md-3" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <div className="input-box my-4 d-flex row" >
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
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
                              // isDisabled={account == null}
                            >
                              <option value='"-1"'>Choose tier</option>
                              <option value='0'>Tier 1</option>
                              <option value='1'>Tier 2</option>
                              <option value='2'>Tier 3</option>
                              <option value='3'>Tier 4</option>
                            </Select>
                          </div>
                        </div>
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
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
                                // isDisabled={account == null}
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


                          </div>
                        </div>
                        <div className="input-area col-lg-6 col-12 mb-3">
                            
                            <Flex alignContent={"left"} direction={"column"}>
                            <div className="input-text">
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
                            </div>              
                            <Box mt={10}>                
                            <div className="input-text">
                            <label>You get:</label><br/>
                              <Input 
                                  mt={4} 
                                  value={commify(getRewardsFromMap(selectedTier, selectedTime))}
                                  height={35} 
                                  placeHolder="0.0000" 
                                  style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                  width={180} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>                                                           
                            </div>
                            </Box>
                            </Flex>
                        </div>
                      </div>
                    </div>
                  </div> : 
                  <></>}
                  <div className="tab-content mt-md-3" id="myTabContent">
                    <h4>Your wallet</h4>
                    <div
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <div className="input-box my-4 d-flex row">
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
                            <label>Balance</label><br/>
                            <Input 
                              mt={4} 
                              value={commify(formatEther(przsBalance?.toString() || 0))}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />&nbsp;&nbsp;<Image src={logoPRZS} width="25px"></Image>  
                          </div>
                        </div>
                        {/* <div className="input-area col-lg-6 col-12 mb-3">
                          { stakedBalance > 0 ?
                          <div className="input-text">
                            <label>Rewards</label><br/>
                            <Input 
                              mt={4} 
                              value={commify(formatEther(accumulatedRewards?.toString() || 0))}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />  
                                          
                          </div> :
                          <></> }
                        </div> */}
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
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
                          </div>
                        </div>
                        <div className="col-lg-6 col-12" style={{marginTop:"20px"}}>
                        {/* {stakedBalance == 0 ?
                        <label>Amount <Image src={logoPRZS} width="25px"></Image> (PRZS)</label> : <></>}
                          <Box mb={20}>
                          <HStack>
                            {stakedBalance == 0 ?
                            <NumberInput 
                              mt={4} 
                              height={40}
                              min={0}
                              step={100}
                              max={formatEther(przsBalance?.toString() || 0)}
                              width={"50%"} 
                              onChange={value => handleAmountToStake(value)}
                            >
                              <NumberInputField 
                                  height={40} 
                                  style={{border:"1px solid white", borderRadius: "10px", backgroundColor:"gray"}}
                              />
                              <NumberInputStepper mr={5} h={10} pt={2}>
                                  <NumberIncrementStepper />
                                  <NumberDecrementStepper />
                              </NumberInputStepper>
                            </NumberInput> : <></>}

                            </HStack>    
                            <Box mt={stakedBalance > 0 && !isMobile ? 30 : 2} mt={10}>
                              <HStack>

                              </HStack>
                            </Box>                             
                          </Box>                       */}
                        </div>
                      </div>
                    </div>
                  </div> 
                </div>
              </div>
              <div className="col-12 col-md-5">
                <div className="staking-items mt-4 mt-md-0">
                  <div className="card no-hover staking-card">
                    <SimpleGrid >
                        <HStack>
                        <Box w={"20%"} style={{marginBottom: "10px"}}>
                          <HStack >
                            <h5 className="m-0" style={{width:"220px"}}>{
                              isUserStaked ? realtimeRewards > 0 ? 
                              commify(realtimeRewards.toFixed(4)) : 0 : 0
                            }</h5> 
                          </HStack>
                        </Box>
                        <Box w={"50%"}>
                          <HStack mt={-10}>
                            <p>&nbsp;&nbsp;(PRZS)</p>
                          </HStack>
                        </Box>
                        </HStack>
                      </SimpleGrid>                    
                      <SimpleGrid >
                        <HStack>
                        <Box w={"50%"} mt={10}>
                          {stakedBalance > 0 ?
                          <HStack>
                            <h5 className="m-0">{timeLeft}</h5>
                          </HStack> : 
                          <h4 className="m-0">-- -- --</h4>}
                        </Box>
                        <Box w={"50%"}>
                          {/* <HStack>
                            {realtimeRewards == 0 ?
                            <Button 
                              w={"200px"}
                              isDisabled={realtimeRewards == 0}
                              style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => claim()}
                            > 
                            &nbsp;Claim 
                          </Button> : <></>}
                          </HStack> */}
                          
                        </Box>
                        </HStack>
                      </SimpleGrid>
                    <SimpleGrid mt={20}>
                        <HStack>
                        <Box w={"50%"}>
                          <HStack>
                            <p>Time left</p>
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
                          <Text style={{fontSize:"13px"}} ml={10}>You will be able to claim your reward once the time expires.</Text>                          
                          </Box>
                        </Box>
                        </HStack>
                      </SimpleGrid>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {(staking ||
        approving ||
        isWaitingForApproval) && (
        <div className="loader">
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
        </div>
      )}
    </>
  );
}

export default Staking;