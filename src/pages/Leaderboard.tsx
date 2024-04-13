import React, { useState } from "react";
import { Address, useContractRead } from "wagmi";
import ABI from "../core/ABI.json";
import { CirclesWithBar } from "react-loader-spinner";
import { commify } from "../utils";

interface Winner {
  prize: number;
  timestamp: number;
  winner: Address;
}

const LeaderboardPage: React.FC = () => {
  const giveawayAddress = "0x3234ddFeB18fbeFcBF5D482A00a8dD4fAEdA8d19";
  const [leaderboard, setLeaderBoard] = useState<Winner[]>([]);

  const { isLoading: gettingPlayerWinning, data: winners } = useContractRead({
    address: giveawayAddress,
    abi: ABI,
    functionName: "getLeaderboard",
    onSuccess() {
      const allWinners = winners as Winner[];
      setLeaderBoard((allWinners as Winner[]) || []);
    },
  });

  return (
    <>
      <section className="hero-section">
        <div className="leaderboard-area">
          <div className="container">
            <div className="row d-flex justify-content-center">
              <div className="col-12">
                <div className="table-responsive">
                  <table className="table token-content table-borderless">
                    <thead>
                      <tr>
                        <th style={{ width: "5%" }} scope="col">
                          #
                        </th>
                        <th style={{ width: "45%" }} scope="col">
                          Address
                        </th>
                        <th style={{ width: "25%" }} scope="col">
                          Winning
                        </th>
                        <th style={{ width: "25%" }} scope="col">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {" "}
                      {leaderboard.length == 0 && (
                        <p
                          style={{
                            textAlign: "center",
                            fontSize: 20,
                            fontWeight: 500,
                            marginTop: 50,
                          }}
                        >
                          No Winner History At The Moment
                        </p>
                      )}
                      {leaderboard.length != 0 &&
                        leaderboard.map((addr, index) => (
                          <tr key={index}>
                            <td style={{ width: "5%" }}>{index + 1}</td>
                            <td style={{ width: "45%" }}>{addr.winner}</td>
                            <td style={{ width: "25%" }}>
                              {commify(Number(addr.prize))} PRZS
                            </td>
                            <td style={{ width: "25%" }}>
                              {new Date(
                                Number(addr.timestamp) * 1000
                              ).toDateString()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {gettingPlayerWinning && (
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
            visible={gettingPlayerWinning}
          />
        </div>
      )}
    </>
  );
};

export default LeaderboardPage;
