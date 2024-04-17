import { Outlet } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { LanguageProvider } from "./core/LanguageProvider";

import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi/react";

import { WagmiConfig } from "wagmi";
import { bsc } from "viem/chains";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { switchNetwork, watchNetwork } from "wagmi/actions";

function App() {
  const projectId = "01138769aa5f008854a0126741fa52c1";

  const metadata = {
    name: "Perezoso",
    description: "Perezoso Giveaway",
    url: "https://web3modal.com",
    icons: ["https://avatars.githubusercontent.com/u/37784886"],
  };

  const chains = [bsc];
  const wagmiConfig = defaultWagmiConfig({
    chains,
    projectId,
    metadata,
  });

  createWeb3Modal({ wagmiConfig, projectId, chains });

  watchNetwork(async (network) => {
    if (network.chain?.name != "bsc") {
      await switchNetwork({
        chainId: 56,
      });
    }
  });

  return (
    <WagmiConfig config={wagmiConfig}>
      <LanguageProvider>
        <Header />
        <Outlet />
        <Footer />
        <ToastContainer theme="dark" />
      </LanguageProvider>
    </WagmiConfig>
  );
}

export default App;
