const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.QA_URL||'http://127.0.0.1:3010/dashboard/';
(async()=>{
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1440,height:1000}});page.setDefaultTimeout(12000);
async function open(name,settings){await page.goto(base);await page.evaluate(s=>{localStorage.clear();if(s)localStorage.setItem('chess-by-sparsh-settings',JSON.stringify(s))},settings);await page.reload();await page.getByRole('button',{name:'Start the game: '+name,exact:true}).click()}
async function typed(id,text){await page.locator(id).fill(text);await page.getByRole('button',{name:'Run command',exact:true}).click();await page.waitForTimeout(40)}
for(const difficulty of ['beginner','casual','club','expert','nightmare']){
 await open('Chess',{playerColor:'b',difficulty});await page.getByRole('grid').waitFor();await page.waitForFunction(()=>document.querySelectorAll('.move-list li').length===1);assert.match(await page.getByRole('grid').getAttribute('aria-label'),/Black at bottom/);
 const result=await page.evaluate(async()=>{const{Chess}=await import('/node_modules/.vite/deps/chess__js.js');const saved=JSON.parse(localStorage.getItem('chess-by-sparsh-save'));const g=new Chess(saved.fen);return g.moves({verbose:true})[0]});
 if(!await page.locator('#typed-command').isVisible())await page.getByRole('button',{name:'Type a command',exact:true}).click();await page.locator('#typed-command').fill(result.from+' to '+result.to);await page.getByRole('button',{name:'Send command',exact:true}).click();await page.waitForFunction(()=>document.querySelectorAll('.move-list li').length===3);console.log('PASS Chess black-side moves and replies at',difficulty);
}
await open('Tic-Tac-Toe');
await page.getByRole('grid',{name:'Tic-Tac-Toe board',exact:true}).waitFor();
for(let step=0;step<9;step++){
 if(await page.locator('.tic-tac-toe-result').count())break;
 const empty=page.locator('.tic-tac-toe-cell:not(.cell-x):not(.cell-o)').first();if(!await empty.count())break;
 await empty.click();await page.waitForFunction(()=>document.querySelector('.tic-tac-toe-result')||document.querySelector('.tic-tac-toe-turn')?.textContent.includes('Your turn'));
}
await page.locator('.tic-tac-toe-result').waitFor();assert.match(await page.locator('.tic-tac-toe-score').innerText(),/1/);await page.getByRole('button',{name:'Play another round'}).click();assert.equal(await page.locator('.cell-x,.cell-o').count(),0);console.log('PASS Tic-Tac-Toe completed round, score, and replay');
await open('The Intercept');
await page.locator('.intercept-passage').waitFor();
let decisions=0;while(!await page.locator('.story-ended').count()&&decisions++<150){await page.locator('.intercept-choice').first().click();}
assert.ok(await page.locator('.story-ended').count());await page.getByRole('button',{name:'New story',exact:true}).click();assert.ok(await page.locator('.intercept-choice').count());console.log('PASS Intercept completed ending and replay',decisions,'choices');
await open('Loups-Garous');await page.getByRole('button',{name:/Try a quick test/}).click();await page.getByRole('button',{name:'I’m ready',exact:true}).click();
await page.getByRole('button',{name:'Type a command',exact:true}).first().click();
async function ww(text){await page.locator('#typed-command').fill(text);await page.getByRole('button',{name:'Send command',exact:true}).click();await page.waitForTimeout(150)}
await ww('investigate Emma');await page.waitForTimeout(300);console.log('LOUPS_AFTER_INVESTIGATION',(await page.locator('body').innerText()).slice(0,3000));
await ww('continue');await ww('begin vote');await page.waitForTimeout(300);console.log('LOUPS_VOTE',(await page.locator('body').innerText()).slice(0,3000));
await ww('vote Emma');await page.waitForTimeout(300);console.log('LOUPS_AFTER_VOTE',(await page.locator('body').innerText()).slice(0,3000));
await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
