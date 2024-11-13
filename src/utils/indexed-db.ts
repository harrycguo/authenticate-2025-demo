type StoredKeys = {
  clientPrivateKey: JsonWebKey;
  clientPublicKey: JsonWebKey;
  serverPublicKey: JsonWebKey;
};

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("KeyStoreDB", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore("biSecureAccessKey");
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

const storeClientKeyPair = async (
  clientKeyPair: CryptoKeyPair,
  serverPublicKey: CryptoKey // Optional if not always available
): Promise<void> => {
  const db = await openDatabase();

  // Export the private and public keys as JWK
  const privateKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    clientKeyPair.privateKey
  );
  const publicKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    clientKeyPair.publicKey
  );

  const serverKeyJWK = await window.crypto.subtle.exportKey(
    "jwk",
    serverPublicKey
  );

  const transaction = db.transaction("biSecureAccessKey", "readwrite");
  const store = transaction.objectStore("biSecureAccessKey");

  const keyPairData: StoredKeys = {
    clientPrivateKey: privateKeyJWK,
    clientPublicKey: publicKeyJWK,
    serverPublicKey: serverKeyJWK,
  };

  return new Promise<void>((resolve, reject) => {
    const request = store.put(keyPairData, "clientKeyPair");
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

const retrieveClientKeyPair = async (): Promise<{
  clientKeyPair: CryptoKeyPair | null;
  serverPublicKey: CryptoKey | null;
}> => {
  const db = await openDatabase();
  const transaction = db.transaction("biSecureAccessKey", "readonly");
  const store = transaction.objectStore("biSecureAccessKey");

  return new Promise(async (resolve, reject) => {
    const request = store.get("clientKeyPair");

    request.onsuccess = async () => {
      const result = request.result as StoredKeys | undefined;
      if (result) {
        const privateKey = await window.crypto.subtle.importKey(
          "jwk",
          result.clientPrivateKey,
          { name: "ECDH", namedCurve: "P-256" },
          true,
          ["deriveKey"]
        );

        const publicKey = await window.crypto.subtle.importKey(
          "jwk",
          result.clientPublicKey,
          { name: "ECDH", namedCurve: "P-256" },
          true,
          []
        );

        let serverPublicKey = null;
        if (result.serverPublicKey) {
          serverPublicKey = await window.crypto.subtle.importKey(
            "jwk",
            result.serverPublicKey,
            { name: "ECDH", namedCurve: "P-256" },
            true,
            []
          );
        }

        resolve({ clientKeyPair: { privateKey, publicKey }, serverPublicKey });
      } else {
        resolve({ clientKeyPair: null, serverPublicKey: null });
      }
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

export { retrieveClientKeyPair, storeClientKeyPair };
