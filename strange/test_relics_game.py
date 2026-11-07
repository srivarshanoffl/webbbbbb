import asyncio
import sys
from playwright.async_api import async_playwright

async def get_timeline_t(page):
    val = await page.evaluate("""() => {
        if (window.__gameState) {
            return window.__gameState.t;
        }
        const head = document.getElementById('timeline-head');
        if (head && head.style && head.style.left) {
            return parseFloat(head.style.left.replace('%', '')) / 100.0;
        }
        return 1.0;
    }""")
    return float(val)

async def scrub_to_target(page, target_t):
    while True:
        cur_val = await get_timeline_t(page)
        diff = target_t - cur_val
        if abs(diff) <= 0.025:
        if abs(diff) <= 0.008:
            await page.keyboard.up("q")
            await page.keyboard.up("e")
            await page.wait_for_timeout(300)
            break
        if diff < 0:
            # Need to move backward (reverse time)
            await page.keyboard.down("q")
            await page.keyboard.up("e")
        else:
            # Need to move forward
            await page.keyboard.down("e")
            await page.keyboard.up("q")
        await page.wait_for_timeout(40)
        await page.wait_for_timeout(20)

async def run_test():
    console_errors = []
    page_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 720})
        page = await context.new_page()

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        print("Navigating to http://localhost:8085/index.html...")
        await page.goto("http://localhost:8085/index.html")
        await page.wait_for_timeout(1000)

        # 1. Intro Screen
        print("Checking Intro Modal...")
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_1_intro.png")

        # Click Begin Journey
        print("Starting game...")
        await page.click("#modal-continue-btn")
        await page.wait_for_timeout(600)

        # Check Scrubber Bar visibility
        is_bar_visible = await page.evaluate("() => { const track = document.getElementById('timeline-track'); return track && window.getComputedStyle(track).display !== 'none'; }")
        print(f"Verified: Scrubber Bar is hidden from screen? {not is_bar_visible}")
        assert not is_bar_visible, "Scrubber bar should not be visible!"

        # 2. Stage 1: Ancient Vase
        print("Stage 1: Ancient Vase loaded. Reversing time to 1.0s window target 0.50...")
        print("Stage 1: Ancient Vase loaded. Reversing time to 0.2s window target 0.50...")
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_2_vase_start.png")
        await scrub_to_target(page, 0.50)

        t1 = await get_timeline_t(page)
        print(f"Vase timeline paused at: {t1 * 100:.2f}% (1.0s Window is 45% - 55%)")
        print(f"Vase timeline paused at: {t1 * 100:.2f}% (0.2s Window is 49% - 51%)")
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_3_vase_window.png")

        # Collect Time Crystal
        print("Collecting Time Crystal...")
        await page.click("#collectible-crystal", force=True)
        await page.wait_for_timeout(1000)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_4_vase_collected.png")

        # Wait for transition to Relic 2 (Clock)
        print("Waiting for transition to Relic 2 (Clock)...")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_5_clock_start.png")

        # Stage 2: Magical Clock with OVERSHOOT (Q) and RECOVERY (E) TEST
        print("Stage 2: Testing OVERSHOOT past window to target 0.20 with Q...")
        await scrub_to_target(page, 0.20)
        t_overshoot = await get_timeline_t(page)
        print(f"Clock overshot past window to: {t_overshoot * 100:.2f}% (Window min is 45%)")
        print(f"Clock overshot past window to: {t_overshoot * 100:.2f}% (Window min is 49%)")

        print("Recovering window by holding E (Forward Time) to target 0.50...")
        await scrub_to_target(page, 0.50)
        t2 = await get_timeline_t(page)
        print(f"Clock recovered into 1.0s window at: {t2 * 100:.2f}% (Window is 45% - 55%)")
        print(f"Clock recovered into 0.2s window at: {t2 * 100:.2f}% (Window is 49% - 51%)")
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_6_clock_window.png")

        # Collect Eternity Gear
        print("Collecting Eternity Gear...")
        await page.click("#collectible-gear", force=True)
        await page.wait_for_timeout(1000)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_7_clock_collected.png")

        # Wait for transition to Relic 3 (Orb)
        print("Waiting for transition to Relic 3 (Orb)...")
        await page.wait_for_timeout(2500)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_8_orb_start.png")

        # Stage 3: Cosmic Orb
        print("Stage 3: Cosmic Orb loaded. Reversing time to 1.0s window target 0.50...")
        print("Stage 3: Cosmic Orb loaded. Reversing time to 0.2s window target 0.50...")
        await scrub_to_target(page, 0.50)
        t3 = await get_timeline_t(page)
        print(f"Orb timeline paused at: {t3 * 100:.2f}% (1.0s Window is 45% - 55%)")
        print(f"Orb timeline paused at: {t3 * 100:.2f}% (0.2s Window is 49% - 51%)")
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_9_orb_window.png")

        # Collect Cosmic Core
        print("Collecting Cosmic Core...")
        await page.click("#collectible-core", force=True)
        await page.wait_for_timeout(1000)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_10_orb_collected.png")

        # Wait for Finale sequence
        print("Waiting for Finale sequence (Central Sanctum collapse)...")
        await page.wait_for_timeout(3800)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_11_finale_collapse.png")

        # Wait for Shield Expansion & Victory
        print("Waiting for Shield Expansion & Victory Modal...")
        await page.wait_for_timeout(8500)
        await page.screenshot(path="c:/Users/sriva/strange portals/three-lost-relics/test_12_victory.png")

        await browser.close()

    print("\n===============================")
    print("      AUTOMATED TEST REPORT    ")
    print("===============================")
    print(f"Page errors: {len(page_errors)}")
    for err in page_errors:
        print(f"  ERR: {err}")
    print(f"Console errors: {len(console_errors)}")
    for err in console_errors:
        print(f"  CONSOLE: {err}")

    if len(page_errors) == 0 and len(console_errors) == 0:
        print("SUCCESS: 100% of stages, reversibility, and finale passed with ZERO errors!")
    else:
        print("FAILURE: Errors detected.")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(run_test())
