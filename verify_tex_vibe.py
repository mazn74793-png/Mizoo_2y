import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})

        # Navigate to the app
        await page.goto('http://localhost:3000')
        await page.wait_for_timeout(2000) # Wait for animations

        # Screenshot Hero & Navbar
        await page.screenshot(path='hero_section.png')
        print("Captured hero_section.png")

        # Scroll to Catalog
        await page.evaluate("window.scrollTo(0, 1000)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path='product_catalog.png')
        print("Captured product_catalog.png")

        # Open Admin Dashboard
        await page.click('button:has-text("Admin Dashboard")')
        await page.wait_for_timeout(1000)
        await page.screenshot(path='admin_dashboard.png')
        print("Captured admin_dashboard.png")

        # Fill form
        await page.fill('input[placeholder="e.g. Imperial Silk Satin"]', 'Gold Lame')
        await page.fill('input[placeholder="e.g. 100% Mulberry Silk"]', 'Gold Metallic Thread')
        await page.fill('input[placeholder="45"]', '150')
        await page.fill('input[placeholder="1200"]', '2500')
        await page.fill('input[placeholder="500"]', '10')

        # Simulate upload click
        await page.click('text=Cloudinary Upload Zone')
        await page.wait_for_timeout(2000) # Wait for simulated upload

        await page.click('button:has-text("Publish to Catalog")')
        await page.wait_for_timeout(1000)

        # Scroll to see new product
        await page.evaluate("window.scrollTo(0, 2000)")
        await page.wait_for_timeout(1000)
        await page.screenshot(path='new_product_added.png')
        print("Captured new_product_added.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
