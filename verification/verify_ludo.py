from playwright.sync_api import sync_playwright

def verify_ludo(page):
    # Navigate to the local server (Vite default is usually 5173)
    page.goto("http://localhost:5173")

    # Wait for canvas to be present
    page.wait_for_selector("#ludoCanvas")

    # Wait a bit for assets to load and render
    page.wait_for_timeout(2000)

    # Take a screenshot of the initial state
    page.screenshot(path="verification/ludo_initial.png")

    # Click the red dice (approximate position based on code: x=50, y=0)
    # The canvas is centered, so we need to calculate click position relative to viewport or canvas.
    # Canvas is 50% left/top translated -50%.
    # Let's just click the center-ish left where red dice is.
    # Red dice is at x=50, y=0 relative to canvas.
    # Canvas size: we need to know canvas size.
    # Looking at main.ts/initCanvas, it doesn't set width/height explicitly?
    # Default canvas size is 300x150.
    # board.ts RedPiece uses context.canvas.height.
    # main.ts: context.fillRect(0,0,width,height).
    # Wait, main.ts doesn't set canvas size. The HTML file must set it.

    # Let's inspect the page to get canvas bounding box
    box = page.locator("#ludoCanvas").bounding_box()
    if box:
        print(f"Canvas box: {box}")
        # Red Dice is at 50, 0 relative to canvas.
        # Click Red Dice
        page.mouse.click(box['x'] + 50 + 25, box['y'] + 25)

        # Wait for roll animation (2000ms)
        page.wait_for_timeout(2500)

        # Take screenshot after roll
        page.screenshot(path="verification/ludo_after_roll.png")

        # Click again if 6? Or just verify the console logs if possible (harder in screenshot)
        # We can just show the state.

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ludo(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
