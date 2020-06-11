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
      if (taggerName || taggerEmail) {
        core.info(
          `Using tag author: ${taggerName || ""}${
            taggerEmail ? ` <${taggerEmail}>` : ""
          }`
        );
      }
      const tagRequest = await octokit.git.createTag({
        ...github.context.repo,
        tag: tagName,
        message: tagMessage,
        object: github.context.sha,
        type: "commit",
        // tagger: {
        //   name: taggerName,
        //   email: taggerEmail,
        // },
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
    core.error(`Caught error: ${JSON.stringify(error)}`);
    core.setFailed(error.mesage);
  }
}

run();
