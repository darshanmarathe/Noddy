@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\..\bootstrap\bin\bootstrap" %*
) ELSE (
  node  "%~dp0\..\bootstrap\bin\bootstrap" %*
)