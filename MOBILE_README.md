# Desafio DPI — Mobile

Aplicativo Capacitor separado do projeto principal.

## Primeira etapa

O app nativo carrega a versão oficial:

https://jogo.elx-vet.com.br/

Assim, o site atual não é substituído e o aplicativo pode receber recursos nativos gradualmente.

## Identidade

- Nome: Desafio DPI
- App ID: br.com.elxvet.desafiodpi
- Android: Google Play
- iOS: App Store

## Requisitos

- Node.js 22+
- Capacitor 8
- Android Studio 2025.2.1+
- Xcode 26+ para iOS

Capacitor 8 é a versão estável documentada atualmente e requer Node 22+. Android usa compile/target SDK 36 na linha Capacitor 8.

## Preparação local

npm install
npx cap add android
npx cap add ios
npx cap sync

## Segurança do projeto

Este branch não altera a main. A publicação web continua independente.

## Próximas etapas

1. gerar APK de teste;
2. testar microfone/Mãos Livres;
3. testar áudio/TTS;
4. testar Android real;
5. preparar assinatura e AAB;
6. preparar projeto iOS e TestFlight;
7. somente depois publicar nas lojas.
