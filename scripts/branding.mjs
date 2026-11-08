import { chromium } from '@playwright/test';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

// Original geometric artwork; no third-party logos or player images.
const out = resolve('public/branding');
await mkdir(out, { recursive: true });
const five = ['11111', '10000', '10000', '11110', '00001', '00001', '11110'];
const pixels = five.flatMap((row, y) => [...row].map((cell, x) => cell === '1' ? `<rect x="${10 + x * 5}" y="${9 + y * 5}" width="5" height="5"/>` : '')).join('');
const mark = `<rect width="64" height="64" rx="12" fill="#141b21"/><g fill="#f4ead2">${pixels}</g><circle cx="44" cy="44" r="15" fill="#ff793f" stroke="#141b21" stroke-width="2"/><g fill="none" stroke="#141b21" stroke-width="1.7"><path d="M29 44h30M44 29v30M33 34q22 10 22 20M33 54q22-10 22-20"/></g>`;
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Five Run">${mark}</svg>`;
await writeFile(`${out}/icon.svg`, icon);
const font = (await readFile('public/fonts/PressStart2P-Regular.ttf')).toString('base64');
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await page.setContent(`<style>*{margin:0}svg{display:block;width:100vw;height:100vh}</style>${icon}`);
  for (const size of [32, 180, 192, 512]) {
    await page.setViewportSize({ width: size, height: size });
    await page.screenshot({ path: `${out}/icon-${size}.png`, omitBackground: true });
  }
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.setContent(`<!doctype html><html lang="pt-BR"><style>
  @font-face{font-family:pixel;src:url(data:font/ttf;base64,${font})}*{box-sizing:border-box}body{margin:0;background:#141b21;color:#f4ead2;font-family:Arial,sans-serif;width:1200px;height:630px;overflow:hidden}.grid{position:absolute;inset:0;background-image:linear-gradient(#26332f55 1px,transparent 1px),linear-gradient(90deg,#26332f55 1px,transparent 1px);background-size:40px 40px}.top{position:absolute;top:44px;left:58px;display:flex;align-items:center;gap:16px;font:16px pixel;color:#ff793f}.top svg{width:54px;height:54px}h1{position:absolute;left:58px;top:121px;margin:0;font:78px/1.3 pixel;letter-spacing:-4px}h1 span{color:#ff793f}.tag{position:absolute;left:62px;top:365px;width:610px;font-size:28px;line-height:1.5;letter-spacing:.2px}.bottom{position:absolute;left:62px;bottom:48px;font:13px pixel;color:#a4b4aa}.court{position:absolute;left:758px;top:42px;width:380px;height:548px;border:3px solid #6b8271;border-radius:180px 180px 18px 18px;transform:rotate(8deg);background:#26372e}.court:before{content:'';position:absolute;left:68px;top:83px;width:240px;height:240px;border:3px solid #6b8271;border-radius:50%}.court:after{content:'';position:absolute;left:98px;top:-3px;width:180px;height:230px;border:3px solid #6b8271}.ball{position:absolute;left:795px;top:226px;width:300px;height:300px;background:#ff793f;border:8px solid #141b21;border-radius:50%;overflow:hidden;box-shadow:14px 16px 0 #0b1115}.ball i{position:absolute;display:block;border:6px solid #141b21;border-radius:50%;width:310px;height:310px;left:-5px;top:-5px}.ball i:nth-child(1){left:-215px}.ball i:nth-child(2){left:190px}.ball:before{content:'';position:absolute;left:137px;height:100%;border-left:6px solid #141b21}.ball:after{content:'';position:absolute;top:137px;width:100%;border-top:6px solid #141b21}.star{position:absolute;left:750px;top:120px;color:#ff793f;font:64px pixel}.five{position:absolute;left:1000px;top:57px;font:74px pixel;color:#f4ead2;transform:rotate(8deg)}
  </style><div class="grid"></div><div class="court"></div><span class="five">5</span><span class="star">+</span><div class="ball"><i></i><i></i></div><div class="top">${icon}<span>BASQUETE ARCADE</span></div><h1>FIVE<br><span>RUN.</span></h1><p class="tag">Sorteie lendas. Monte seu quinteto.<br>Conquiste o título.</p><div class="bottom">500 JOGADORES · SEU QUINTETO · UM TÍTULO</div></html>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${out}/og-image.png` });
  const ogPreview = await readFile(`${out}/og-image.png`);
  await page.setViewportSize({ width: 600, height: 315 });
  await page.setContent(`<style>body{margin:0}img{width:600px;height:315px}</style><img src="data:image/png;base64,${ogPreview.toString('base64')}">`);
  await page.screenshot({ path: `${out}/thumbnail.png` });
} finally { await browser.close(); }
console.log('Original icon sizes, 1200×630 Open Graph image and 600×315 thumbnail generated.');
