const core = require("@actions/core");
const github = require("@actions/github");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const csso = require("csso");
const { minify } = require("terser");

const { Octokit } = require("@octokit/core");
const { createPullRequest } = require("octokit-plugin-create-pull-request");
const MyOctokit = Octokit.plugin(createPullRequest);

(async function init() {
  try {
    let directory = core.getInput("directory");
    const token = process.env.GITHUB_TOKEN;

    if (token === undefined) {
      throw new Error(`
        Token not found. Please, set a secret token in your repository. 
        To know more about creating tokens, visit: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
        To know more about setting up personal access token, visit: https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
      `);
    }

    const currentBranch = github.context.ref.slice(11);
    if(currentBranch.startsWith('minisauras')){
      console.log(`Code has been minifed. Branch ${currentBranch} can be merged now.`);
      return;
    }

    const pluginOctokit = new MyOctokit({
      auth: token,
    });
    const context = github.context;
    const repoInfo = context.repo;

    if (
      directory == undefined ||
      directory == null ||
      directory.startsWith(".")
    )
      directory = "";

    const pattern = `${directory}**/*.{css,js}`;
    const options = {
      dot: true,
      ignore: ["node_modules/**/*"],
    };

    glob(pattern, options, function (er, files) {
      if (er) throw new Error("File not found");
      let final = [];

      files.forEach(function (file) {
        Promise.all([readAndMinify(file)])
          .then(function (result) {
            final.push({
              path: file,
              content: result[0],
            });
          })
          .finally(function () {
            let encodedStructure = {};

            if (final.length == files.length) {
              final.forEach(function (eachData) {
                encodedStructure[eachData.path] = eachData["content"];
              });

              try {
                const weekDay = [
                  "Sat",
                  "Sun",
                  "Mon",
                  "Tue",
                  "Wed",
                  "Thu",
                  "Fri",
                ];

                pluginOctokit.createPullRequest({
                  owner: repoInfo.owner,
                  repo: repoInfo.repo,
                  title: "Custom title",
                  body: "Custom description",
                  head: "minisauras_" +
                    weekDay[new Date().getDay()] +
                    "_" +
                    new Date().getDate() +
                    "_" +
                    new Date().getTime(),
                  changes: [{
                    files: encodedStructure,
                    commit: "Updating something",
                  }, ],
                });
              } catch (error) {
                console.log("Warning from pluginOctokit");
              }
            }
          })
          .catch(function (err) {
            console.log("Warning from main");
          });
      });
    });
  } catch (error) {
    // core.setFailed(error.message);
  }
})();

const readAndMinify = async function (file) {
  const content = fs.readFileSync(file, "utf8");
  const extension = path.extname(file);

  // minify file
  if (extension === ".js") {
    const result = await minify(content, {
      compress: true,
    });
    return result.code;
  } else if (extension === ".css") {
    return csso.minify(content).css;
  } else {
    console.log("Other files");
  }
};