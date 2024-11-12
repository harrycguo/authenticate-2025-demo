// utils/axiosClient.js
import axios from "axios";
import {
  calculateDigest,
  generateSignature,
  generateSignatureBase,
  generateSignatureInput,
} from "./signature";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // Set your base URL
});

axiosInstance.interceptors.request.use((config) => {
  // Access the secret key with a type assertion
  const secretKey = (config as any).secretKey;

  // Continue with your custom headers and signature logic
  // e.g., generating signature with `secretKey`

  // Set custom headers
  config.headers["Authority"] = config.baseURL;

  // Calculate Content-Length and Content-Type if request data is provided
  let contentLength;
  let contentType;
  if (config.data) {
    contentLength = new Blob([JSON.stringify(config.data)]).size;
    contentType = config.headers["Content-Type"] || "application/json";
  }

  // Calculate Digest header if request data is provided
  if (config.data) {
    const digest = calculateDigest(config.data);
    config.headers["Digest"] = `SHA-256=${digest}`;
  }

  console.log("Staging request:");
  console.log("Method:", config.method);
  console.log("Authority:", config.baseURL);
  console.log("Path:", config.url);
  console.log("Digest:", config.headers["Digest"]);
  console.log("Content Length:", contentLength);
  console.log("Content Type:", contentType);

  const now = Math.floor(Date.now() / 1000);
  const signatureBase = generateSignatureBase(
    config.method as string,
    config.baseURL as string,
    config.url as string,
    contentType as string,
    contentLength,
    config.headers["Digest"] as string,
    now
  );
  console.log("Signature Base:", signatureBase);
  const signatureInput = generateSignatureInput(config.method as string, now);
  console.log("Signature Input:", signatureInput);
  const signature = generateSignature(signatureBase, secretKey);

  config.headers["Signature-Input"] = signatureInput;
  config.headers["Signature"] = signature;
  return config;
});

// Wrapper function that takes a secret key and makes a request with it
// Wrapper function that takes a secret key and makes a request with it
export const axiosClient = (secretKey: string) => {
  return {
    get: (url: string, config = {}) =>
      axiosInstance.get(url, { ...config, secretKey } as any),

    post: (url: string, data: any, config = {}) =>
      axiosInstance.post(url, data, { ...config, secretKey } as any),

    put: (url: string, data: any, config = {}) =>
      axiosInstance.put(url, data, { ...config, secretKey } as any),

    delete: (url: string, config = {}) =>
      axiosInstance.delete(url, { ...config, secretKey } as any),
  };
};

export default axiosClient;
