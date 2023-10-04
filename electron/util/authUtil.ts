import { exec } from "child_process";
import fs from "fs";
import path from "node:path";

//使用vbs提权，因为是新的进程执行，所以只能把查询输出写到文件然后轮询读取
export function executeCmdAndGetOutput(
  maxAttempts = 3,
  pollInterval = 1000,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const outputFile = path.join(process.env.VITE_PUBLIC, "cmd_output");

    function pollForFile() {
      attempts++;
      fs.access(outputFile, fs.constants.F_OK, (err) => {
        if (!err) {
          // 输出文件存在，读取并返回内容
          fs.readFile(outputFile, "utf16le", (err, data) => {
            if (!err) {
              fs.unlink(outputFile, () => {});
              resolve(data);
            } else {
              reject("无法读取输出文件：" + err);
            }
          });
        } else {
          // 输出文件不存在，继续轮询或停止
          if (attempts < maxAttempts) {
            setTimeout(pollForFile, pollInterval);
          } else {
            reject("达到最大尝试次数，停止轮询。");
          }
        }
      });
    }

    const cmdPath = `${path.join(process.env.VITE_PUBLIC, "getAuth.bat")}`;
    // 执行cmd脚本
    exec(
      `cd ${process.env.VITE_PUBLIC} && getAuth.bat`,
      (error, stdout, stderr) => {
        if (error) {
          reject("执行脚本时出错：" + cmdPath + " " + error.toString());
          return;
        }
        console.log("脚本执行成功。" + cmdPath);
        pollForFile(); // 开始轮询
      },
    );
  });
}

import { Credentials } from "league-connect";

const RIOT_GAMES_CERT = `
-----BEGIN CERTIFICATE-----
MIIEIDCCAwgCCQDJC+QAdVx4UDANBgkqhkiG9w0BAQUFADCB0TELMAkGA1UEBhMC
VVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFTATBgNVBAcTDFNhbnRhIE1vbmljYTET
MBEGA1UEChMKUmlvdCBHYW1lczEdMBsGA1UECxMUTG9MIEdhbWUgRW5naW5lZXJp
bmcxMzAxBgNVBAMTKkxvTCBHYW1lIEVuZ2luZWVyaW5nIENlcnRpZmljYXRlIEF1
dGhvcml0eTEtMCsGCSqGSIb3DQEJARYeZ2FtZXRlY2hub2xvZ2llc0ByaW90Z2Ft
ZXMuY29tMB4XDTEzMTIwNDAwNDgzOVoXDTQzMTEyNzAwNDgzOVowgdExCzAJBgNV
BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRUwEwYDVQQHEwxTYW50YSBNb25p
Y2ExEzARBgNVBAoTClJpb3QgR2FtZXMxHTAbBgNVBAsTFExvTCBHYW1lIEVuZ2lu
ZWVyaW5nMTMwMQYDVQQDEypMb0wgR2FtZSBFbmdpbmVlcmluZyBDZXJ0aWZpY2F0
ZSBBdXRob3JpdHkxLTArBgkqhkiG9w0BCQEWHmdhbWV0ZWNobm9sb2dpZXNAcmlv
dGdhbWVzLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKoJemF/
6PNG3GRJGbjzImTdOo1OJRDI7noRwJgDqkaJFkwv0X8aPUGbZSUzUO23cQcCgpYj
21ygzKu5dtCN2EcQVVpNtyPuM2V4eEGr1woodzALtufL3Nlyh6g5jKKuDIfeUBHv
JNyQf2h3Uha16lnrXmz9o9wsX/jf+jUAljBJqsMeACOpXfuZy+YKUCxSPOZaYTLC
y+0GQfiT431pJHBQlrXAUwzOmaJPQ7M6mLfsnpHibSkxUfMfHROaYCZ/sbWKl3lr
ZA9DbwaKKfS1Iw0ucAeDudyuqb4JntGU/W0aboKA0c3YB02mxAM4oDnqseuKV/CX
8SQAiaXnYotuNXMCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAf3KPmddqEqqC8iLs
lcd0euC4F5+USp9YsrZ3WuOzHqVxTtX3hR1scdlDXNvrsebQZUqwGdZGMS16ln3k
WObw7BbhU89tDNCN7Lt/IjT4MGRYRE+TmRc5EeIXxHkQ78bQqbmAI3GsW+7kJsoO
q3DdeE+M+BUJrhWorsAQCgUyZO166SAtKXKLIcxa+ddC49NvMQPJyzm3V+2b1roP
SvD2WV8gRYUnGmy/N0+u6ANq5EsbhZ548zZc+BI4upsWChTLyxt2RxR7+uGlS1+5
EcGfKZ+g024k/J32XP4hdho7WYAS2xMiV83CfLR/MNi8oSMaVQTdKD8cpgiWJk3L
XWehWA==
-----END CERTIFICATE-----
`;

export async function getAuthInfo(): Promise<Credentials> {
  const rawStdout = await executeCmdAndGetOutput();
  const portRegex = /--app-port=([0-9]+)(?= *"| --)/;
  const passwordRegex = /--remoting-auth-token=(.+?)(?= *"| --)/;
  const pidRegex = /--app-pid=([0-9]+)(?= *"| --)/;

  try {
    const stdout = rawStdout.replace(/\n|\r/g, "");
    const [, port] = stdout.match(portRegex);
    const [, password] = stdout.match(passwordRegex);
    const [, pid] = stdout.match(pidRegex);

    return {
      port: Number(port),
      pid: Number(pid),
      password,
      certificate: RIOT_GAMES_CERT,
    };
  }catch (e) {
    throw new Error("提取LCU进程信息失败");
  }
}

