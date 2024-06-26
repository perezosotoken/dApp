import React, { useState, useEffect } from "react";
import { Address, useAccount, useContractRead, useContractWrite } from "wagmi";
import PerezosoStakingAbi from "../core/PerezosoStaking.json";
import TOKENABI from "../core/TokenABI.json";
import ABI from "../core/ABI.json";
import data from '../core/data.json';
import dataSummary from '../core/summary.json';

import { toast } from "react-toastify";
import { CirclesWithBar } from "react-loader-spinner";
import { ethers } from "ethers";
import { commify, formatNumber } from "../utils";
import { BrowserView, MobileView, isBrowser, isMobile } from 'react-device-detect';
 
const { formatEther, parseEther } = ethers;

interface Winner {
  prize: number;
  timestamp: number;
  winner: Address;
}
 
const DashboardPage: React.FC = () => {
  const stakingAddress = "0xE2DF958c48F0245D823c2dCb012134CfDa9F8f9F";
  const stakingAddressV2 = "0x1FbDB5c46F6a33eC22a7AF990518Ed4610864b2c";

  const giveawayAddress = "0x3234ddFeB18fbeFcBF5D482A00a8dD4fAEdA8d19";
  const tokenAddress = "0x53Ff62409B219CcAfF01042Bb2743211bB99882e";
  
  const ZERO_ADDRESS = "0x000000000000000000000000000000000000dead";
  
  const totalSupply = 420e12;
  
  const { address, isConnected } = useAccount();

  const [ticket, setTicket] = useState<number>(0);
  const [priceToPay, setPriceToPay] = useState<number>(0);
  const [tokenPrice, setTokenPrice] = useState<number>(0);
  const [holders, setHolders] = useState<string>("");
  const [winning, setWinning] = useState<string>("");
  const [ticketsBought, setTicketBought] = useState<number>(0);
  const [isWaitingForApproval, setIsWaitingForApproval] = useState<boolean>(false);
  const [stats, setStats] = useState({});

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

  useEffect(() => {
    setStats(calculateStats(data));
  }, []);

  useEffect(() => {
    const fetchTokenHolders = async () => {
      const url = 'https://corsproxy.io/?https%3A%2F%2Fbscscan.com%2Ftoken%2F0x53Ff62409B219CcAfF01042Bb2743211bB99882e';
      try {
        const response = await fetch(url, {
          mode: 'no-cors',
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        
        const text = await response.text();
        
        console.log("Entire HTML Output:", text); // Log the full HTML to verify the structure

        // Use DOMParser to parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Attempt to locate the specific holder count element
        const holdersDiv = doc.querySelector('#ContentPlaceHolder1_tr_tokenHolders div > div'); // Adjusted for nested div structure
        if (holdersDiv) {
          const holdersText = holdersDiv.textContent.trim().split(' ')[0]; // Extracts the number directly

          //@ts-ignore
          setHolders(holdersText);
        } else {
          console.log('Token holders element not found');
        }
      } catch (error) {
        console.error("Failed to fetch or parse the page:", error);
      }
    };

    fetchTokenHolders();
  }, []);
  
  useEffect(() => {
    const fetchTokenPrice = async () => {
        const url = 'https://stats.perezosotoken.com/price';
        const response = await fetch(url, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          }
        });
        const text = await response.json();
        console.log(Number(text.price).toFixed(14))
        setTokenPrice(Number(text.price).toFixed(14))
    };

    fetchTokenPrice();
  }, [isConnected]);
    
  function accumulatedPrizeForAddress(
    winners: Winner[],
    address: string
  ): number {
    let accumulatedPrize = 0;

    for (const winner of winners) {
      if (winner.winner === address) {
        accumulatedPrize += Number(winner.prize);
      }
    }
    return accumulatedPrize;
  }

  const { isLoading: gettingNoOfPlayers, data: currentPlayers } =
    useContractRead({
      address: giveawayAddress,
      abi: ABI,
      functionName: "getCurrentPlayers",
      watch: true,
      onSuccess: (data: Address[]) => {
        let count = 0;
        data?.forEach((player) => {
          if (player == address) count++;
        });
        setTicketBought(count);
      },
    });

  const {data: totalStakers} = useContractRead({
    address: stakingAddress,
    abi: ABI,
    functionName: "getTotalStakers",
    args: [],
  });
  
  const {data: totalBurned} = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [ZERO_ADDRESS],
  });

  const {data: totalStakedV1} = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [stakingAddress],
  });

  const {data: totalStakedV2} = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [stakingAddressV2],
  });
  
  const { data: maxTicket } = useContractRead({
    address: giveawayAddress,
    abi: ABI,
    functionName: "getMaxTicket",
  });

  const { data: totalRewardDistributed } = useContractRead({
    address: giveawayAddress,
    abi: ABI,
    functionName: "totalRewardDistributed",
  });

  const { data: TICKET_PRICE } = useContractRead({
    address: giveawayAddress,
    abi: ABI,
    functionName: "ENTRY_FEE",
  });

  const { data: PRIZE } = useContractRead({
    address: giveawayAddress,
    abi: ABI,
    functionName: "PRIZE",
  });

  const { isLoading: gettingPlayerWinning, data: winners } = useContractRead({
    address: giveawayAddress,
    abi: ABI,
    functionName: "getLeaderboard",
    onSuccess() {
      const allWinners = winners as Winner[];
      const winning = accumulatedPrizeForAddress(allWinners, address as string);
      setWinning(winning + " PRZS Token");
    },
  });

  const { isLoading: approving, write: approve } = useContractWrite({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "approve",
    args: [giveawayAddress as Address,  parseEther(`${priceToPay}`)],
    onSuccess: () => {
      setIsWaitingForApproval(true);
      setTimeout(() => {
        enterDraw();
        setIsWaitingForApproval(false);
      }, 4000);
    },
    onError() {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      toast("Error, Approval unsuccessful.");
    },
  });

  const { isLoading, write: enterDraw } = useContractWrite({
    address: giveawayAddress,
    abi: ABI,
    functionName: "EnterGiveaway",
    args: [ticket],
    onSuccess() {
      toast("Successfully Entered Giveaway");
    },
    onError(data) {
      if (!isConnected) {
        toast("Please connect your wallet first");
        return;
      }
      if (data?.stack?.includes("Your balance is not enough!")) {
        toast("Your balance is not enough!");
        return;
      }
      if (data?.stack?.includes("Ticket entered is above maximum ticket")) {
        toast("Ticket entered is above maximum ticket" + " of " + maxTicket);
        return;
      }
      if (
        data?.stack?.includes(
          "Your existing tickets plus this ticket exceeds the maximum ticket limit"
        )
      ) {
        toast(
          "Your existing tickets plus this ticket exceeds the maximum ticket limit" +
            " of " +
            maxTicket
        );
        return;
      }
      if (data?.stack?.includes("insufficient allowance")) {
        toast("Insufficient Allowance");
        return;
      }
      toast("Error, Transaction unsuccessful.");
    },
  });

  console.log(`Staked amount is ${totalStakedV1} total stakers is ${totalStakers} `)


  return (
    <>
      <section className="hero-section">
        <div className="staking-area">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-12 col-md-7">
                <div className="card no-hover staking-card single-staking">
                  <h3 className="m-0">Perezoso Raffle Draw</h3>
                  <span className="balance">
                    {commify(Number(PRIZE))} PRZS Token Prize
                  </span>

                  <div className="tab-content mt-md-3" id="myTabContent">
                    <div
                      className="tab-pane fade show active"
                      id="tab-one"
                      role="tabpanel"
                      aria-labelledby="tab-one-tab"
                    >
                      <div className="input-box my-4 d-flex row">
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
                            <label>Ticket Price {commify(Number(TICKET_PRICE))} PRZS</label>
                            <input
                              type="text"
                              value={TICKET_PRICE + " PRZS"}
                              disabled
                            /> 
                          </div>
                        </div>
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
                            <label>Ticket(s)</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              min="1"
                              onChange={(e) => {
                                setTicket(parseInt(e.target.value));
                                setPriceToPay(
                                   parseInt(e.target.value || "0") *
                                    Number(TICKET_PRICE)
                                );
                              }}
                            />
                          </div>
                        </div>
                        <div className="input-area col-lg-6 col-12 mb-3">
                          <div className="input-text">
                            <label>Total To Pay</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={priceToPay}
                              readOnly
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-12">
                          <button
                            className="btn btn-secondary mt-4 w-100"
                            disabled={priceToPay == 0}
                            onClick={() => approve()}
                          >
                            Buy Ticket
                          </button>
                        </div>
                      </div>
                      <span>
                        Note: The giveaway will be done every day at 9:00 P.M
                      </span>
                      <div className="staking-tab-content mt-4">
                        <p>Tokenomics</p>
                        <div
                          className="info-box"
                          style={{ marginTop: "-20px" }}
                        >
                          <div>
                            <ul className="list-unstyled">
                              <li className="d-flex justify-content-between">
                                <strong>Contract Address:</strong>
                                <a href="https://bscscan.com/token/0x53Ff62409B219CcAfF01042Bb2743211bB99882e">
                                  0x53F...9882e
                                </a>
                              </li>
                              <li className="d-flex justify-content-between">
                                <strong>Token Name:</strong>{" "}
                                <span>Perezoso</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                <strong>Token Symbol:</strong>
                                <span>PRZS</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                <strong>Max Token Supply:</strong>
                                <span>{`${formatNumber(totalSupply)}`} PRZS</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                  <strong>Circulating Supply:</strong>
                                  {/* @ts-ignore */}
                                  <span>
                                    {`${totalBurned != null  && totalStakedV1 != null ? 
                                      formatNumber(formatEther(parseEther(`${totalSupply}`) - (totalBurned + totalStakedV1 + totalStakedV2))) : 0}`} PRZS
                                  </span>
                                </li>                                                               
                              <li className="d-flex justify-content-between">
                                <strong>Burned Supply:</strong>
                                {/* @ts-ignore */}
                                <span>{`${totalBurned != null ? formatNumber(formatEther(totalBurned)) : 0}`} PRZS</span>
                               </li>
                               <li className="d-flex justify-content-between">
                                <strong>Total stakers:</strong>
                                {/* @ts-ignore */}
                                <span>
                                  {`${totalStakedV1 != null ? commify(typeof totalStakers != "undefined" && typeof stats?.uniqueAddresses != "undefined" ? totalStakers + (BigInt(stats?.uniqueAddresses) || 0): 0) : 0}`}
                                  </span>
                                </li>
                               <li className="d-flex justify-content-between">
                                  <strong>Staked Supply:</strong>
                                  {/* @ts-ignore */}
                                  <span>
                                    {`${totalBurned != null ? formatNumber(formatEther(typeof totalStakedV1 != "undefined" && typeof totalStakedV2 != "undefined" ? totalStakedV1 + totalStakedV2 : 0), 2) : 0}`} PRZS
                                    </span>
                                </li>                                                                  
                              <li className="d-flex justify-content-between">
                                <strong>Token Price:</strong>
                                <span>${tokenPrice}</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                <strong>Holders:</strong>
                                <span>{holders}+</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-5">
                <div className="staking-items mt-4 mt-md-0">
                  <div className="card no-hover staking-card">
                    <h3 className="m-0">{winning > 0 ? formatNumber(winning) : 0}</h3>
                    <p>Your Winnings</p>
                  </div>
                  <div className="card no-hover staking-card my-4">
                    <h3 className="m-0">{commify(ticketsBought)}</h3>
                    <p>Your Ticket(s)</p>
                  </div>
                  <div className="card no-hover staking-card my-4">
                    <h3 className="m-0">
                      {formatNumber(Number(totalRewardDistributed)) || 0} PRZS
                    </h3>
                    <p>Total Rewards Distributed</p>
                  </div>
                  <div className="card no-hover staking-card">
                    <h3 className="m-0">
                      {currentPlayers ? commify(currentPlayers.length) : 0}
                    </h3>
                    <p>Current Number of Players Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {(isLoading ||
        approving ||
        gettingPlayerWinning ||
        gettingNoOfPlayers) && (
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
              isLoading ||
              approving ||
              gettingPlayerWinning ||
              gettingNoOfPlayers ||
              isWaitingForApproval
            }
          />
        </div>
      )}
    </>
  );
};

export default DashboardPage;
