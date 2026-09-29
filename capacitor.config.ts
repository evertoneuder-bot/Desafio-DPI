import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.elxvet.desafiodpi',
  appName: 'Desafio DPI',
  webDir: 'web',
  server: {
    url: 'https://jogo.elx-vet.com.br/',
    cleartext: false,
    androidScheme: 'https'
  }
};

export default config;
