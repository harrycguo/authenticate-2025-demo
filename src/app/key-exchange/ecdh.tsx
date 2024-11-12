import { storeClientKeyPair } from "@/utils/indexed-db";

const generateECDHKeyPairAndSharedSecret = async (
  serverPublicKeyHex: string
): Promise<{
  sharedSecret: string;
  clientPublicKeyBase64: string;
}> => {
  // Step 1: Convert server public key from hex to ArrayBuffer
  function hexToArrayBuffer(hex: string): ArrayBuffer {
    const bytes = new Uint8Array(
      hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    return bytes.buffer;
  }

  // Remove the '04' prefix from the uncompressed public key and extract X and Y coordinates
  const xHex = serverPublicKeyHex.slice(2, 66); // First 32 bytes for X
  const yHex = serverPublicKeyHex.slice(66); // Next 32 bytes for Y

  // Convert X and Y to ArrayBuffer and combine them
  const publicKeyArrayBuffer = new Uint8Array(65);
  publicKeyArrayBuffer[0] = 0x04; // Prefix for uncompressed point
  publicKeyArrayBuffer.set(new Uint8Array(hexToArrayBuffer(xHex)), 1);
  publicKeyArrayBuffer.set(new Uint8Array(hexToArrayBuffer(yHex)), 33);

  // Step 2: Generate ECDH key pair for the client
  const clientKeyPair = (await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256", // Named curve; P-256 is widely supported
    },
    true, // Extractable keys
    ["deriveKey"]
  )) as CryptoKeyPair;

  // Step 3: Import the server's public key
  const serverPublicKey = (await window.crypto.subtle.importKey(
    "raw", // Public key format
    publicKeyArrayBuffer.buffer,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // Extractable key
    []
  )) as CryptoKey;

  // Store client key pair in IndexedDB with sessionID as the key
  await storeClientKeyPair(clientKeyPair, serverPublicKey);

  // Step 4: Derive the shared secret using the client's private key and the server's public key
  const sharedSecretKey = (await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: serverPublicKey,
    },
    clientKeyPair.privateKey,
    {
      name: "HMAC", // For HMAC use
      hash: "SHA-256",
      length: 256,
    },
    true, // Non-extractable key
    ["sign", "verify"]
  )) as CryptoKey;

  // Step 5: Export the shared secret as raw bytes
  const sharedSecretArrayBuffer = await window.crypto.subtle.exportKey(
    "raw",
    sharedSecretKey
  );
  const sharedSecretUint8Array = new Uint8Array(sharedSecretArrayBuffer);

  // Convert shared secret to Base64 for easier usage
  const sharedSecretBase64 = btoa(
    String.fromCharCode(...sharedSecretUint8Array)
  );

  // Step 6: Export the client's public key to send back to the server
  const clientPublicKeyArrayBuffer = await window.crypto.subtle.exportKey(
    "raw",
    clientKeyPair.publicKey
  );

  // Convert client's public key to Base64 for easy transmission
  const clientPublicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(clientPublicKeyArrayBuffer))
  );

  // Step 7: Return the shared secret (Base64) and client public key
  return {
    sharedSecret: sharedSecretBase64,
    clientPublicKeyBase64,
  };
};

export { generateECDHKeyPairAndSharedSecret };
