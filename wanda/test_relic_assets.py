import asyncio
from playwright.async_api import async_playwright

async def run_test():
    print("Launching Chromium...", flush=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        
        print("Navigating to http://127.0.0.1:8080/index.html ...", flush=True)
        await page.goto('http://127.0.0.1:8080/index.html')
        await page.wait_for_timeout(1000)
        
        # Verify all assets loaded properly
        assets_status = await page.evaluate('''() => {
            const wanda = document.querySelector('.wanda-cinematic-img');
            const crystal = document.querySelector('.crystal-asset-img');
            const gyro = document.querySelector('.gyro-asset-img');
            const darkhold = document.querySelector('.darkhold-asset-img');
            const portal = document.querySelector('.portal-asset-img');
            
            return {
                wanda: { ok: wanda && wanda.complete && wanda.naturalWidth > 0, width: wanda ? wanda.naturalWidth : 0 },
                crystal: { ok: crystal && crystal.complete && crystal.naturalWidth > 0, width: crystal ? crystal.naturalWidth : 0 },
                gyro: { ok: gyro && gyro.complete && gyro.naturalWidth > 0, width: gyro ? gyro.naturalWidth : 0 },
                darkhold: { ok: darkhold && darkhold.complete && darkhold.naturalWidth > 0, width: darkhold ? darkhold.naturalWidth : 0 },
                portal: { ok: portal && portal.complete && portal.naturalWidth > 0, width: portal ? portal.naturalWidth : 0 }
            };
        }''')
        print(f"Asset loading status: {assets_status}", flush=True)
        
        # Phase 1: Meditation
        await page.screenshot(path='assets/phase1_epic_sanctum.png')
        print("Phase 1 screenshot saved.", flush=True)
        
        # Phase 2: Crystal Alignment
        await page.evaluate('() => window.Game.setPhase(2)')
        await page.wait_for_timeout(800)
        await page.screenshot(path='assets/phase2_crystal_alignment.png')
        print("Phase 2 screenshot saved.", flush=True)
        
        # Phase 3: Gyroscope Stabilization
        await page.evaluate('() => window.Game.setPhase(3)')
        await page.wait_for_timeout(800)
        await page.screenshot(path='assets/phase3_gyro_stabilization.png')
        print("Phase 3 screenshot saved.", flush=True)
        
        # Phase 4: Darkhold Glitch & Anomaly Modal
        await page.evaluate('() => window.Game.setPhase(4)')
        await page.wait_for_timeout(1500)
        modal_visible = await page.is_visible('#error-modal')
        print(f"Phase 4 modal visible: {modal_visible}", flush=True)
        await page.screenshot(path='assets/phase4_glitch_modal.png')
        print("Phase 4 screenshot saved.", flush=True)
        
        # Click bypass button
        if modal_visible:
            await page.click('#bypass-btn')
            await page.wait_for_timeout(500)
            print("Bypass button clicked.", flush=True)
            
        # Phase 5: Grand Portal Awakening
        await page.evaluate('() => window.Game.setPhase(5)')
        await page.wait_for_timeout(1200)
        portal_active = await page.evaluate('() => document.getElementById("portal-container").classList.contains("portal-active")')
        print(f"Phase 5 portal active: {portal_active}", flush=True)
        await page.screenshot(path='assets/phase5_grand_portal.png')
        print("Phase 5 screenshot saved.", flush=True)
        
        # Phase 6: Transcendent Ascension
        await page.evaluate('() => window.Game.setPhase(6)')
        await page.wait_for_timeout(4000)
        ending_visible = await page.is_visible('#ending-screen')
        print(f"Phase 6 ending screen visible: {ending_visible}", flush=True)
        await page.screenshot(path='assets/phase6_ending_screen.png')
        print("Phase 6 screenshot saved.", flush=True)
        
        print(f"Total Console Errors: {len(errors)}", flush=True)
        if errors:
            print(f"Errors: {errors}", flush=True)
            
        await browser.close()
        all_assets_ok = all(v['ok'] for v in assets_status.values())
        print(f"ALL ASSETS LOADED: {all_assets_ok}", flush=True)
        return len(errors) == 0 and all_assets_ok and modal_visible and portal_active and ending_visible

if __name__ == '__main__':
    success = asyncio.run(run_test())
    if not success:
        exit(1)
    print("SUCCESS: ALL CHECKS PASSED!", flush=True)
