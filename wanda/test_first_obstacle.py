import asyncio
from playwright.async_api import async_playwright

async def run_obstacle_test():
    print("Launching Chromium for Obstacle Logic & Sanctum Ground Test...", flush=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        
        print("Navigating to http://127.0.0.1:8080/index.html ...", flush=True)
        await page.goto('http://127.0.0.1:8080/index.html')
        await page.wait_for_timeout(1000)
        
        # Check Sanctum Ground existence & styling
        ground_status = await page.evaluate('''() => {
            const ground = document.getElementById('sanctum-ground');
            const svg = ground ? ground.querySelector('.ground-seal-svg') : null;
            const runes = svg ? svg.querySelectorAll('.ground-runes-ring text') : [];
            const ripples = ground ? ground.querySelectorAll('.ground-energy-ripple') : [];
            return {
                groundExists: !!ground,
                svgExists: !!svg,
                runesCount: runes.length,
                ripplesCount: ripples.length
            };
        }''')
        print(f"Sanctum Ground Status: {ground_status}", flush=True)
        assert ground_status['groundExists'], "Sanctum ground element missing"
        assert ground_status['svgExists'], "Sanctum SVG seal missing"
        assert ground_status['runesCount'] == 16, f"Expected 16 runes, found {ground_status['runesCount']}"
        assert ground_status['ripplesCount'] == 3, f"Expected 3 energy ripples, found {ground_status['ripplesCount']}"
        
        # Switch to Phase 2: Crystal Alignment
        print("Switching to Phase 2...", flush=True)
        await page.evaluate('() => window.Game.setPhase(2)')
        await page.wait_for_timeout(600)
        
        # Verify initial ring state and harmonic meter
        initial_meter = await page.evaluate('''() => {
            const meterFill = document.getElementById('alignment-fill');
            const statusText = document.getElementById('alignment-status-text');
            const rings = window.Game.rings.map(r => ({ angle: r.angle, aligned: r.aligned }));
            return {
                meterWidth: meterFill ? meterFill.style.width : null,
                statusText: statusText ? statusText.textContent : null,
                rings: rings
            };
        }''')
        print(f"Initial Phase 2 State: {initial_meter}", flush=True)
        assert initial_meter['meterWidth'] is not None and initial_meter['meterWidth'] != '', "Meter fill width not set"
        assert 'Harmonic Sync:' in initial_meter['statusText'], "Status text not showing Harmonic Sync"
        
        # Test Sympathetic Celestial Coupling:
        # Rotating outer ring (ring 0) should rotate ring 1 in reverse direction if unaligned
        print("Testing Sympathetic Coupling (Outer -> Mid)...", flush=True)
        mid_before = initial_meter['rings'][1]['angle']
        await page.keyboard.press('ArrowRight')
        await page.wait_for_timeout(200)
        
        mid_after = await page.evaluate('() => window.Game.rings[1].angle')
        print(f"Mid Ring Angle before: {mid_before}, after Outer rotation: {mid_after}", flush=True)
        assert mid_before != mid_after, "Sympathetic coupling failed: Mid ring did not drift when Outer rotated!"
        
        # Test Direct Ring Selection with Number Keys '1', '2', '3'
        print("Testing Number Key Ring Switching...", flush=True)
        await page.keyboard.press('Digit2')
        await page.wait_for_timeout(200)
        active_idx = await page.evaluate('() => window.Game.activeRingIndex')
        print(f"Active Ring Index after pressing '2': {active_idx}", flush=True)
        assert active_idx == 1, f"Expected active ring 1, got {active_idx}"
        
        # Rotate Mid ring to test Mid -> Inner coupling
        inner_before = await page.evaluate('() => window.Game.rings[2].angle')
        await page.keyboard.press('ArrowLeft')
        await page.wait_for_timeout(200)
        inner_after = await page.evaluate('() => window.Game.rings[2].angle')
        print(f"Inner Ring Angle before: {inner_before}, after Mid rotation: {inner_after}", flush=True)
        assert inner_before != inner_after, "Sympathetic coupling failed: Inner ring did not drift when Mid rotated!"
        
        # Align all rings one by one:
        # 1. Align Outer ring
        print("Aligning Outer Ring (1)...", flush=True)
        await page.keyboard.press('Digit1')
        await page.wait_for_timeout(100)
        # Rotate until aligned
        for _ in range(35):
            is_aligned = await page.evaluate('() => window.Game.rings[0].aligned')
            if is_aligned:
                break
            await page.keyboard.press('ArrowRight')
            await page.wait_for_timeout(50)
            
        outer_aligned = await page.evaluate('() => window.Game.rings[0].aligned')
        print(f"Outer Ring Aligned: {outer_aligned}", flush=True)
        assert outer_aligned, "Outer ring did not lock at Zenith!"
        
        # 2. Align Mid ring
        print("Aligning Mid Ring (2)...", flush=True)
        await page.keyboard.press('Digit2')
        await page.wait_for_timeout(100)
        for _ in range(35):
            is_aligned = await page.evaluate('() => window.Game.rings[1].aligned')
            if is_aligned:
                break
            await page.keyboard.press('ArrowRight')
            await page.wait_for_timeout(50)
            
        mid_aligned = await page.evaluate('() => window.Game.rings[1].aligned')
        print(f"Mid Ring Aligned: {mid_aligned}", flush=True)
        assert mid_aligned, "Mid ring did not lock at Zenith!"
        
        # 3. Align Inner ring
        print("Aligning Inner Ring (3)...", flush=True)
        await page.keyboard.press('Digit3')
        await page.wait_for_timeout(100)
        for _ in range(35):
            is_aligned = await page.evaluate('() => window.Game.rings[2].aligned')
            if is_aligned:
                break
            await page.keyboard.press('ArrowRight')
            await page.wait_for_timeout(50)
            
        inner_aligned = await page.evaluate('() => window.Game.rings[2].aligned')
        print(f"Inner Ring Aligned: {inner_aligned}", flush=True)
        assert inner_aligned, "Inner ring did not lock at Zenith!"
        
        # Verify 100% Harmonic Convergence & completion
        final_state = await page.evaluate('''() => {
            const statusText = document.getElementById('alignment-status-text');
            const fill = document.getElementById('alignment-fill');
            const allAligned = window.Game.areAllRingsAligned();
            return {
                statusText: statusText ? statusText.textContent : '',
                fillWidth: fill ? fill.style.width : '',
                allAligned: allAligned
            };
        }''')
        print(f"Final Convergence State: {final_state}", flush=True)
        assert final_state['allAligned'], "Not all rings reported aligned!"
        assert '100%' in final_state['statusText'] or final_state['fillWidth'] == '100%', "Convergence bar didn't reach 100%"
        
        # Take screenshot of aligned state and ground
        await page.screenshot(path='assets/phase2_crystal_aligned_success.png')
        print("Screenshot of aligned state saved to assets/phase2_crystal_aligned_success.png", flush=True)
        
        # Verify no console errors occurred
        print(f"Console errors: {len(errors)}", flush=True)
        if errors:
            print(f"Errors list: {errors}", flush=True)
        assert len(errors) == 0, f"Found console errors: {errors}"
        
        await browser.close()
        print("ALL TESTS PASSED SUCCESSFULLY!", flush=True)
        return True

if __name__ == '__main__':
    asyncio.run(run_obstacle_test())

