npx create-expo-app@latest ChuaNha

npx expo start

Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
cmd:
set REACT_NATIVE_PACKAGER_HOSTNAME=172.19.251.203

npx expo start --lan --clear
npx expo start --go --lan --clear
--------------------------------
neu dung mang cong ty 
npx expo start --go --tunnel ngrok --clear
npm.cmd install --save-dev @expo/ngrok@^4.1.0
npx expo start --go --tunnel ngrok --clear
--------------------------------