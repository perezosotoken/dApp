import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";

const HomePage: React.FC = () => {
  const ctx = useContext<LanguageContextType>(LanguageContext);

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-12 col-md-6 col-lg-9 text-center">
              <div className="hero-content">
                <div className="intro text-center mb-5">
                  <h1 className="mt-4">
                    {!ctx.isSpanishCountry
                      ? "Join the Perezoso Token Sweepstakes!"
                      : "¡Únete al Sorteo de Tokens Perezoso!"}
                  </h1>
                  <p style={{ color: "#fff" }}>
                    {!ctx.isSpanishCountry
                      ? "Redefining digital value with efficiency!"
                      : "¡Redefiniendo el valor digital con eficiencia!"}
                  </p>
                </div>
                <div className="button-group">
                 
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
      <section className="content-area" style={{ marginBottom: "-100px" }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-12 col-md-6">
              <div className="content intro">
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
    </>
  );
};

export default HomePage;
