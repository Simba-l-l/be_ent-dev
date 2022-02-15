import { NetworkType as BeaconNetworkType } from '@airgap/beacon-sdk';
import BigNumber from 'bignumber.js';
import React, { useState } from 'react';
import './App.css';

import { connectWalletBeacon, connectWalletTemple, DAppConnection } from './wallet';
import {Box, Button, Card, CardContent, CardHeader, Container, Divider, Grid, Select} from "@mui/material";

const networksTokensData = {
  mainnet: {
    address: 'KT1BHCumksALJQJ8q8to2EPigPW6qpyTr7Ng',
    id: 0,
    decimals: 8,
    name: 'CRUNCH'
  },
  hangzhounet: {
    address: 'KT1VowcKqZFGhdcDZA3UN1vrjBLmxV5bxgfJ',
    id: 0,
    decimals: 6,
    name: 'Test QUIPU'
  }
}

const AUTHOR_ADDRESS = 'tz1LSMu9PugfVyfX2ynNU9y4eVvSACJKP7sg';

function hasMessage(value: unknown): value is { message: string } {
  return typeof value === 'object' && value !== null && 'message' in value;
}

function App() {
  const [connection, setConnection] = useState<DAppConnection>();
  const [network, setNetwork] = useState<'mainnet' | 'hangzhounet'>('mainnet');

  const connectWallet = async (connectionType: DAppConnection['type']) => {
    try {
      const connection = connectionType === 'temple'
          ? await connectWalletTemple(true, network)
          : await connectWalletBeacon(
              true,
              { type: network === 'mainnet' ? BeaconNetworkType.MAINNET : BeaconNetworkType.HANGZHOUNET }
          );

      setConnection(connection);
    } catch (e) {
      if ((e as any)?.name === 'NotGrantedTempleWalletError') {
        return;
      }

      const outputArg = hasMessage(e) ? e.message : e;
      console.error(e);
      alert(`Error: ${outputArg}`);
    }
  };

  const handleConnectTempleClick = () => connectWallet('temple');
  const handleConnectBeaconClick = () => connectWallet('beacon');

  const resetConnection = async () => {
    setConnection(undefined);
  };

  const handleNetworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    resetConnection();
    setNetwork(e.target.value as 'mainnet' | 'hangzhounet');
  };

  const donate = async () => {
    try {
      const { tezos, pkh } = connection!;
      const { address, id, decimals } = networksTokensData[network];
      const tokenContract = await tezos.wallet.at(address);
      const op = await tokenContract.methods
          .transfer([
            {
              from_: pkh,
              txs: [
                {
                  to_: AUTHOR_ADDRESS,
                  token_id: id,
                  amount: new BigNumber(10).pow(decimals).times(2),
                },
              ],
            },
          ])
          .send();
      alert('Thank you, the donation is being processed!');
      await op.confirmation(1);
      alert('Donation has been processed successfully!');
    } catch (e) {
      if ((e as any)?.name === 'NotGrantedTempleWalletError') {
        return;
      }

      const outputArg = hasMessage(e) ? e.message : e;
      console.error(e);
      alert(`Error while donating: ${outputArg}`);
    }
  };

  return (
      <div>
        {connection ? (
            <>
              <span>Network: {network}</span>
              <button onClick={resetConnection}>
                {connection.pkh}
              </button>
              <button onClick={donate}>
                Donate some {networksTokensData[network].name}
              </button>
            </>
        ) : (
            <>
            <Container maxWidth="lg">
                <Grid
                    container
                    direction="row"
                    justifyContent="center"
                    alignItems="stretch"
                    spacing={3}
                >
                  <Grid item xs={6}>
                    <Card>
                      <CardHeader title="Connection" />
                      <Divider/>
                      <CardContent>
                        <Box>
                            <select name="network" style={{height: '30px', width : '300px'}} value={network} onChange={handleNetworkChange}>
                              <option value="mainnet">Mainnet</option>
                              <option value="hangzhounet">Hangzhounet</option>
                            </select>
                          <div>
                            <Button onClick={handleConnectTempleClick} sx={{ margin: 1 }} variant="contained" style={{height: '30px', width : '300px'}}>Connect Temple Wallet</Button>
                          </div>
                          <div>
                            <Button onClick={handleConnectBeaconClick} sx={{ margin: 1 }} variant="contained" style={{height: '30px', width : '300px'}}>Connect with Beacon</Button>
                          </div>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Container>
            </>
        )}
      </div>
  );
}

export default App;