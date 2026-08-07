import { Request } from "express";

export interface DeviceInfo {
  browser: string;
  os: string;
  device: string;
  ip: string;
}

export const parseDeviceInfo = (req: Request): DeviceInfo => {
  const ua = req.headers["user-agent"] || "";
  
  // Extract client IP (handle proxies & load balancers)
  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.socket.remoteAddress) ||
    req.ip ||
    "127.0.0.1";

  // Browser detection
  let browser = "Unknown Browser";
  if (/edg/i.test(ua)) browser = "Microsoft Edge";
  else if (/chrome|crios/i.test(ua) && !/opr|opera/i.test(ua)) browser = "Google Chrome";
  else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Apple Safari";
  else if (/opr|opera/i.test(ua)) browser = "Opera";
  else if (/postman/i.test(ua)) browser = "Postman";

  // Operating System detection
  let os = "Unknown OS";
  if (/windows nt 10.0/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt/i.test(ua)) os = "Windows";
  else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
  else if (/linux/i.test(ua)) os = "Linux";

  // Device detection
  let device = "Desktop";
  if (/mobile/i.test(ua)) device = "Mobile";
  else if (/tablet|ipad/i.test(ua)) device = "Tablet";

  return {
    browser,
    os,
    device,
    ip: ip.replace("::ffff:", ""),
  };
};
