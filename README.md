<div align="center">

![banner](icon.svg)

![minisauras](https://github.com/TeamTigers/minisauras/workflows/minisauras/badge.svg)
![star](https://badgen.net/github/stars/TeamTigers/minisauras)
![releases](https://badgen.net/github/release/teamtigers/minisauras)
![GitHub](https://img.shields.io/github/license/teamtigers/minisauras)
![GitHub repo size](https://img.shields.io/github/repo-size/teamtigers/minisauras?color=green)
[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2Fteamtigers%2Fminisauras&count_bg=%23673AB7&title_bg=%23413B33&icon=buzzfeed.svg&icon_color=%23FFFFFF&title=vistited&edge_flat=false)](https://hits.seeyoufarm.com)

</div>



# Minisauras :tada:
Minisauras is an open-source CI/CD automation tool based on :octocat: [**GitHub Actions**](https://github.com/features/actions) that pulls all the JavaScript and CSS files from your base branch, minify them and creates a pull-request with a new branch. 

## How it works
- Traverse through a given directory (if not provided, traverse from root), finds all the JavaScript & CSS files within it and it's sub-directories. 
- Afterwards, **Minisauras** minify all those files.
- Finally, it creates a new branch in your repository, push those changes and creates a pull request that can be merged in your base branch.

## Usage
- Create a [personal access token](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).
- Then [setup a secret](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) using that personal access token in your desired repository.
- Create a workflow. For example: **main.yml** under (.github/workflows) directory.
- In the workflow, provide following things:
    * Personal access token. For example: ${{ secrets.TOKEN }} if you set your secret with a name 'TOKEN'.
    * The desired directory in which you want to minify CSS and JS files. For example: './' for root and 'src/' for src directory.

## Examples

_**If you want to minify all your JS and CSS files under root directory**_

```yml
name: minisauras

on: [push]

jobs:
  read:
    runs-on: ubuntu-18.04

    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: minisauras
      uses: TeamTigers/minisauras@v1.0.0
      env:
        GITHUB_TOKEN: ${{ secrets.TOKEN }}
      id: dir
      with:
        directory: './' ## minify all files from root directory
```


_**If you want to minify all your JS and CSS files under your custom directory ex. assets/js & assets/css**_

```yml
name: minisauras

on: [push]

jobs:
  read:
    runs-on: ubuntu-18.04

    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: minisauras
      uses: TeamTigers/minisauras@v1.0.0
      env:
        GITHUB_TOKEN: ${{ secrets.TOKEN }}
      id: dir
      with:
        directory: 'assets/' ## minify all files under assets directory
```
## License 
This project is licensed under [MIT](LICENSE)

## If you like our work please give it a :star:
