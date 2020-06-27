const fetch = require('node-fetch');
const inquirer = require('inquirer');

console.log('[!] Prior to starting, make sure to hold down the power button for 5-7 seconds to enter pairing mode.');

inquirer.prompt([{ type: 'input', name: 'ip', message: "What's the IP of your Nanoleaf product?" }]).then((answers) => {
  fetch(`http://${answers.ip}:16021/api/v1/new`, { method: 'POST' })
    .then((res) => res.json())
    .then((json) => console.log(`[!] Authorization token: ${json.auth_token}`));
});
