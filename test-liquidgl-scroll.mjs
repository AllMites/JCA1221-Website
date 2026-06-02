// Quick manual verification script for liquidGL scroll sync
// Not a test — captures evidence via screenshots
import { chromium } from 'playwright';

const BROWSER = await chromium.launch({ headless: true });
const PAGE = await BROWSER.newPage({ viewport: { width: 1440, height: 900 } });

// Navigate to homepage
await PAGE.goto('http://localhost:5173', { waitUntil: 'networkidle' });
await PAGE.waitForTimeout(2000); // let liquidGL finish init + reveal animation

// Check console for errors
const errors = [];
PAGE.on('console', msg => {
  if (msg.type() === 'error') errors.push(msg.text());
});

// Check if liquidGL renderer initialized
const hasRenderer = await PAGE.evaluate(() => !!window.__liquidGLRenderer__);
console.log(`liquidGL renderer initialized: ${hasRenderer}`);

const lensCount = await PAGE.evaluate(() => window.__liquidGLRenderer__?.lenses?.length ?? 0);
console.log(`Active lenses: ${lensCount}`);

// Check if scroll sync hook is attached
const syncActive = await PAGE.evaluate(() => {
  // probe: our internal variable from LiquidGlass.tsx
  return typeof window.__liquidGLRenderer__ !== 'undefined';
});
console.log(`Renderer available for scroll sync: ${syncActive}`);

// Check canvas transform state before scroll
const preTransform = await PAGE.evaluate(() => {
  const c = window.__liquidGLRenderer__?.canvas;
  return c ? c.style.transform : 'NO CANVAS';
});
console.log(`Pre-scroll canvas transform: "${preTransform}"`);

// Screenshot 1: initial state
await PAGE.screenshot({ path: 'verify-01-before-scroll.png', fullPage: false });
console.log('Screenshot 1 saved: verify-01-before-scroll.png');

// Scroll down 500px (simulates user scrolling)
await PAGE.evaluate(() => window.scrollBy(0, 500));
// Wait one rAF cycle so scroll event fires + our transform applies
await PAGE.waitForTimeout(50);

// Check canvas transform immediately after scroll (should have compensation)
const duringTransform = await PAGE.evaluate(() => {
  const r = window.__liquidGLRenderer__;
  const canvas = r?.canvas;
  return {
    transform: canvas?.style.transform || '',
    transition: canvas?.style.transition || '',
    scrollY: window.scrollY,
  };
});
console.log(`During-scroll canvas transform: "${duringTransform.transform}"`);
console.log(`During-scroll canvas transition: "${duringTransform.transition}"`);
console.log(`Window scrollY: ${duringTransform.scrollY}`);

// Screenshot 2: mid-scroll (should show glass at correct position)
await PAGE.screenshot({ path: 'verify-02-during-scroll.png', fullPage: false });
console.log('Screenshot 2 saved: verify-02-during-scroll.png');

// Wait for rAF to complete the render + transition cleanup
await PAGE.waitForTimeout(500);

// Check canvas state after render completes
const postTransform = await PAGE.evaluate(() => {
  const r = window.__liquidGLRenderer__;
  const canvas = r?.canvas;
  return {
    transform: canvas?.style.transform || '',
    transition: canvas?.style.transition || '',
  };
});
console.log(`Post-render canvas transform: "${postTransform.transform}"`);
console.log(`Post-render canvas transition: "${postTransform.transition}"`);

// Screenshot 3: after render settled
await PAGE.screenshot({ path: 'verify-03-after-render.png', fullPage: false });
console.log('Screenshot 3 saved: verify-03-after-render.png');

// Rapid scroll test — simulate fast scrolling
await PAGE.evaluate(async () => {
  for (let i = 0; i < 5; i++) {
    window.scrollBy(0, 300);
    await new Promise(r => requestAnimationFrame(r));
  }
});
await PAGE.waitForTimeout(400);

// Screenshot 4: after rapid scroll
await PAGE.screenshot({ path: 'verify-04-rapid-scroll.png', fullPage: false });
console.log('Screenshot 4 saved: verify-04-rapid-scroll.png');

// Check for any errors during the process
if (errors.length > 0) {
  console.log(`\n⚠️ Console errors (${errors.length}):`);
  errors.forEach(e => console.log(`  - ${e}`));
} else {
  console.log('\n✅ No console errors');
}

// Verify lens rects make sense
const lensRects = await PAGE.evaluate(() => {
  const r = window.__liquidGLRenderer__;
  if (!r) return [];
  return r.lenses.map(l => ({
    rect: l.rectPx,
    visible: l.rectPx ? l.rectPx.top > -1000 && l.rectPx.top < 10000 : false,
  }));
});
lensRects.forEach((lr, i) => {
  const status = lr.visible ? 'visible' : 'OFF_SCREEN';
  console.log(`Lens ${i}: top=${lr.rect?.top?.toFixed(0)}, left=${lr.rect?.left?.toFixed(0)}, w=${lr.rect?.width?.toFixed(0)}x${lr.rect?.height?.toFixed(0)} [${status}]`);
});

console.log('\nDone. Check screenshots:');
console.log('  verify-01-before-scroll.png (viewport at top)');
console.log('  verify-02-during-scroll.png (captured ~50ms after scrollBy)');
console.log('  verify-03-after-render.png (after rAF render + transition cleanup)');
console.log('  verify-04-rapid-scroll.png (after 5x rapid 300px scrolls)');

await BROWSER.close();
process.exit(0);
