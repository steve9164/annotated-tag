import * as core from "@actions/core";
import * as github from "@actions/github";

async function run(): Promise<void> {
  try {
    const tagName = core.getInput("tag-name", { required: true });
    const tagMessage = core.getInput("tag-message");
    const taggerName = core.getInput("tagger-name") || undefined;
    const taggerEmail = core.getInput("tagger-email") || undefined;
    const token = core.getInput("github-token", { required: true });
    const octokit = github.getOctokit(token);
    if (tagMessage) {
      core.info("Creating an annotated git tag equivalent to:");
      core.info(`  git tag -a ${tagName} -m "${tagMessage}"`);
      // Build tagger object because createTag doesn't like undefined parameters
      const tagger: { name?: string; email?: string } = {};
      if (taggerName || taggerEmail) {
        let message = "Using tag author:";
        if (taggerName) {
          tagger.name = taggerName;
          message += ` ${taggerName}`;
        }
        if (taggerEmail) {
          tagger.email = taggerEmail;
          message += ` <${taggerEmail}>`;
        }
        core.info(message);
      }
      const tagRequest = await octokit.git.createTag({
        ...github.context.repo,
        tag: tagName,
        message: tagMessage,
        object: github.context.sha,
        type: "commit",
        tagger,
      });
      await octokit.git.createRef({
        ...github.context.repo,
        ref: `refs/tags/${tagName}`,
        sha: tagRequest.data.sha,
      });
    } else {
      core.info("Creating a lightweight git tag equivalent to:");
      core.info(`  git tag ${tagName}`);
      await octokit.git.createRef({
        ...github.context.repo,
        ref: `refs/tags/${tagName}`,
        sha: github.context.sha,
      });
    }
  } catch (error) {
    if (error.message) {
      core.setFailed(error.mesage);
    } else if (error.request) {
      core.setFailed(
        `Request to ${error.request.url} failed with status code ${error.status}`
      );
      core.error(
        `Returned data: ${
          typeof error.request.data === "object"
            ? JSON.stringify(error.request.data)
            : error.request.data
        }`
      );
    }
  }
}

run();
