import CryptoJS from "crypto-js";

const calculateDigest = (data: any): string => {
  return CryptoJS.SHA256(JSON.stringify(data)).toString(CryptoJS.enc.Base64);
};

const generateSignatureBase = (
  method: string,
  authority: string,
  path: string,
  contentType: string | undefined,
  contentLength: number | undefined,
  digest: string | undefined,
  now: number
): string => {
  if (method.toLowerCase() === "get") {
    return (
      `"@method": ${method.toUpperCase()}\n` +
      `"@authority": ${authority}\n` +
      `"@path": ${path}\n` +
      `"@signature-params": ("@method" "@authority" "@path");created=${now}`
    );
  } else if (method.toLowerCase() === "post") {
    return (
      `"@method": ${method.toUpperCase()}\n` +
      `"@authority": ${authority}\n` +
      `"@path": ${path}\n` +
      `"content-type": ${contentType}\n` +
      `"content-length": ${contentLength}\n` +
      `"digest": ${digest}\n` +
      `"@signature-params": ("@method" "@authority" "@path" "content-type" "content-length" "digest");created=${now}`
    );
  }
  return "";
};

const generateSignatureInput = (method: string, now: number): string => {
  if (method.toLowerCase() === "get") {
    return `sig-1=("@method" "@authority" "@path");created=${now}`;
  } else if (method.toLowerCase() === "post") {
    return `sig-1=("@method" "@authority" "@path" "digest" "content-type" "content-length");created=${now}`;
  }
  return "";
};

const generateSignature = (
  signatureBase: string,
  secretKey: string
): string => {
  const signature = CryptoJS.HmacSHA256(signatureBase, secretKey).toString(
    CryptoJS.enc.Base64
  );
  return `sig-1=:${signature}:`;
};

const parseCreatedFromSignatureInput = (
  signatureInput: string
): number | null => {
  const createdMatch = signatureInput.match(/;created=(\d+)/);
  if (createdMatch && createdMatch[1]) {
    return parseInt(createdMatch[1], 10);
  }
  return null;
};

export {
  calculateDigest,
  generateSignature,
  generateSignatureBase,
  generateSignatureInput,
  parseCreatedFromSignatureInput,
};
