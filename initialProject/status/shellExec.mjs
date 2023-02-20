import { exec } from 'child_process';

export const shellExec = async (cmd, options = {}) => {
  return new Promise(function (resolve, reject) {
    exec(cmd, { shell: '/bin/bash' }, (err, stdout, stderr) => {
      if (err) {
        resolve({ code: err.code, stdout, stderr });
      } else {
        resolve({ code: 0, stdout, stderr });
      }
    });
  });
};
