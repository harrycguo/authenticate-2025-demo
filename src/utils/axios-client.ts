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
  const signedToken = (config as any).signedToken;

  // Set custom headers

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
  const signatureInput = generateSignatureInput(config.method as string, now);
  const signature = generateSignature(signatureBase, secretKey);

  config.headers["Authority"] = config.baseURL;
  config.headers["Authorization"] = `Bearer ${signedToken}`;

  config.headers["Signature-Input"] = signatureInput;
  config.headers["Signature"] = signature;
  return config;
});

// Wrapper function that takes a secret key and makes a request with it
// Wrapper function that takes a secret key and makes a request with it
export const axiosClient = (secretKey: string, signedToken: string) => {
  return {
    get: (url: string, config = {}) =>
      axiosInstance.get(url, { ...config, secretKey, signedToken } as any),

    post: (url: string, data: any, config = {}) =>
      axiosInstance.post(url, data, {
        ...config,
        secretKey,
        signedToken,
      } as any),

    put: (url: string, data: any, config = {}) =>
      axiosInstance.put(url, data, {
        ...config,
        secretKey,
        signedToken,
      } as any),

    delete: (url: string, config = {}) =>
      axiosInstance.delete(url, { ...config, secretKey, signedToken } as any),
  };
};

export default axiosClient;
