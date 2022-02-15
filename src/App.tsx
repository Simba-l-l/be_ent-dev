import React, { useState } from 'react';
import './App.css';
import { connectWalletBeacon, DAppConnection } from './wallet';

/*dfsgjshdkgsd*/
function App() {
  const [connection, setConnection] = useState<DAppConnection>()
  const handleConnectClick = async () => {
    try {
      setConnection(await connectWalletBeacon(true, 'mainnet'))
    } catch(e){
      alert((e as any).message ?? e);
    } 
  } 
  const disConnectWallet = () => {
    setConnection(undefined);
  }

  return (
    <div>
      <button onClick={connection ? disConnectWallet : handleConnectClick}>
        {connection ? connection.pkh : 'Connect Wallet'}
      </button>
    </div>
  );
}

export default App;
