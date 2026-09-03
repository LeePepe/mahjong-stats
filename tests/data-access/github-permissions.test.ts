import { describe, expect, it, vi } from "vitest";
import { verifyGithubWritePermission } from "../../src/data-access/github-permissions";

describe("GitHub token permission probe", () => {
  it("rejects a read-only token with an actionable message", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Resource not accessible by personal access token" }), { status: 403 }));
    await expect(verifyGithubWritePermission("github_pat_redacted", fetcher)).rejects.toThrow("Contents: Read and write");
  });
  it("accepts validation failure after GitHub authorizes PUT", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: "Invalid request" }), { status: 422 }));
    await expect(verifyGithubWritePermission("github_pat_redacted", fetcher)).resolves.toBeUndefined();
  });
});
