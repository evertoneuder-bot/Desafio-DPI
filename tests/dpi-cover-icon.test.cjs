const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
test('cover favicon uses the existing brand asset and resolves locally',()=>{
 const root=path.resolve(__dirname,'..');
 const html=fs.readFileSync(path.join(root,'dpi-home.html'),'utf8');
 const icon=html.match(/<link rel="icon" href="([^"]+)" type="([^"]+)"/);
 assert.ok(icon);
 assert.ok(fs.existsSync(path.resolve(root,icon[1])),'favicon file must exist');
 const brand=html.match(/<a class="dpi-brand"[\s\S]*?<img src="([^"]+)"/);
 assert.equal(icon[1],brand[1],'reuse the brand already displayed on the cover');
 assert.equal(icon[2],'image/svg+xml');
});
