if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const l=e||("document"in self?document.currentScript.src:"")||location.href;if(s[l])return;let c={};const t=e=>i(e,l),o={module:{uri:l},exports:c,require:t};s[l]=Promise.all(n.map((e=>o[e]||t(e)))).then((e=>(r(...e),c)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/html2canvas.esm-CBrSDip1.js",revision:null},{url:"assets/index-Cak8CGgg.js",revision:null},{url:"assets/index-CY0gvAeJ.css",revision:null},{url:"assets/index.es-DptRqB6w.js",revision:null},{url:"assets/purify.es-a-CayzAK.js",revision:null},{url:"index.html",revision:"b7209dd036a9c0c8a87a28895220d39c"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"pwa-192x192.png",revision:"02c7cd69987852dbf00d588c7b3fec65"},{url:"pwa-512x512.png",revision:"469dc155c19b7ed4d3e395a31648e282"},{url:"pwa-maskable-192x192.png",revision:"5e72ca1ccb0fe45753fe29aeefc9533d"},{url:"pwa-maskable-512x512.png",revision:"0616c71922460536ade33bf5909cd9b9"},{url:"manifest.webmanifest",revision:"9c02cf8c4f1ea0e6a6d8591c57716c3d"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
