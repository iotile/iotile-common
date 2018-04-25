import {base64ToArrayBuffer} from "./utilities";
import * as CryptoJS from 'crypto-js';

/**
 * A helper class for calculating and verifying SHA256 signatures
 */
export class SHA256Calculator {
    public calculateSignature(data: ArrayBuffer): ArrayBuffer {
        let signedData =  CryptoJS.lib.WordArray.create(data);
        let signatureData = CryptoJS.SHA256(signedData).toString(CryptoJS.enc.Base64);
        let signature = base64ToArrayBuffer(signatureData);

        return signature;
    }

    /**
     * Compare two signatures for equality.  The comparison only
     * occurs for the length of sig1, so if sig1 is a truncated version
     * of sig2, the comparison will return true.
     * 
     * @param sig1 The signature to check against sig2
     * @param sig2 The (possibly extended) signature to compare sig1 against
     * @return true if sig1 is a prefix of sig2, false otherwise
     */
    public compareSignatures(sig1: ArrayBuffer, sig2: ArrayBuffer): boolean {
        let dv1 = new Uint8Array(sig1);
        let dv2 = new Uint8Array(sig2);

        for (let i = 0; i < dv1.byteLength; ++i) {
            if (dv1[i] != dv2[i]) {
                return false;
            }
        }

        return true;
    }
}