import fs from 'node:fs';
import path from 'node:path';

const manifest = path.resolve('android/app/src/main/AndroidManifest.xml');
if (fs.existsSync(manifest)) {
  let s = fs.readFileSync(manifest, 'utf8');
  if (!s.includes('android.permission.RECORD_AUDIO')) {
    s = s.replace(/<application\\b/, '<uses-permission android:name="android.permission.RECORD_AUDIO" />\\n    <application');
    fs.writeFileSync(manifest, s);
  }
}

const info = path.resolve('ios/App/App/Info.plist');
if (fs.existsSync(info)) {
  let s = fs.readFileSync(info, 'utf8');
  if (!s.includes('NSMicrophoneUsageDescription')) {
    s = s.replace('</dict>', '    <key>NSMicrophoneUsageDescription</key>\\n    <string>O Desafio DPI usa o microfone para o modo Mãos Livres.</string>\\n</dict>');
  }
  if (!s.includes('NSSpeechRecognitionUsageDescription')) {
    s = s.replace('</dict>', '    <key>NSSpeechRecognitionUsageDescription</key>\\n    <string>O Desafio DPI usa reconhecimento de voz para responder no modo Mãos Livres.</string>\\n</dict>');
  }
  fs.writeFileSync(info, s);
}
