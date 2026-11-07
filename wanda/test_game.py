import asyncio
from playwright.async_api import async_playwright

async def test_game():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        
        errors = []
        page.on('pageerror', lambda err: errors.append(str(err)))
        page.on('console', lambda msg: errors.append(msg.text) if msg.type == 'error' else None)
        
        await page.goto('http://localhost:8000/index.html')
        await page.wait_for_timeout(1200)
        
        # 1. Check Wanda cutout integrity
        img_info = await page.evaluate('''() => {
            const img = document.querySelector('.wanda-cinematic-img');
            return {
                exists: !!img,
                complete: img ? img.complete : false,
                naturalWidth: img ? img.naturalWidth : 0,
                naturalHeight: img ? img.naturalHeight : 0,
                currentSrc: img ? img.currentSrc : ''
            };
        }''')
        print(f"Phase 1 - Wanda cutout status: {img_info}")
        await page.screenshot(path='assets/phase1_epic_sanctum.png')
        print("Captured screenshot: assets/phase1_epic_sanctum.png")
        
        # 2. Phase 2: Relic 1 Celestial Crystal Alignment
        await page.click('.tracker-node[data-phase="2"]')
        await page.wait_for_timeout(1200)
        await page.screenshot(path='assets/phase2_crystal_alignment.png')
        print("Captured screenshot: assets/phase2_crystal_alignment.png")

        # 3. Phase 3: Relic 2 Armillary Gyroscope of Chaos
        await page.click('.tracker-node[data-phase="3"]')
        await page.wait_for_timeout(1200)
        await page.screenshot(path='assets/phase3_gyro_stabilization.png')
        print("Captured screenshot: assets/phase3_gyro_stabilization.png")
        
        # 4. Phase 4: Relic 3 Darkhold Glitch & Anomaly Modal
        await page.click('.tracker-node[data-phase="4"]')
        await page.wait_for_timeout(1800)
        modal_visible = await page.is_visible('#error-modal')
        print(f"Phase 4 modal visible: {modal_visible}")
        await page.screenshot(path='assets/phase4_glitch_modal.png')
        print("Captured screenshot: assets/phase4_glitch_modal.png")
        
        if modal_visible:
            await page.click('#bypass-btn')
            await page.wait_for_timeout(900)
            modal_closed = not (await page.is_visible('#error-modal'))
            print(f"Bypass button dismissed modal: {modal_closed}")
            
        # 5. Phase 5: Grand Portal Awakening (Accretion & Continuous Lightning)
        await page.click('.tracker-node[data-phase="5"]')
        await page.wait_for_timeout(1500)
        portal_active = await page.evaluate('() => document.getElementById("portal-container").classList.contains("portal-active")')
        particle_count = await page.evaluate('() => window.ParticleSystem ? window.ParticleSystem.portalParticles.length : 0')
        print(f"Phase 5 portal activated: {portal_active}, particle count: {particle_count}")
        await page.screenshot(path='assets/phase5_grand_portal.png')
        print("Captured screenshot: assets/phase5_grand_portal.png")

        # 6. Phase 6: Portal Ascension & Ending Screen
        ending_visible = await page.is_visible('#ending-screen')
        if not ending_visible:
            # Trigger phase 6 transition safely
            await page.evaluate('() => window.Game.setPhase(6)')
            await page.wait_for_timeout(3600)
            ending_visible = await page.is_visible('#ending-screen')
            
        print(f"Phase 6 ending screen visible: {ending_visible}")
        await page.screenshot(path='assets/phase6_ending_screen.png')
        print("Captured screenshot: assets/phase6_ending_screen.png")
        
        print(f"Total Console Errors: {len(errors)}")
        if errors:
            print("Errors logged:", errors)
            
        await browser.close()
        return len(errors) == 0 and modal_visible and portal_active and ending_visible

if __name__ == '__main__':
    success = asyncio.run(test_game())
    if not success:
        exit(1)

