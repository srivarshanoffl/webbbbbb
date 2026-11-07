import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        page.on("console", lambda m: print(f"[CONSOLE {m.type}] {m.text}"))
        page.on("pageerror", lambda e: print(f"[PAGE ERROR] {e}"))
        
        await page.goto("http://localhost:8085/index.html")
        await page.wait_for_timeout(500)
        await page.click("#modal-continue-btn")
        await page.wait_for_timeout(300)
        
        # Check initial t
        t = await page.evaluate("() => document.getElementById('timeline-head').style.left")
        print("Initial timeline head style.left:", t)
        
        # Press Q
        print("Holding Q...")
        await page.keyboard.down("q")
        for i in range(15):
            await page.wait_for_timeout(100)
            t = await page.evaluate("() => document.getElementById('timeline-head').style.left")
            print(f"t step {i}: {t}")
        await page.keyboard.up("q")
        await browser.close()

asyncio.run(main())

