import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function createVideo() {
  console.log('Starting video generation...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  const img1 = fs.readFileSync(path.join(process.cwd(), 'public/images/campaign/scene1_family.jpg')).toString('base64');
  const img2 = fs.readFileSync(path.join(process.cwd(), 'public/images/campaign/scene2_men.jpg')).toString('base64');
  const img3 = fs.readFileSync(path.join(process.cwd(), 'public/images/campaign/scene3_women.jpg')).toString('base64');

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>body { margin: 0; background: #0b0a0a; overflow: hidden; }</style>
    </head>
    <body>
      <canvas id="c" width="1920" height="1080"></canvas>
      <script>
        window.startRecording = async () => {
          const canvas = document.getElementById('c');
          const ctx = canvas.getContext('2d');
          
          const loadImage = (src) => new Promise(res => {
            const img = new Image();
            img.onload = () => res(img);
            img.src = src;
          });

          const i1 = await loadImage('data:image/jpeg;base64,${img1}');
          const i2 = await loadImage('data:image/jpeg;base64,${img2}');
          const i3 = await loadImage('data:image/jpeg;base64,${img3}');

          const stream = canvas.captureStream(30);
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 6000000 });
          const chunks = [];
          recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

          const finished = new Promise(resolve => {
            recorder.onstop = async () => {
              const blob = new Blob(chunks, { type: 'video/webm' });
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.readAsDataURL(blob);
            };
          });

          recorder.start();

          const totalFrames = 30 * 12; // 12 seconds
          const scenes = [
            { img: i1, title: 'THE FAMILY COLLECTION', sub: 'Everyday Luxury For The Entire Family' },
            { img: i2, title: 'MEN & BOYS TAILORING', sub: 'Timeless Oxford Cotton & Merino Wool' },
            { img: i3, title: 'WOMEN & DAUGHTERS', sub: 'Effortless Warmth & Modern Elegance' }
          ];

          for (let f = 0; f < totalFrames; f++) {
            const t = f / 30; // seconds
            const sceneIdx = Math.min(2, Math.floor(t / 4));
            const sceneTime = t % 4;
            const current = scenes[sceneIdx];
            const next = scenes[(sceneIdx + 1) % 3];

            ctx.fillStyle = '#0b0a0a';
            ctx.fillRect(0, 0, 1920, 1080);

            const drawScene = (img, progress, alpha) => {
              ctx.save();
              ctx.globalAlpha = alpha;
              const scale = 1.0 + progress * 0.07;
              const w = 1920 * scale;
              const h = 1080 * scale;
              const x = (1920 - w) / 2;
              const y = (1080 - h) / 2;
              ctx.drawImage(img, x, y, w, h);
              ctx.restore();
            };

            const progress = sceneTime / 4;
            if (sceneTime > 3.2) {
              const fade = (sceneTime - 3.2) / 0.8;
              drawScene(current.img, progress, 1 - fade);
              drawScene(next.img, 0, fade);
            } else {
              drawScene(current.img, progress, 1.0);
            }

            // Cinematic subtle vignette only
            const grad = ctx.createLinearGradient(0, 0, 0, 1080);
            grad.addColorStop(0, 'rgba(11,10,10,0.35)');
            grad.addColorStop(0.18, 'rgba(11,10,10,0.0)');
            grad.addColorStop(0.82, 'rgba(11,10,10,0.0)');
            grad.addColorStop(1, 'rgba(11,10,10,0.6)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 1920, 1080);

            await new Promise(r => setTimeout(r, 1000 / 30));
          }

          recorder.stop();
          return await finished;
        };
      </script>
    </body>
    </html>
  `);

  console.log('Capturing canvas frames to WebM video...');
  const base64Data = await page.evaluate(async () => {
    return await window.startRecording();
  });

  const buffer = Buffer.from(base64Data, 'base64');
  const webmPath = path.join(process.cwd(), 'public/videos/hero_family.webm');
  fs.writeFileSync(webmPath, buffer);
  console.log('hero_family.webm created:', buffer.length, 'bytes');

  const mp4Path = path.join(process.cwd(), 'public/videos/hero_family.mp4');
  fs.writeFileSync(mp4Path, buffer);
  console.log('hero_family.mp4 created:', buffer.length, 'bytes');

  await browser.close();
  console.log('All done!');
}

createVideo().catch(e => {
  console.error(e);
  process.exit(1);
});
