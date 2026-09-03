import { verifyGithubWritePermission } from "../src/data-access/github-permissions";

const token = process.env.GITHUB_DATA_TOKEN;
if (!token?.startsWith("github_pat_")) throw new Error("GITHUB_DATA_TOKEN must be a fine-grained token");
await verifyGithubWritePermission(token);
console.log("GitHub data token has Contents write permission.");
