import { timingSafeEqual } from "node:crypto";

export function hasAccess(candidate: string | null | undefined) {
  const expected = process.env.MAHJONG_ACCESS_KEY;
  if (!expected) return process.env.NODE_ENV !== "production" && candidate === "demo";
  if (!candidate) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}
