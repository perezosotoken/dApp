import React, { useContext } from "react";
import { Address, useAccount, useContractRead, } from "wagmi";
import PerezosoStakingAbi from "../core/PerezosoStaking.json";
import TOKENABI from "../core/TokenABI.json";
import { parseEther, formatEther } from "ethers";
import logoBBP from "../../public/assets/images/baby_przs.png";
import logoPRZS2 from "../../public/assets/images/przscoin.png";

import { Link } from "react-router-dom";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";
import { isMobile } from 'react-device-detect';
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
  VStack,
  SimpleGrid
} from '@chakra-ui/react';
import { commify } from "../utils";
import logoPRZS from "../../public/assets/images/logo.png";

const HomePage: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);
  const stakingAddress = "0xE2DF958c48F0245D823c2dCb012134CfDa9F8f9F";
  const tokenAddress = "0x53Ff62409B219CcAfF01042Bb2743211bB99882e";
  const totalSupply = 420000000000000;
  const { address } = useAccount();

  const {data: totalStakers} = useContractRead({
    address: stakingAddress,
    abi: PerezosoStakingAbi.abi,
    functionName: "getTotalStakers",
    args: [],
  });
  
  const {data: totalStaked} = useContractRead({
    address: tokenAddress,
    abi: TOKENABI,
    functionName: "balanceOf",
    args: [stakingAddress],
  });


  console.log(`Total stakers is ${totalStakers} total staked ${totalStaked}`)

  const stakeButtonWidth = !isMobile ? "auto" : "220px";
  const stakeButtonMt = !isMobile ? "0px" : "10";
  const inputTextSize = isMobile ? "13px" : "16px";

  const totalStakersPct = typeof totalStakers === "undefined" ? 0 : Number(totalStakers) * 100 / 1000;
  console.log(`Total stakers is ${totalStakersPct}`)

  const statsMarginTop1 = !isMobile ? "0px" : "300px";
  const statsMarginTop2 = !isMobile ? "0px" : "500px";
  const statsFontSize1 = !isMobile ? "12px" : "16px";
  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 col-md-6 col-lg-9 text-center">
              <div className="hero-content">
                <div className="intro text-center mb-5">
                  <h1 >
                    {!ctx.isSpanishCountry
                      ? "Join our sweepstakes and stake your Perezoso!"
                      : "¡Únete al Sorteo de Tokens Perezoso!"}
                  </h1>
                  <h4 style={{ color: "#fff" }}>
                    {!ctx.isSpanishCountry
                      ? "Win $50 every tuesday and friday, stake your tokens to earn passive income!"
                      : "¡Redefiniendo el valor digital con eficiencia!"}
                  </h4>
                </div>
                <div style={{ margin: "auto", width: "auto" }} >
              <Flex direction={"column"} w={"full"} mt={"70"}>
                <Box mt={"-20"} >
                  <Box ml={"auto"}>
                    <SimpleGrid columns={2} spacing={10} >
                        
                          <Box w="auto" fontSize={isMobile ? "13px" : "auto"} style={{border:"2px solid white",  background: "linear-gradient(90deg, rgba(60,100,29,1) 0%, rgba(40,66,19,1) 84%)"}} borderRadius={"10px"} >
                          <div><a href="staking">
                          <h4 style={{fontSize: isMobile ? "14px" : "auto"}}>Perezoso Farming </h4>
                          <Image src={logoPRZS2} w={"100px"} style={{marginTop:"10px", marginBottom:"35px"}}></Image>    
                          <h6  style={{fontSize: isMobile ? "14px" : "auto"}}>Stake your Perezoso and earn more tokens</h6>
                          </a> </div>

                        </Box>
                        <Box w="auto"  style={{border:"2px solid white",  background: "linear-gradient(90deg, rgba(60,100,29,1) 0%, rgba(40,66,19,1) 84%)"}} borderRadius={"10px"} >
                        <div><a href="stakingbbp">
                          <h4  style={{fontSize: isMobile ? "14px" : "auto"}}>Baby Perezoso Farming </h4>
                          <Image src={logoBBP} w={"100px"} style={{marginTop:"10px", marginBottom:"35px"}}></Image>    
                          <h6  style={{fontSize: isMobile ? "14px" : "auto"}}>Stake your Perezoso and earn Baby Perezoso</h6>
                          </a> </div>
                        </Box> 
                                          
                    </SimpleGrid>
                  </Box>

                </Box>
              </Flex>
                </div>
                <br />
                <div className="button-group" style={{marginTop:"50px"}}>
                  <a
                    className="btn btn-bordered-white mb-3"
                    href="https://pancakeswap.finance/swap?chain=bsc&outputCurrency=BNB&utm_source=Trust_iOS_Browser&inputCurrency=0x53Ff62409B219CcAfF01042Bb2743211bB99882e"
                  >
                    <i className="fa-solid fa-store mr-2"></i>
                    {!ctx.isSpanishCountry ? "Buy Token" : "Comprar Ficha"}
                  </a>
                  <Link
                    className="btn btn-bordered active smooth-anchor  mb-2"
                    to="/raffle"
                  >
                    <i className="fa-solid fa-ring mr-2"></i>
                    {!ctx.isSpanishCountry ? "Raffle Draw" : "Sorteo"}
                  </Link>
                  {isMobile ? <Link
                      className="btn btn-bordered active smooth-anchor  mb-2"
                      to="/staking"
                      style={{width:`${stakeButtonWidth}`, marginTop: `${stakeButtonMt}`}}
                    >
                      <i className="fa-solid fa-lock mr-2"></i>
                      {!ctx.isSpanishCountry ? "Stake on V2" : "Acuñar"}
                    </Link> : <></>}   
                    <a
                    className="btn btn-bordered-white  mb-2"
                    href="https://drive.google.com/file/d/1PXB0_ev2_oex0o8LdPF-QmQi3hFLyoxK/view"
                  >
                    <i className="fa-solid fa-file mr-2"></i>
                    Whitepaper
                  </a>               
                </div>          
              </div>
            </div>
          </div>
        
        </div>

            
      </section>
      <section className="content-area">
        <div className="container" >
          <div className="row align-items-center">
            <div className="col-12 col-md-6" >
              <div className="content intro" >
                <h2 style={{ color: "#fff" }}>What Perezoso Is</h2>
                <p
                  style={{ color: "#0a3607", marginTop: "-20px" }}
                  className="whath"
                >
                  {!ctx.isSpanishCountry
                    ? "Perezoso is a MEME token rewarding loyal Cryptotraders on our exchange. Community members get Perezoso tokens with each daily trade and can enter a weekly sweepstakes to win $50 in PRZS."
                    : "Perezoso es un token MEME que recompensa a los Cryptotraders leales en nuestro intercambio. Los miembros de la comunidad obtienen tokens Perezoso cada día opere y pueda participar en un sorteo semanal para ganar $50 in PRZS."}
                </p>
                <ul className="list-unstyled items mt-5">
                  <li className="item">
                    <div className="content-list d-flex align-items-center">
                      <div className="content-icon">
                        <span>
                          <i
                            className="fa-solid fa-fire"
                            style={{ fontSize: "60px", color: "#fff" }}
                          ></i>
                        </span>
                      </div>
                      <div className="content-body ml-4">
                        <h3 className="m-0 wht" style={{ color: "#fff" }}>
                          Perezoso Burning
                        </h3>
                        <p className="mt-3 whtp" style={{ color: "#0a3607" }}>
                          {!ctx.isSpanishCountry
                            ? "Perezoso Token features a daily draw. Tokens used for daily draws are accumulated monthly and burned on the 30th day, ensuring ongoing engagement and a dynamic token economy."
                            : "Perezoso Token presenta un sorteo diario. Los tokens utilizados para los sorteos diarios se acumulan mensualmente y se queman el día 30, lo que garantiza un compromiso continuo y una economía de tokens dinámica."}
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="item">
                    <div className="content-list d-flex align-items-center">
                      <div className="content-icon">
                        <span>
                          <i
                            className="fa-solid fa-cube"
                            style={{ fontSize: "60px", color: "#fff" }}
                          ></i>
                        </span>
                      </div>
                      <div className="content-body ml-4">
                        <h3 className="m-0 wht" style={{ color: "#fff" }}>
                          Perezoso Academy
                        </h3>
                        <p className="mt-3 whtp" style={{ color: "#0a3607" }}>
                          {!ctx.isSpanishCountry
                            ? "We empower our community with Perezoso Token, facilitating hands-on learning experiences in blockchain and cryptocurrencies. Join us in this transformative journey towards blockchain literacy and financial empowerment."
                            : "Potenciamos a nuestra comunidad con Perezoso Token, facilitando experiencias de aprendizaje práctico en blockchain y criptomonedas. Únase a nosotros en este viaje transformador hacia la alfabetización blockchain y el empoderamiento financiero."}
                        </p>
                      </div>
                    </div>
                  </li>
                  <li className="item">
                    <div className="content-list d-flex align-items-center">
                      <div className="content-icon">
                        <span>
                          <i
                            className="fa-solid fa-diagram-project"
                            style={{ fontSize: "60px", color: "#fff" }}
                          ></i>
                        </span>
                      </div>
                      <div className="content-body ml-4">
                        <h3 className="m-0 wht" style={{ color: "#fff" }}>
                          Perezoso NFTs Marketplace
                        </h3>
                        <p className="mt-3 whtp" style={{ color: "#0a3607" }}>
                          {!ctx.isSpanishCountry
                            ? "In the not-so-distant future, we envision the launch of and NFT Marketplace. Stay tuned as we embark on this exciting journey towards redefining digital ownership and creativity!"
                            : "En un futuro no muy lejano, visualizamos el lanzamiento de NFT Marketplace. ¡Estén atentos mientras nos embarcamos en este emocionante viaje hacia la redefinición de la propiedad y la creatividad digitales!"}
                        </p>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-none d-md-block">
                <img
                  src="../../../assets/images/perezoso.png"
                  className="img-fluid"
                  alt="Perezoso"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="hero-section">
      <center><p style={{marginTop:"30px"}}><h3 style={{ color: "#fff" }}>Perezoso Token is featured on:</h3> </p></center>
          <div className="row align-items-center justify-content-center">
            <div className="text-center">
                <div className="button-group">                                  
                <Link
                    className="btn btn-bordered-white "
                    to="https://coinmarketcap.com/currencies/perezoso/"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`, height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/cmc.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "CMC" : "CMC"}
                  </Link>                  
                  <Link
                    className="btn btn-bordered-white "
                    to="https://www.coingecko.com/en/coins/perezoso"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`, height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/coingecko.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "Coingecko" : "Coingecko"}
                  </Link>                  
                  <Link
                    className="btn btn-bordered-white "
                    to="https://pancakeswap.finance/swap?outputCurrency=0x53ff62409b219ccaff01042bb2743211bb99882e&inputCurrency=BNB"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`, height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/pancakeswap.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "PancakeSwap" : "PancakeSwap"}
                  </Link> 
                  <Link
                    className="btn btn-bordered-white "
                    to="https://dappradar.com/dapp/perezoso"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`, height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/dappradar.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "Dappradar" : "Dappradar"}
                  </Link>                  
                </div>
            </div>
          </div> 
          <div className="row align-items-center justify-content-center">
            <div className="col-sm5 text-center">
                <div className="button-group">
                <Link
                    className="btn btn-bordered-white "
                    to="https://bscscan.com/token/0x53ff62409b219ccaff01042bb2743211bb99882e"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`, height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/bscscan.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "Bscscan" : "Bscscan"}
                  </Link>                                 
                  <Link
                    className="btn btn-bordered-white "
                    to="https://www.dextools.io/app/en/bnb/pair-explorer/0xe2f4a4534133beacd8542f404f8c9d5135fbaf0e"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`,height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/dextools.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "Dextools" : "Dextools"}
                  </Link>                 
                  <Link
                    className="btn btn-bordered-white "
                    to="https://ntm.ai/token/0x53ff62409b219ccaff01042bb2743211bb99882e"
                    style={{marginBottom: `${isMobile ? "25px": "0px"}`,height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/ntm.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "NTM" : "NTM"}
                  </Link>      
                  <Link
                    className="btn btn-bordered-white"
                    to="https://ave.ai/token/0x53ff62409b219ccaff01042bb2743211bb99882e-bsc?from=Default"
                    style={{height:"60px", width:"230px"}}
                    target="_blank"
                  >
                    <img src="https://perezosotoken.com/assets/images/avedex.png" style={{ width: "25px", marginRight: "10px" }} />
                    {!ctx.isSpanishCountry ? "Avedex" : "Avedex"}
                  </Link>             
                </div>
            </div>
          </div>              
      </section>
    </>
  );
};

export default HomePage;
