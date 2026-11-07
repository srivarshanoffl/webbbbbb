const puppeteer = require('../../spiderman/node_modules/puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
    console.log('--- STARTING DEVTOOLS CHROME TEST FOR CIVIL WAR CSS BUG ---');
    const browser = await puppeteer.launch({
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    const logs = [];
    page.on('console', msg => {
        const text = msg.text();
        logs.push(text);
        console.log('  [BROWSER CONSOLE]:', text);
    });

    const fileUrl = 'file://' + path.resolve(__dirname, '../civilwar.html').replace(/\\/g, '/');
    console.log('Navigating to:', fileUrl);
    await page.goto(fileUrl, { waitUntil: 'load' });

    // Step 1: Verify initial buggy CSS state
    console.log('\n[1/5] Verifying initial bug in #bug-css...');
    const bugCssContent = await page.evaluate(() => document.getElementById('bug-css').textContent);
    console.log('Current #bug-css content:\n', bugCssContent.trim());
    if (!bugCssContent.includes('animation: shieldImpact')) {
        throw new Error('Expected initial bug "animation: shieldImpact" was not found in #bug-css');
    }
    console.log('✓ Initial CSS bug verified.');

    // Step 2: Start game
    console.log('\n[2/5] Starting game cinematic...');
    await page.click('#start-btn');
    await new Promise(r => setTimeout(r, 600));

    // Step 3: Trigger Debug Pause and check Diagnostic Window
    console.log('\n[3/5] Entering DEBUG_PAUSE state...');
    await page.evaluate(() => {
        window.enterDebugPause();
    });

    await new Promise(r => setTimeout(r, 600));

    const overlayInfo = await page.evaluate(() => {
        const ov = document.getElementById('debug-overlay');
        const st = document.getElementById('debug-status');
        return {
            isVisible: ov.classList.contains('on'),
            headText: ov.querySelector('.d-head')?.textContent,
            instructionText: ov.querySelector('.d-instruction')?.textContent,
            statusText: st?.textContent?.trim(),
            hasBypassBtn: !!document.getElementById('bypass-btn'),
            phase: window.S.phase
        };
    });

    console.log('Diagnostic Window Status:', overlayInfo);
    if (!overlayInfo.isVisible) throw new Error('Diagnostic window did not become visible');
    if (!overlayInfo.instructionText.includes('DEVTOOLS REPAIR PROCEDURE')) {
        throw new Error('Diagnostic window missing DevTools repair procedure instructions');
    }
    console.log('✓ Diagnostic window and instructions verified.');

    // Save screenshot of the diagnostic process window
    const screenshotPath = path.resolve(__dirname, 'diagnostic_window.png');
    await page.screenshot({ path: screenshotPath });
    console.log('Saved screenshot of diagnostic window to:', screenshotPath);

    // Step 4: Execute CSS repair via DevTools Console
    console.log('\n[4/5] Executing CSS fix via DevTools Console evaluate...');
    await page.evaluate(() => {
        document.getElementById('bug-css').textContent = '.shield-impact { animation: shield-impact 800ms ease-out forwards; }';
    });

    // Wait for polling engine to detect the fix
    await new Promise(r => setTimeout(r, 600));

    const fixResult = await page.evaluate(() => {
        return {
            debugResolved: window.S.debugResolved,
            resolvedBy: window.S.resolvedBy,
            statusText: document.getElementById('debug-status')?.textContent?.trim()
        };
    });

    console.log('Fix detection result:', fixResult);
    if (!fixResult.debugResolved) {
        throw new Error('CSS bug fix was not detected by engine!');
    }
    console.log('✓ Engine successfully detected live CSS repair from Console.');

    // Step 5: Wait for revival and complete sequence
    console.log('\n[5/5] Awaiting revival and complete card...');
    let completeReached = false;
    for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 500));
        const currentPhase = await page.evaluate(() => window.S.phase);
        if (currentPhase === 'COMPLETE') {
            completeReached = true;
            break;
        }
    }

    const finalResult = await page.evaluate(() => {
        const shieldEl = document.getElementById('shield');
        const capEl = document.getElementById('cap');
        const capRefl = document.getElementById('cap-refl');
        return {
            phase: window.S.phase,
            resultText: document.getElementById('st-result')?.textContent,
            completeVisible: document.getElementById('complete')?.classList?.contains('on'),
            shieldGrounded: shieldEl.classList.contains('grounded'),
            capVanished: capEl.classList.contains('vanished'),
            capOpacity: window.getComputedStyle(capEl).opacity,
            capReflVanished: capRefl?.classList.contains('vanished')
        };
    });
    console.log('Final completion state & aftermath check:', finalResult);

    if (finalResult.phase !== 'COMPLETE' && finalResult.phase !== 'REVIVED') {
        throw new Error('Game did not complete after revival');
    }
    if (!finalResult.shieldGrounded) {
        throw new Error('Shield did not receive the "grounded" class!');
    }
    if (!finalResult.capVanished) {
        throw new Error('Captain America did not receive the "vanished" class!');
    }
    if (parseFloat(finalResult.capOpacity) > 0.1) {
        throw new Error(`Captain America opacity expected 0, but got ${finalResult.capOpacity}`);
    }
    console.log('✓ Shield is grounded on floor and Captain America has vanished into shadows!');

    // Capture screenshot of the aftermath scene with grounded shield and vanished Cap
    const aftermathScreenshotPath = path.resolve(__dirname, 'shield_grounded_cap_vanished.png');
    await page.screenshot({ path: aftermathScreenshotPath });
    console.log('Saved aftermath screenshot to:', aftermathScreenshotPath);

    // Step 6: Test Reset
    console.log('\n[6/6] Testing resetAll() to ensure full replayability...');
    await page.evaluate(() => {
        document.getElementById('restart-btn').click();
    });
    await new Promise(r => setTimeout(r, 600));
    const resetState = await page.evaluate(() => {
        const shieldEl = document.getElementById('shield');
        const capEl = document.getElementById('cap');
        return {
            phase: window.S.phase,
            shieldGrounded: shieldEl.classList.contains('grounded'),
            capVanished: capEl.classList.contains('vanished')
        };
    });
    console.log('State after resetAll:', resetState);
    if (resetState.shieldGrounded || resetState.capVanished) {
        throw new Error('Reset failed to restore shield or Cap state!');
    }
    console.log('✓ Reset cleanly restored Cap and Shield.');

    await browser.close();
    console.log('\n========================================');
    console.log('ALL CHROME DEVTOOLS VERIFICATION CHECKS PASSED!');
    console.log('========================================\n');
})().catch(err => {
    console.error('\n❌ VERIFICATION TEST FAILED:', err);
    process.exit(1);
});
