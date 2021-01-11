#!/usr/bin/env node
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env')});

const fs = require('fs');
const process = require('process');
const { ArgumentParser } = require('argparse')
const child_process = require('child_process');
const axios = require('axios');

const create = async () => {
  const parser = new ArgumentParser();

  parser.add_argument('--name', '-n', {
    type: String,
    dest: 'name',
    required: true
  });

  const args = parser.parse_args();
  const projectName = args.name;
  const userName = process.env.OWNER;
  const projectDirectory = process.env.PROJECT_FOLDER_BASE + projectName;
  const token = process.env.TOKEN;

  try {
  
    const res = await axios({
      method: 'post',
      url: 'https://api.github.com/user/repos',
      headers: {
        Authorization: 'token ' + token,
        Accept: 'application/vnd.github.v3+json'
      },
      data: {
        name: projectName
      }

    });
  
    const commands = [
      `echo "# ${projectName}" >> README.md`,
      'git init',
      `git remote add origin https://github.com/${userName}/${projectName}.git`,
      'git add .',
      'git commit -m "Initial commit"',
      'git push -u origin master',
      'code .'
    ];

    fs.mkdirSync(projectDirectory);
    process.chdir(projectDirectory);

    for(c in commands) {
        child_process.execSync(commands[c], (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if(stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
    }

  } catch (error) {
    console.error(error);
  }


}

create();
