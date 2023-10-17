const core = require("@actions/core");
const github = require("@actions/github");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const csso = require("csso");
const {
    minify
} = require("terser");

const {
    Octokit
} = require("@octokit/core");
const {
    createPullRequest
} = require("octokit-plugin-create-pull-request");
const MyOctokit = Octokit.plugin(createPullRequest);

/**
 * Reads the personal access token and desired directory
 * that needs to be minified from workflow.
 * 
 * Exits if token is undefined or, the current branch is a newly
 * created branch by minisauras.
 * 
 * Uses 'glob' to find all possible CSS and JS 
 * files within the desired directory and ignores node_modules.
 * 
 * Minify those files using 'csso' and 'terser' and
 * finally push those changes within a new branch to create a PR.
 */
(async function init() {
    try {
        let directory = core.getInput("directory");
        const token = process.env.GITHUB_TOKEN;

        if (token === undefined || token.length === 0) {
            throw new Error(`
        Token not found. Please, set a secret token in your repository. 
        To know more about creating tokens, visit: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
        To know more about setting up personal access token, visit: https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets
      `);
        }

        const currentBranch = github.context.ref.slice(11);
        if (currentBranch.startsWith('versao_')) {
            console.log(`Code has been minifed. Branch ${currentBranch}.`);
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

        const pattern = `${directory}**/*.{css,js,json,html}`;
        const options = {
            dot: true
        };

        fetch('manifest.json')
            .then(response => {
                const newBranchName = 'versao_' + response.json().version;

                /** Using @glob to find all CSS and JS files */
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
                            .finally(async function () {
                                let encodedStructure = {};

                                if (final.length == files.length && !currentBranch.startsWith('versao_') && files.length !== 0) {
                                    final.forEach(function (eachData) {
                                        encodedStructure[eachData.path] = eachData["content"];
                                    });

                                    // setting up pr description
                                    let prDescription = 'Changes in these files:\n';
                                    files.forEach(function (f) {
                                        prDescription += `- **${f}** \n`;
                                    });

                                    await pluginOctokit.createPullRequest({
                                        owner: repoInfo.owner,
                                        repo: repoInfo.repo,
                                        title: `Minified ${files.length} files`,
                                        body: prDescription,
                                        head: newBranchName,
                                        changes: [{
                                            files: encodedStructure,
                                            commit: `Minified ${files.length} files`,
                                        },],
                                    }).then(function (result) {
                                        const tableData = {
                                            'Pull request url': result.data.url,
                                            'Pull request title': result.data.title,
                                            'Sent by': result.data.user.login,
                                            'Total number of commits': result.data.commits,
                                            'Additions': result.data.additions,
                                            'Deletions': result.data.deletions,
                                            'Number of files changed': result.data.changed_files
                                        }
                                        console.table(tableData);
                                    }).catch(function () {
                                        process.on('unhandledRejection', () => { });
                                    });
                                }
                            })
                            .catch(function (error) {
                                throw new Error(error);
                            });
                    });
                });
            })
    } catch (error) {
        throw new Error(error);
    }
})();

/**
 * Uses terser and csso to minify JavaScript and CSS files.
 * @param {string} file containing file path to be minified.
 * 
 * @return {string} Minified content.
 */

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