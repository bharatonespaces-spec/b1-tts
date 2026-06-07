const { EdgeTTS } = require('node-edge-tts');
const tts = new EdgeTTS({ voice: 'en-US-AriaNeural' });
tts.ttsPromise('Hello this is a test', 'test.mp3')
  .then(() => console.log('Done'))
  .catch(console.error);
