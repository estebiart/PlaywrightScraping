const { chromium } = require('playwright');

async function processUrls(urls) {
  let browser, context;

  try {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext({
      recordVideo: {
        dir: './videos',
        size: { width: 3840, height: 2160 }, 
        fps: 60 
      }
    });

    for (const url of urls) {
      let page;
      try {
        page = await context.newPage();
        await page.setViewportSize({ width: 1920, height: 1080 }); 

        await page.goto(url);
        await page.waitForSelector('.preloader', { state: 'hidden' });
        await page.waitForTimeout(2000);

        await page.evaluate(() => {
          let scrollPosition = 0;
          const scrollIncrement = 1000; 
          const pauseDuration = 250; 

          async function scrollAndExtractText() {
            while (scrollPosition < document.body.scrollHeight) {
              requestAnimationFrame(() => {
                window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
              });
              scrollPosition += scrollIncrement;

              await new Promise(resolve => setTimeout(resolve, pauseDuration));

              const textNodes = document.querySelectorAll('h1, h2, p');

              for (const node of textNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                  console.log(node.textContent.trim());
                  await new Promise(resolve => setTimeout(resolve, pauseDuration));
                }
              }
            }
          }

          scrollAndExtractText();
        });

        await new Promise(resolve => setTimeout(resolve, 8000));
      } catch (error) {
        console.error(`Error processing ${url}:`, error);
      } finally {
        if (page) {
          await page.close();
        }
      }
    }
  } catch (error) {
    console.error('General error:', error);
  } finally {
    if (context) {
      await context.close();
    }
    if (browser) {
      await browser.close();
    }
  }
}

const urls = [
  'https://www.ajover.com/',
  'https://darnelgroup.com/',
  'https://www.facebook.com/',
  'https://brightermushrooms.com/',
  'https://www.bretana.com.co/'
];

processUrls(urls);
