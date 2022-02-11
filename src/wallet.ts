import {  NetworkType as BeaconNetwork } from "@airgap/beacon-sdk"
import { BeaconWallet } from "@taquito/beacon-wallet"
import { MichelCodecPacker, TezosToolkit } from "@taquito/taquito";
import { TempleWallet } from "@temple-wallet/dapp";
import { ReadOnlySigner } from "./ReadOnlySigner";

export interface DAppConnection {
    type: 'temople' | 'beacon';
    pkh: string;
    pk: string;
    tezos: TezosToolkit;
    templeWallet?: TempleWallet;
}

type Network = 'mainnet' | 'hangzhounet';

const APP_NAME = 'Be eNt'
const michelEncoder = new MichelCodecPacker();

const beaconWallet = new BeaconWallet({
    name: APP_NAME,
    iconUrl: process.env.REACT_APP_BASE_URL + '/favicon.ico',
});

export const defaultUrls = {
    mainnet: 'https://mainnet.api.tez.ie',
    hangzhounet: 'https://hangzhounet.api.tez.ie'
};

export async function connectWalletBeacon(forcePermissions: boolean, network: Network): Promise<DAppConnection>{
    const beaconNetwork  = network === "mainnet" ? BeaconNetwork.MAINNET : BeaconNetwork.HANGZHOUNET;
    beaconWallet.client.preferredNetwork = beaconNetwork;
    const activeAccount = await beaconWallet.client.getActiveAccount();

    if (forcePermissions || !activeAccount){
        if (activeAccount){
            await beaconWallet.clearActiveAccount();
        }
        await beaconWallet.requestPermissions({ network: {type: beaconNetwork} });
    }

    const tezos = new TezosToolkit(defaultUrls[beaconNetwork]);
    tezos.setPackerProvider(michelEncoder);
    tezos.setWalletProvider(beaconWallet);
    const activeAcc = await beaconWallet.client.getActiveAccount();
    if (!activeAcc){
        throw new Error("Wallet wasn't connected");
    }
    tezos.setSignerProvider(new ReadOnlySigner(activeAcc.address, activeAcc.publicKey));

    return {type: 'beacon', pkh: activeAcc.address, pk: activeAcc.publicKey, tezos};
}