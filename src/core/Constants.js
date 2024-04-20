import {ethers} from "ethers";
const { formatEther, parseEther } = ethers;

export const rewardsMap = {
    0: {
      0: "300000",
      1: "1500000",
      2: "4000000",
      3: "10000000",
    },
    1: {
      0: "3000000",
      1: "15000000",
      2: "40000000",
      3: "100000000",
    },
    2: {
      0: "30000000",
      1: "150000000",
      2: "400000000",
      3: "1000000000",
    },
    3: {
      0: "300000000",
      1: "1500000000",
      2: "4000000000",
      3: "10000000000",
    },
  }; 

export  const depositMap = [
    parseEther(`1000000000`),
    parseEther(`10000000000`),
    parseEther(`100000000000`),
    parseEther(`1000000000000`),
]

export const totalStakingTime = 2592000;

export const rewardSpeeds = {
  0: {
    0: 300000 / 2592000,
  },
  1: {
    0: 3000000 / 2592000,
  },
  2: {
    0: 30000000 / 2592000,
  },
  3: {
    0: 300000000 / 2592000,
  },  
}
