import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  try {
    const tagName = core.getInput("tag-name", { required: true });
    const tagMessage = core.getInput("tag-mesage");
    const token = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(token);
    if (tagMessage) {
      // Create an annotated tag
      const tagRequest = await octokit.git.createTag({
        ...github.context.repo,
        tag: tagName,
        message: tagMessage,
        object: github.context.sha,
        type: "commit",
      });
      await octokit.git.createRef({
        ...github.context.repo,
        ref: `refs/tags/${tagName}`,
        sha: tagRequest.data.sha,
      });
    } else {
      // Create light-weight tag
      await octokit.git.createRef({
        ...github.context.repo,
        ref: `refs/tags/${tagName}`,
        sha: github.context.sha,
      });
    }
  } catch (error) {
    core.setFailed(error.mesage);
  }
}

run();
