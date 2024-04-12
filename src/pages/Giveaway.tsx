import React, { useState, useEffect } from "react";
import { Address, useAccount, useContractRead, useContractWrite } from "wagmi";
import ABI from "../core/ABI.json";
import TOKENABI from "../core/TokenABI.json";
import { toast } from "react-toastify";
import { CirclesWithBar } from "react-loader-spinner";
import { ethers } from "ethers";

const { formatEther, parseEther } = ethers;

interface Winner {
  prize: number;
  timestamp: number;
  winner: Address;
}

const commify = (number) => {
  let numStr = number.toString();
  let [integerPart, decimalPart] = numStr.split(".");
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
}

const DashboardPage: React.FC = () => {
  const giveawayAddress = "0x3234ddFeB18fbeFcBF5D482A00a8dD4fAEdA8d19";
  const tokenAddress = "0x53Ff62409B219CcAfF01042Bb2743211bB99882e";
  const ZERO_ADDRESS = "0x000000000000000000000000000000000000dead";
  
  const totalSupply = 420000000000000;
  
  const [ticket, setTicket] = useState<number>(0);
  const [priceToPay, setPriceToPay] = useState<number>(0);
  // const [totalBurned, setTotalBurned] = useState<number>(0);
  const [winning, setWinning] = useState<string>("");
  const { address, isConnected } = useAccount();
  const [ticketsBought, setTicketBought] = useState<number>(0);
  const [isWaitingForApproval, setIsWaitingForApproval] =
    useState<boolean>(false);

  useEffect(() => {
// Function to fetch the page content
  async function fetchAndParsePage(url: string | URL | Request) {
      try { 
        console.log('here')
        // Fetch the page
        const response = await fetch(url, {
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/html',
          },
        });

        const text = await response.text();
        console.log(response.body)

        // Use DOMParser to parse the HTML response
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Now extract data using querySelectors
        const data = {};

        // Select the element with the specific attributes
        const priceElement = doc.querySelector('span[data-converter-target="price"][data-coin-id="36344"]');

        // Retrieve the value from the 'title' attribute of the <sub> element within the selected span
        const price = priceElement.querySelector('sub').getAttribute('title');

        // Output the price to the console
        console.log(price);
 
          return data;
      } catch (error) {
          console.error("Failed to fetch or parse the page:", error);
          return null;
      }
    }

    // URL of the webpage you want to scrape
    const url = "https://www.coingecko.com/en/coins/perezoso";

    // Call the function and log the result
    fetchAndParsePage(url)

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

  const {data: totalBurned} = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [ZERO_ADDRESS],
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
    args: [giveawayAddress as Address, priceToPay * 10 ** 18],
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
                    {Number(PRIZE)} PRZS Token Prize
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
                            <label>Ticket Price {Number(TICKET_PRICE)}</label>
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
                        Note: The giveaway would be done every day at 9:00 P.M
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
                                <span>{`${commify(totalSupply)}`} PRZS</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                  <strong>Circulating Supply:</strong>
                                  {/* @ts-ignore */}
                                  <span>{`${totalBurned != null ? commify(formatEther(parseEther(`${totalSupply}`) - totalBurned)) : 0}`} PRZS</span>
                                </li>                               
                              <li className="d-flex justify-content-between">
                                <strong>Burned Supply:</strong>
                                {/* @ts-ignore */}
                                <span>{`${totalBurned != null ? commify(formatEther(totalBurned)) : 0}`} PRZS</span>
                               </li>                                   
                              <li className="d-flex justify-content-between">
                                <strong>Token Price:</strong>
                                <span>$0.00</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                <strong>Circulation Supply:</strong>
                                <span>----</span>
                              </li>
                              <li className="d-flex justify-content-between">
                                <strong>Holders:</strong>
                                <span>471+</span>
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
                    <h3 className="m-0">{winning}</h3>
                    <p>Your Winnings</p>
                  </div>
                  <div className="card no-hover staking-card my-4">
                    <h3 className="m-0">{ticketsBought}</h3>
                    <p>Your Ticket(s)</p>
                  </div>
                  <div className="card no-hover staking-card my-4">
                    <h3 className="m-0">
                      {Number(totalRewardDistributed) || 0} PRZS
                    </h3>
                    <p>Total Rewards Distributed</p>
                  </div>
                  <div className="card no-hover staking-card">
                    <h3 className="m-0">
                      {(currentPlayers as string[])?.length}
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
