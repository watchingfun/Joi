@echo off

:: 检查是否以管理员权限运行
>nul 2>&1 net session
    :: 获取当前脚本所在路径
    set "scriptDir=%~dp0"
    :: 构建结果文件路径
    set "resultFile=%scriptDir%cmd_output"
if %errorLevel% == 0 (
    echo 当前已以管理员权限运行
) else (
    echo 请求管理员权限并将结果写入文件...
    :: 使用 mshta 执行 VBScript 请求管理员权限并将结果写入文件
    mshta "javascript:var shell = new ActiveXObject('shell.application'); shell.ShellExecute('%~nx0', '', '', 'runas', 1);close();"
    exit /b
)

:: 在这里放置您需要以管理员权限运行的脚本命令
echo Hello, this is your script running with admin privileges.
:: 将结果写入文件
wmic PROCESS WHERE name='LeagueClientUx.exe' GET commandline /value > "%resultFile%"

