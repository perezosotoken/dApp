import React, { useState, useContext, useEffect } from "react";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";
import { CirclesWithBar } from "react-loader-spinner";

import { 
    Heading, 
    Box,
    Image,
    Text,
    Input,
    Button,
    HStack,
    Select,
    SimpleGrid,
    VStack,
    Tooltip
} from '@chakra-ui/react';

import { useAccount, useContractRead, useContractWrite } from "wagmi";
import logoPRZS from "../../public/assets/images/logo.png";
import logoLPToken from "../../public/assets/images/logoLiq.png";

import TOKENABI from "../core/TokenABI.json";
import StakingRewardsArtifact from "../core/StakingRewards.json";
import PerezosoStakingAbi from "../core/PerezosoStaking.json";
import PerezosoFarmingLPAbi from "../core/PerezosoFarmingLP.json";
import StakeControls from '../components/StakeControls.tsx';
import { rewardsMap, depositMap, totalStakingTime } from "../core/Constants";

import { toast } from "react-toastify";

import { parseEther, formatEther } from "ethers";
import { commify, formatNumber, formatAndCommifyNumber } from "../utils";
import { isMobile } from "react-device-detect";
import axios from 'axios';
import { ethers } from 'ethers';

const Staking: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);
  const { address, isConnected } = useAccount();

  const ticker = "perezoso";

  const tokenAddress = "0x53ff62409b219ccaff01042bb2743211bb99882e";
  const lpTokenAddress = "0xe2F4A4534133BEacD8542F404f8C9D5135fBaF0e";
  
  const stakingAddress = "0xE2DF958c48F0245D823c2dCb012134CfDa9F8f9F";
  const stakingV2Address = "0x1FbDB5c46F6a33eC22a7AF990518Ed4610864b2c";
  const stakingLPAddress = "0x3B6109F05D7C32F887A65646511486695FEa6428";

  /** V1 Variables */
  const [amountToStakeV1, setAmountToStakeV1] = useState(parseEther(`${0}`));
  const [selectedTierV1, setSelectedTierV1] = useState("0");
  const [selectedTimeV1, setSelectedTimeV1] = useState("0");
  const [accumulatedRewards, setAccumulatedRewards] = useState(0);
  const [stakeTypeIcon, setStakeTypeIcon] = useState(logoPRZS);

  const [selectedType, setSelectedType] = useState(-1);

  const [stakesCount, setStakesCount] = useState(0);

  const [realtimeRewards, setRealtimeRewards] = useState(0);
  const [realtimeRewardsLp, setRealtimeRewardsLp] = useState(0);

  /** V2 Variables */
  const [amountToStake, setAmountToStake] = useState(parseEther(`${0}`));
  const [selectedTier, setSelectedTier] = useState("1");
  const [selectedTime, setSelectedTime] = useState("2592000");
  const [selectedStake, setSelectedStake] = useState("0");
  const [currentStakingAddress, setCurrentStakingAddress] = useState(ethers.AddressZero);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [isSelectedPositionUnlocked, setIsSelectedPositionUnlocked] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [lpAprFromApi, setLpAprFromApi] = useState(0);

  const [timeLeft, setTimeLeft] = useState("");
  const [expDate, setExpDate] = useState("");
  const [baseAPR, setBaseAPR] = useState(0);
  const [tierAPR, setTierAPR] = useState(0);
  const [lpAPR, setLpAPR] = useState(0);
  const [priceUSD, setPriceUSD] = useState(0);

  const { data: realtimeRewardsBN, refetch: refetchRewards } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "earned",
    args: [address],
    watch: true,
  });

  const { data: realtimeRewardsLpBN, refetch: refetchRewardsLp } = useContractRead({
    address: stakingLPAddress,
    abi: PerezosoFarmingLPAbi.abi,
    functionName: "earned",
    args: [address],
    watch: true,
  });

  const { data: totalSupplyLP, refetch: refetchTotalSupplyLp } = useContractRead({
    address: stakingLPAddress,
    abi: PerezosoFarmingLPAbi.abi,
    functionName: "totalSupply",
    args: [],
    watch: true,
  });

  const { data: stakingContractBalance, refetch: refetchStakingContractBalance } = 
  useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [stakingV2Address],
  });
  
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStakingContractBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, [stakingV2Address]);

  useEffect(() => {
    const fetchLpApr = async () => {
      const url = 'https://stats.perezosotoken.com/lpapr';
      const response = await fetch(url, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      const data = await response.json();
      setLpAprFromApi(Number(data.apr));
    };
  
    fetchLpApr();
  }, []);
  

  useEffect(() => {
    setCurrentStakingAddress(selectedType == 2 ? stakingV2Address : stakingLPAddress);
  }, [selectedType]);
  // Highlighted Changes End

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchTokenPrice = async () => {
        const url = 'https://stats.perezosotoken.com/price';
        const response = await fetch(url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        const text = await response.json();
        // console.log(`Token price is ${Number(text.price).toFixed(14)}`)
        setTokenPrice(Number(text.price).toFixed(14))
    };

    fetchTokenPrice();
    }, 3000);

    return () => clearInterval(interval);

  }, [isConnected]);

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
        const weeklyRewards = 30_000_000_000;

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

    const calculateAPRLP = async () => {
      if (stakingContractBalance) {
        const weeklyRewards = 50_000_000_000 * Number(tokenPrice);

        const stakingContractBalanceReadable = formatEther(totalSupplyLP); 
 
        const numerator = weeklyRewards * 52;
        const baseAPR = ((numerator / stakingContractBalanceReadable)) * 100;

        // console.log(`Token price is ${tokenPrice} Numerator is ${numerator} denominator ${stakingContractBalanceReadable} LP APR is ${baseAPR}`)
        setLpAPR((baseAPR).toFixed(2));
      } 
    }

    const interval = setInterval(() => {
      calculateAPR();
      calculateAPRLP();
    }, 1000);

    return () => clearInterval(interval);
  }, [stakingContractBalance, tokenPrice, selectedTime]);

  let { data: stakesCountBN } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "stakesCount",
    args: [address],
  });

  const { data: earnedOnStake } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "earnedOnStake",
    args: [address, selectedStake],
    watch: true,
  });
 
  useEffect(() => {
    const interval = setInterval(() => {
      refetchRewards();
    }, 5000);

    return () => clearInterval(interval);
  }, [stakesCount]);

  const { data: stakes } = useContractRead({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "getAllStakes",
    args: [address],
  });
  
  const totalStaked = stakes?.reduce((acc, stake) => acc + stake.amount, 0n) || 0;
  
  useEffect(() => {
    const interval = setInterval(() => {

      // console.log(stakes[selectedStake])
      // console.log(`${selectedType} ${selectedStake} ${stakes[selectedStake].lockEnd} < ${Math.floor(Date.now() / 1000)} = ${stakes[selectedStake].lockTime < Math.floor(Date.now() / 1000)}`)
      
      let isSelectedPositionUnlocked 

      try {
        isSelectedPositionUnlocked = stakes[selectedStake].lockEnd < Math.floor(Date.now() / 1000);

      } catch (err) {
        console.log(err)
      }
       
      isSelectedPositionUnlocked = selectedType == 2 ? true : isSelectedPositionUnlocked;
 
      setIsSelectedPositionUnlocked(isSelectedPositionUnlocked);
      
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedType, stakes, selectedStake]);

  const { data: lpTokenBalance } = useContractRead({
    address: lpTokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [address],
  });

  const { data: przsBalance } = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [address],
  });

  let { data: stakedBalanceBN, refetch: refetchStakedBalance } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "getStakedBalance",
    args: [address], 
    watch: true,  
  });

  let { data: stakedBalanceLP, refetch: refetchStakedBalanceLP } = useContractRead({
    address: stakingLPAddress,
    abi: PerezosoFarmingLPAbi.abi,
    functionName: "balanceOf",
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

  const { data: unlockTime } = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "getUnlockTime",
    args: [address], 
  });
  
  const { isLoading: updatingRewards, write: updateMyRewards } = useContractWrite({
    address: stakingV2Address,
    abi: StakingRewardsArtifact.abi,
    functionName: "updateMyRewards",
    args: [],
    onSuccess() {
      toast("Successfully refreshed rewards!");
    },
    onError() {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Transaction unsuccessful.");
    },
  });

  const { isLoading: gettingRewards, write: getRewards } = useContractWrite({
    address: selectedType == 1 ? stakingV2Address : stakingLPAddress,
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
    address: stakeTypeIcon == logoPRZS ? stakingV2Address : stakingLPAddress,
    abi: stakeTypeIcon == logoPRZS ? StakingRewardsArtifact.abi : PerezosoFarmingLPAbi.abi,
    functionName: "stake",
    args: stakeTypeIcon == logoPRZS ? [amountToStake, selectedTime] : [amountToStake],
    onSuccess() {
      toast(`Successfully staked your ${selectedType == 1 ? "PRZS" : "LP tokens"} !`);

      if (stakeTypeIcon == logoLPToken) {
        const now = new Date();
        const unlockDate = new Date(now.getTime());
        unlockDate.setDate(now.getDate() + 30);

        localStorage.setItem('expData', JSON.stringify(unlockDate));
        setExpDate(unlockDate.toISOString().split('T', 1)[0]);        
      }

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    },
    onError(data) {
      console.log(data)
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

  // console.log(`Token address ${ stakeTypeIcon == logoPRZS ? tokenAddress : lpTokenAddress} p ${stakingV2Address} pars ${[stakingLPAddress, amountToStake]}`);

  const { isLoading: approving, write: approve } = useContractWrite({
    address: stakeTypeIcon == logoPRZS ? tokenAddress : lpTokenAddress,
    abi: TOKENABI,
    functionName: "approve",
    args: stakeTypeIcon == logoPRZS ? [stakingV2Address, amountToStake] : [stakingLPAddress, amountToStake],
    onSuccess: () => {
      setIsWaitingForApproval(true);
      setTimeout(() => {
        stake();
        setIsWaitingForApproval(false);
      }, 5000);
    },
    onError(data) {
      console.log(data)
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Approval unsuccessful.");
    },
  });

  const { isLoading: exitingPosition, write: withdraw } = useContractWrite({
    address: stakingV2Address,
    abi:  StakingRewardsArtifact.abi,
    functionName: "withdraw",
    args: [selectedStake],
    onSuccess() {
      toast("Successfully withdrew your stake!");
      setTimeout(() => {
        window.location.reload();
      }, 5000);    
    },
    onError(data) {
      console.log(data)
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, cannot unstake position");
    },
  });

  const { isLoading: exitingPositionLp, write: withdrawLp } = useContractWrite({
    address: stakingLPAddress,
    abi:  PerezosoFarmingLPAbi.abi,
    functionName: "exit",
    args: [],
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
        let accumulatedRewards = 0;
        // console.log(`Staked balance is ${stakedBalance}`)
        if (stakedBalance <= parseEther("1000000000")) {
          setSelectedTierV1(0);
          setSelectedTimeV1("0");
          accumulatedRewards = 300_000;
        } else if (stakedBalance <= parseEther("10000000000")) {
          setSelectedTierV1(1);
          setSelectedTimeV1(0);
          accumulatedRewards = 3_000_000;
        }
        else if (stakedBalance <= parseEther("100000000000")) {
          setSelectedTierV1(2);
          setSelectedTimeV1(0);
        }
        else if (stakedBalance <= parseEther("1000000000000")) {
          setSelectedTierV1(3);
          setSelectedTimeV1(0);
        }  
   

        if (timeLeft > 0 ) {

          accumulatedRewards = 0;
          const currentTimeInSeconds = Math.floor(Date.now() / 1000); 
          const elapsedTimeInSeconds = currentTimeInSeconds - startTimeInSeconds;
          accumulatedRewards = elapsedTimeInSeconds * rewardPerSecond;  
  
          const now = Math.floor(Date.now() / 1000);  
          const delta = unlockTime - now;
  
          if (delta <= 0) {
            return Math.min(accumulatedRewards, 300000);
          }
        } else {

        }

        return stakedBalanceBN > 0 ? accumulatedRewards : 0;
      }

      let rewardPerSecond = rewardsMap[selectedTierV1][selectedTimeV1] / totalStakingTime;

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
    
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }

      calculateTimeLeft(unlockTime);
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();  
    
    return () => clearInterval(interval);  
  }, [address, unlockTime, selectedTierV1, selectedTimeV1]);

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

    setAmountToStake(
      selectedType == 1 ? 
      BigInt(przsBalance) * BigInt(quantity == "100" ? 9999n : quantity   
    ) / (quantity == "100" ? 10000n : 100n) :
      BigInt(lpTokenBalance) * BigInt(quantity) / 100n
    );
  };

  const handleSetSelectedStake = (value) => {
    setSelectedTime(stakes[value].lockPeriod);
    setSelectedStake(value);
  }
  
  useEffect(() => {
    if (amountToStake > 0) {
      // Handle logic when amountToStake changes
    }
  }, [amountToStake]);  

  useEffect(() => {
    if (typeof stakedBalanceBN !== "undefined") {
      setStakedBalance(stakedBalanceBN);
    }
  }, [stakedBalanceBN]);  

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

  const handleChangeStakingType = (value) => {
    setAmountToStake(0);
    switch (value) {
      case "1":
        setSelectedType("1")
        setCurrentStakingAddress(stakingV2Address);
        setStakeTypeIcon(logoPRZS);
        setStakedBalance(przsBalance);
        setStakesCount(stakesCountBN);
        setTotalEarned(realtimeRewardsBN);
        break;
      case "2":
        setSelectedType("2")
        setCurrentStakingAddress(stakingLPAddress);
        setStakeTypeIcon(logoLPToken);
        setStakedBalance(lpTokenBalance);   
        setStakesCount(0);     
        setTotalEarned(realtimeRewardsLp)
        break;
      default:
    }

    // console.log(`TS is ${totalSupplyLP} Selected type is  ${selectedType} ac is ${accumulatedRewards == 0} ${realtimeRewardsBN} ${realtimeRewardsLp} current staking address ${currentStakingAddress}`); 
  }

  const amountToStakeReadable = formatEther(amountToStake || 0);
  const sideButtonsGroupSize = isMobile ? "35px" : "25px";


  // console.log(`AC is ${accumulatedRewards} -- ${Number(accumulatedRewards) == 0}`)

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
          <Box className="container" >
            <Box className="row justify-content-center">
              <Box className="col-12 col-md-7" >
              <Box 
                className="card no-hover staking-card" 
                border="1px solid" 
                borderRadius={"30px 30px 0px 0px !important"} 
              >
              <Heading as="h3" className="m-0">
                    {!ctx.isSpanishCountry ? "Perezoso Farming (Phase 2)" : "Acuña tu token Perezoso"}</Heading>
                  <SimpleGrid>
                  <Box w="50%" >
                    
                  <HStack><h4>Choose type </h4><h5 style={{color:"tomato", fontWeight:"bolder"}}>(NEW)</h5></HStack>
                        <Box className="input-text">
                          <Select
                            width={160} 
                            height={45} 
                            border="1px solid" 
                            borderRadius={"10px"} 
                            onChange={(event) => handleChangeStakingType(event.target.value)}                           
                          >
                            <option key={0} value={0}>Choose ...</option>
                            <option key={1} value={1}>PRZS</option>
                            <option key={2} value={2}>BNB/PRZS (LP)</option>
                          </Select>
                        </Box>
                  </Box>
                  <Box w="50%"  >
                  <SimpleGrid mt={20}>
                        <HStack>
                        <Box w={"50%"} ml={150}>
                          {/* <HStack>
                            <Text>Time left</Text>
                          </HStack> */}
                        </Box>
                        <Box w={"50%"} w={150}>
                        <Box mt={!isMobile? "-100px" :"-100px"}>
                                  
                          <VStack>
                          {/* <Button 
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              w={"120px"}
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => withdraw()}
                            > 
                            &nbsp;Withdraw
                          </Button>  */}
                          {(selectedType == 2 && !isMobile) && (realtimeRewardsBN > 0 || realtimeRewardsLpBN > 0) ?
                          <Box ml={!isMobile ? 200 : 0} w="280px">
                            <HStack>
                              <Text ml={!isMobile ? 60 : 0} mt={150} style={{fontSize:"14px"}}>Stake your Perezoso (PRZS) or liquidity token (LP)</Text>
                              <Text></Text>
                            </HStack>
                            </Box> : 
                            <></>}
                           </VStack>                          
                          {/* <Text style={{fontSize:"13px"}} ml={10}>You will be able to claim your reward once the countdown ends.</Text>                           */}
                          </Box>

                        </Box>
                        </HStack>
                      </SimpleGrid>
                    </Box>
                  </SimpleGrid>
              </Box>

                <Box className="card no-hover staking-card single-staking" borderRadius={"0px !important"}>
                  {typeof address !== "undefined" ? 
                    <>
                    {selectedType != -1 ?
                    <Box className="tab-content mt-md-3" id="myTabContent"  mt={-20}>
                      <Box
                        className="tab-pane fade show active"
                        id="tab-one"
                        role="tabpanel"
                        aria-labelledby="tab-one-tab"
                      >
                        <Box className="input-box my-4 d-flex row" >
                          
                        <Box className="input-area col-lg-6 col-12 mb-3">
                          <h4>Your wallet</h4>
                          {selectedType == 2 ?
                          <>
                            <Box className="input-text">
                              <label>Balances</label><br/>
                              <Input 
                                mt={4} 
                                value={commify(formatEther(przsBalance?.toString() || 0), 4)}
                                height={35} 
                                placeHolder="0.0000" 
                                style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                width={180}
                                mb={10} 
                              />&nbsp;&nbsp;<Image src={logoPRZS} width={"25px"}></Image>  
                            </Box>
                            <Box className="input-text">
                            <Input 
                              mt={4} 
                              value={commify(formatEther(stakedBalance?.toString() || 0), 4)}
                              height={35} 
                              placeHolder="0.0000" 
                              style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                              width={180} 
                            />&nbsp;&nbsp;<Image src={stakeTypeIcon} width={stakeTypeIcon == logoPRZS ? "25px": "50px"}></Image>  
                          </Box> </>:<></>}                         
                            {selectedType == 1 ?
                            <Box className="input-text">
                              <label>Balance</label><br/>
                              <Input 
                                mt={4} 
                                value={commify(formatEther(stakedBalance?.toString() || 0), 4)}
                                height={35} 
                                placeHolder="0.0000" 
                                style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                width={180} 
                              />&nbsp;&nbsp;<Image src={stakeTypeIcon} width={stakeTypeIcon == logoPRZS ? "25px": "50px"}></Image>  
                            </Box> : <></>}
                          {stakeTypeIcon == logoLPToken ? 
                          <>
                          <br />
                          <label>Staked balance</label>
                          <br/>
                          <Input 
                                mt={4} 
                                value={commify(formatEther(stakedBalanceLP?.toString() || 0), 4)}
                                height={35} 
                                placeHolder="0.0000" 
                                style={{ border:"1px solid white", borderRadius:"10px", backgroundColor:"gray"}} 
                                width={180} 
                              />&nbsp;&nbsp;<Image src={stakeTypeIcon} width={stakeTypeIcon == logoPRZS ? "25px": "50px"}></Image>                          
                          </> : <></>}
                          </Box>
                          {stakeTypeIcon == logoPRZS ? 
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
                          </Box> : <></>}
                          <Box className="input-area col-lg-6 col-12 mb-3"  marginTop={!isMobile && stakesCount > 0 ? -350 : isMobile ? -50 : -50  }>
                          <br /> <br />
                          <Heading as="h4" size="md">{stakeTypeIcon == logoPRZS ? "New position" : "Stake"} </Heading>
                              {stakeTypeIcon !== logoPRZS ?
                              <></> :
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
                                    {/* <option value={2592000 * 6}>180 days</option>
                                    <option value={2592000 * 12}>365 days</option> */}
                                </Select>
                                </Box>
                                &nbsp;&nbsp;
                                <Box ml={10}>
                                <Text style={{fontSize:isMobile?'16px':'14px'}}>
                                  <HStack>
                                  <Text style={{fontSize:"13px", marginTop: 20}}>(APR</Text>
                                  <label fontSize={"md"} fontColor="gray" mt={-2}>
                                  <b>{selectedType == -1 ? 0 : selectedType == 1 ? commify(tierAPR) : commify(lpAprFromApi)}%</b>)
                                  </label>
                                  </HStack>
                                </Text>
                                </Box>
                                </HStack>
                              </SimpleGrid>
                            </Box>}
                            <br />
                            <Box className="input-text" mt={stakeTypeIcon !== logoPRZS ? -20 : 0}>
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
                                lpTokenBalance={lpTokenBalance}
                                przsBalance={przsBalance}
                                // sideButtonsGroupSize={sideButtonsGroupSize}
                                approve={approve}
                                handleStakeAll={handleStakeAll}
                              /> : <></>}
                          </HStack>
                          </Box>

                            <VStack mr={95}>
                            <Box w="200px" ml={isMobile ? "-2vh" : "1vh"} pb={20} mt={isMobile ? -60 : 10}>
                            {amountToStake > 0 ?  <Text ml={isMobile ? 18 : 0} style={{fontSize:"16px"}} color="lightgray">(Staking: {selectedType == 2 ? Number(formatNumber(formatEther(amountToStake || 0))).toFixed(2) : formatNumber(formatEther(amountToStake || 0))})</Text> : <></>}
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

                                
                                </HStack>
                              </Box>
                            </Box>

                        </Box>
                      </Box>
                    </Box> : <></>}
                    </> : <><br />Connect wallet</>}                  
                </Box>
              </Box>
              <Box className="col-12 col-md-5">
              <Box className="staking-items mt-4 mt-md-0">
                  <Box className="card no-hover staking-card">
                  <Heading as="h5" size="md" mt={-20}>Phase 2 (Current)</Heading>
                  <SimpleGrid>
                  <Box w="50%">
                    
                    <HStack><Heading as="h4">APR</Heading> 
                    <label fontSize={"md"} fontColor="gray" mt={-2}>
                      {selectedType == -1 ? 0 : selectedType == 1 ? commify(tierAPR) : commify(lpAprFromApi)}%
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
                                  
                          <VStack>
                          {/* <Button 
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              w={"120px"}
                              isDisabled={stakedBalance == 0 || typeof stakedBalance == "undefined"}
                              style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => withdraw()}
                            > 
                            &nbsp;Withdraw
                          </Button>  */}
                          {realtimeRewardsBN > 0 || realtimeRewardsLpBN > 0 ?
                          <Button 
                            size="sm" 
                            borderRadius={10} 
                            mt={10} 
                            ml={60}
                            w={120} 
                            isDisabled={selectedType == -1}
                            onClick={() => getRewards()}
                          >Get Reward</Button> : <></>}

                          {typeof address !== "undefined" ? 
                          <Button 
                          mt={10}
                          ml={60}
                          w={120} 
                          style={{border:"1px solid white", borderRadius:"10px"}}
                          onClick={() => selectedType == 1 ? withdraw() : withdrawLp()}
                          isDisabled={!isSelectedPositionUnlocked}
                          >Exit
                          </Button>: <></>}
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
                          {selectedType !== -1 ?
                          <><Box w="50%" h="auto">
                          {typeof address !== "undefined" ? 
                          <>
                          <Heading as="h4" size="md">
                            Total Earned
                          </Heading>
                          <VStack>
                          <HStack>
                            <Box w="160px" textAlign="right" mr={80} >
                            <Heading as="h6" style={{color:"lightgray"}}>
                                { stakesCount > 0 && selectedType == 1 ? 
                                  commify(formatEther(realtimeRewardsBN || 0), 4) : 
                                  commify(formatEther(realtimeRewardsLpBN || 0), 4)
                                }
                              </Heading>
                            </Box>
                            <Image src={logoPRZS} width="15px" mt={-5} ml={-80}></Image>
                          </HStack>
                          <Text mt={-20} style={{fontSize:"14px"}}> (${formatAndCommifyNumber(Number(formatEther(selectedType == 1 ? realtimeRewardsBN : realtimeRewardsLpBN  || 0)) * Number(tokenPrice).toFixed(12))})</Text>
                          </VStack>
                          </> : <></>}
                        </Box>
                        <Box w="50%">
                        {typeof address !== "undefined" && stakesCount > 0 ? 
                        <>
                        <Heading as="h4" size="md">
                            {isMobile ? "Position" : "Position Earned"}
                          </Heading>
                          <VStack>
                            <HStack>
                            <Box w="160px" textAlign="right" mr={80}>
                              <Heading as="h6" style={{color:"lightgray"}}>
                                {(stakesCount > 0 && 
                                  earnedOnStake > 0 && 
                                  !isSelectedPositionUnlocked) ? 
                                  commify(formatEther(earnedOnStake || 0), 4) : 0}
                                </Heading>
                              </Box>
                              <Image src={logoPRZS} width="15px" mt={-5} ml={-80}></Image>
                              </HStack>
                          <Text mt={-20} style={{fontSize:"14px"}}>(${formatAndCommifyNumber(Number(formatEther(earnedOnStake || 0)) * Number(tokenPrice).toFixed(12))})</Text>
                          </VStack>
                          </>
                          : <></>}
                          </Box></> : <></>}
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
                    {typeof address !== "undefined" ? 
                    <>
                    <Heading as="h4" size="md" mt={-20}>Phase 1 (Old)</Heading>
                    <SimpleGrid >
                        <HStack>
                        <Box w={"50%"} style={{marginBottom: "10px"}} >
                          <HStack> 
                          <SimpleGrid>
                            <HStack>
                              <Box w="160px" textAlign="right" mr={80}>
                              <Heading as="h6" style={{color:"lightgray"}}>
                                { accumulatedRewards > 0 ? 
                                  commify(accumulatedRewards, 2) : 0}
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
                            {accumulatedRewards > 0 ? 
                            <>
                            <Button 
                              w={"200px"}
                              isDisabled={Number(accumulatedRewards) == 0}
                              style={{marginLeft:"10px", border:"1px solid white", borderRadius:"10px"}}
                              onClick={() => unStake()}
                            > 
                            &nbsp;Exit
                          </Button> 
                              {timeLeft > 0 ?
                              <Text style={{fontSize:"13px"}} ml={10}>You will be able to claim your reward once the countdown ends.</Text>                          
                              : <></>}
                            </> : <></>}                                  
                          </HStack>
                        </Box>
                        </Box>
                        </HStack>
                      </SimpleGrid>
                      </> : <></>}
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