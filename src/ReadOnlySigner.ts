import {Signer } from "@taquito/taquito"

export class ReadOnlySigner implements Signer {
    constructor(private pkh: string, private pk: string ) {}
        
    async publicKey(){
        return this.pk;    
    }
    async publicKeyHash(){
        return this.pkh;
    }
    async sign(op: string, magicByte?: Uint8Array): Promise<{
         bytes: string;
         sig: string;
         prefixSig: string;
         sbytes: string;
        }> {
        throw new Error("Cannot sing");
    }
    async secretKey(): Promise<string | undefined> {
        throw new Error("secret key cannot be exported"); 
    }
} 