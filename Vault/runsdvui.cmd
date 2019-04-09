cd /d "D:\Vault\App\Vault2\Vault" &msbuild "Vault.csproj" /t:sdvViewer /p:configuration="Debug" /p:platform=Any CPU
exit %errorlevel% 