import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  try {
    const tagName = core.getInput("tag-name", { required: true });
    const tagMessage = core.getInput("tag-message");
    const token = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(token);
    if (tagMessage) {
      core.debug("Creating an annotated git tag equivalent to:");
      core.debug(`  git tag -a ${tagName} -m "${tagMessage}"`);
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
      core.debug("Creating a lightweight git tag equivalent to:");
      core.debug(`  git tag ${tagName}`);
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
