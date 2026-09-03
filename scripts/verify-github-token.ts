import { verifyGithubWritePermission } from "../src/data-access/github-permissions";

const token = process.env.GITHUB_DATA_TOKEN;
if (!token?.startsWith("github_pat_")) throw new Error("GITHUB_DATA_TOKEN must be a fine-grained token");

async function main() {
  await verifyGithubWritePermission(token!);
  console.log("GitHub data token has Contents write permission.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
