import React, { useContext } from "react";
import { LanguageContext, LanguageContextType } from "../core/LanguageProvider";
import { Link } from "react-router-dom";

const Footer: React.FC = () => {

  const ButtonMailto = ({ mailto, label }) => {
    return (
        <Link className="fa fa-envelope" 
            style={{ transform: "translateY(0)", display:"grid", gridTemplateColumns: "repeat(1, 100%)", placeItems:"center"}} 
            to='#'
            onClick={(e) => {
                window.location.href = mailto;
                e.preventDefault();
            }}
        >
        </Link>
    );
};
  const ctx = useContext<LanguageContextType>(LanguageContext);
  return (
    <footer className="footer-area">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 text-center">
            <div className="footer-items">
              <a className="navbar-brand">
                <p className="perelogo">PEREZOSO COMMUNITY</p>
              </a>
              <p style={{ color: "#0a3607", marginTop: "-2px" }}>
                {!ctx.isSpanishCountry
                  ? "Unlock the full potential of crypto innovation and collaborative learning by joining our vibrant community, where passionate minds converge to share insights, trade strategies."
                  : "Libere todo el potencial de la criptoinnovación y la colaboración aprender uniéndose a nuestra vibrante comunidad, donde mentes apasionadas convergen para compartir ideas y estrategias comerciales."}
              </p>
              <div className="social-icons d-flex justify-content-center my-4">
                <a
                  className="twitter"
                  href="https://x.com/perezosotoken"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-twitter"></i>
                </a>

                <a
                  className="twitter"
                  href="https://www.instagram.com/perezosotoken"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a
                  className="telegram"
                  href="https://t.me/perezosotoken"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-telegram"></i>
                </a>

                  <ButtonMailto mailto="mailto:test@test.com" ></ButtonMailto>

              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
