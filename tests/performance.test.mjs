import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../',import.meta.url));
const dist = join(root,'dist');
const get = (tag,name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];
function pages(directory) {
  return readdirSync(directory,{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? pages(join(directory,entry.name)) : entry.name.endsWith('.html') ? [join(directory,entry.name)] : []);
}
test('every published static image has working responsive assets and reserved dimensions', () => {
  let count = 0;
  for (const path of pages(dist)) {
    for (const match of readFileSync(path,'utf8').matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0]; const src = get(tag,'src');
      if (!src || src.includes('${')) continue;
      assert.match(src,/^\/assets\/images\/.+-[a-f0-9]{12}-\d+\.webp$/);
      assert.ok(existsSync(join(dist,src)),`${path}: ${src}`);
      assert.ok(Number(get(tag,'width'))>0 && Number(get(tag,'height'))>0);
      assert.ok(get(tag,'srcset'));assert.ok(get(tag,'sizes'));
      for (const variant of get(tag,'srcset').split(', ')) assert.ok(existsSync(join(dist,variant.split(' ')[0])));
      count++;
    }
  }
  assert.ok(count>40);
});
test('IFAP no longer downloads its full-resolution PNG gallery for display', () => {
  const text=readFileSync(join(dist,'programs/ifap/index.html'),'utf8');
  const tags=[...text.matchAll(/<img\b[^>]*>/g)].map(match=>match[0]);
  const bytes=tags.reduce((sum,tag)=>sum+statSync(join(dist,get(tag,'src'))).size,0);
  const original=['ifap.png',...Array.from({length:6},(_,i)=>`carousal/${i+1}.png`)].reduce((sum,path)=>sum+statSync(join(root,'programs/ifap',path)).size,0);
  assert.ok(bytes<original*0.1,`Image defaults grew beyond 10% of original payload: ${bytes}/${original}`);
  const hero=tags.find(tag=>tag.includes('IFAP Program Backdrop'));
  assert.equal(get(hero,'loading'),'eager');assert.equal(get(hero,'fetchpriority'),'high');
  for(const tag of tags.filter(tag=>tag.includes('IFAP Highlight'))) assert.equal(get(tag,'loading'),'lazy');
});
test('events feed uses generated variants while editable source data remains unchanged', () => {
  const source=JSON.parse(readFileSync(join(root,'data/events.json'),'utf8'));
  const built=JSON.parse(readFileSync(join(dist,'data/events.json'),'utf8'));
  assert.equal(source.length,built.length);
  for(const [i,event] of built.entries()) {
    assert.equal(event.title,source[i].title);assert.deepEqual(event.buttons,source[i].buttons);
    assert.match(event.image,/^\/assets\/images\/.+\.webp$/);assert.ok(existsSync(join(dist,event.image)));
    assert.ok(event.imageSrcset && event.imageWidth && event.imageHeight);
    assert.ok(!source[i].image.startsWith('/assets/'));
  }
});
