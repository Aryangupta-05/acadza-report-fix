import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {build} from 'esbuild';
await mkdir('dist',{recursive:true});
await build({entryPoints:['public/app.js'],bundle:true,minify:true,outfile:'dist/app.js',target:'es2022'});
await writeFile('dist/style.css',await readFile('public/style.css'));await writeFile('dist/index.html',await readFile('public/index.html'));
console.log('Frontend compiled; production serves public assets through the server.');
