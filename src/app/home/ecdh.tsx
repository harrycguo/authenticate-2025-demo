import { retrieveClientKeyPair } from "@/utils/indexed-db";

const generateSharedSecret = async (): Promise<string> => {
  // Retrieve client key pair and server public key from IndexedDB
  const { clientKeyPair, serverPublicKey } = await retrieveClientKeyPair();

  if (!clientKeyPair || !serverPublicKey) {
    return "no-key";
  }

  try {
    // Derive the shared secret using the client private key and server public key
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

    console.log("Shared secret derived successfully.");
    return sharedSecretBase64;
  } catch (error) {
    console.error("Failed to derive shared secret:", error);
    return "no-key";
  }
};

export { generateSharedSecret };
