const { chromium, devices } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    viewport: { width: 375, height: 812 },
  });
  
  const page = await context.newPage();
  page.on('pageerror', err => console.log('ERR:', err.message.substring(0, 150)));
  
  // Load game
  await page.goto('http://localhost:3000/game', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(8000);
  
  // 1. Dashboard
  await page.screenshot({ path: '/tmp/ss-01-dashboard.png', fullPage: true });
  console.log('1. Dashboard captured');
  
  // Find tab bar and click through divisions
  // Look for the tab bar buttons
  const tabs = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, [role=tablist] button, .tab-bar button'));
    return btns.map((b, i) => ({ i, text: b.textContent.trim(), ariaLabel: b.getAttribute('aria-label') }));
  });
  console.log('Tabs found:', JSON.stringify(tabs));
  
  // 2. Energy division - click the energy tab
  const energyTab = tabs.find(t => t.text.includes('Energy') || t.text.includes('⚡'));
  if (energyTab) {
    await page.evaluate(idx => {
      const btns = Array.from(document.querySelectorAll('nav button, [role=tablist] button, .tab-bar button'));
      btns[idx].click();
    }, energyTab.i);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/ss-02-energy.png', fullPage: true });
    console.log('2. Energy captured');
  }
  
  // 3. More menu - look for "more" or "..." button
  const moreTab = tabs.find(t => t.text.includes('More') || t.text.includes('⋯') || t.text.includes('...') || (t.ariaLabel && t.ariaLabel.includes('more')));
  if (moreTab) {
    await page.evaluate(idx => {
      const btns = Array.from(document.querySelectorAll('nav button, [role=tablist] button, .tab-bar button'));
      btns[idx].click();
    }, moreTab.i);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/tmp/ss-03-more.png', fullPage: true });
    console.log('3. More menu captured');
  }
  
  // Navigate using JS store if available
  async function navigateTab(tabName) {
    await page.evaluate(name => {
      // Try to use the navigation store directly
      if (window.__activeTab) window.__activeTab.set(name);
      // Or dispatch a custom event
      document.dispatchEvent(new CustomEvent('navigate-tab', { detail: name }));
    }, tabName);
    await page.waitForTimeout(500);
  }
  
  // Try clicking specific tabs by text content
  async function clickTabByText(searchText) {
    const clicked = await page.evaluate(text => {
      const allBtns = Array.from(document.querySelectorAll('button'));
      const btn = allBtns.find(b => b.textContent.includes(text));
      if (btn) { btn.click(); return true; }
      return false;
    }, searchText);
    if (clicked) await page.waitForTimeout(1000);
    return clicked;
  }
  
  // 4. Settings
  if (await clickTabByText('Settings')) {
    await page.screenshot({ path: '/tmp/ss-04-settings.png', fullPage: true });
    console.log('4. Settings captured');
  }
  
  // 5. Achievements
  if (await clickTabByText('Achievements')) {
    await page.screenshot({ path: '/tmp/ss-05-achievements.png', fullPage: true });
    console.log('5. Achievements captured');
  }
  
  // 6. Research
  if (await clickTabByText('Research')) {
    await page.screenshot({ path: '/tmp/ss-06-research.png', fullPage: true });
    console.log('6. Research captured');
  }
  
  // 7. Treasury
  if (await clickTabByText('Treasury')) {
    await page.screenshot({ path: '/tmp/ss-07-treasury.png', fullPage: true });
    console.log('7. Treasury captured');
  }
  
  await page.close();
  await browser.close();
})();
