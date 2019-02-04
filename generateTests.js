const fs = require("fs");
const SetupEnvironment = require('./setupEnvironment')
const ENV = new SetupEnvironment(process.argv);

(async () => {
  const pathForVisualTest = `${__dirname}/visual.test.js`;
  fs.unlink(pathForVisualTest, () => {
    fs.open(pathForVisualTest, "wx", (err, fd) => {
      if (err) return null;

      console.log(ENV.RESPONSIVE, ENV.PAGES)
      fs.writeFile(
        fd,
        `
/* eslint-env jest */
/**
* @jest-environment jsdom
*/
import puppeteer from 'puppeteer'
import { toMatchImageSnapshot } from 'jest-image-snapshot'
expect.extend({ toMatchImageSnapshot })

describe('Image snapshot tests', () => {
    ${generateTests(ENV.RESPONSIVE, ENV.PAGES)}
})
`,
        err => {
          if (err) throw err;
        }
      );
    });
  });
})();

const generateTests = (widths, pages) => reduceWidth(widths, pages)

const reduceWidth = (widths, pages) =>
    widths.reduce((widthAcc, width) => widthAcc += `
    describe('matches snapshots on ${width}px resoultion', () => {
      ${describeSetup(width)}
      ${reducePages(width, pages)}
      })\n
    `, "")

const reducePages = (width, pages) =>
    pages.reduce((pageAcc, page) =>
    (`
    test('matches snapshot ${width} on route ${page}', async () => {
        await page.goto('${page}')
        const screen = await page.screenshot({ fullPage: true })
        expect(screen).toMatchImageSnapshot({
            customSnapshotsDir: '__image_snapshots__',
            failureThreshold: '0.01',
        })
        }, 15000)\n`
    ), '') 

const describeSetup = width =>
  `
    let page = null
    let browser = null
    beforeAll(async () => {
      browser = await puppeteer.launch({ headless: true })
      page = await browser.newPage()
      const height = await page.evaluate(() => document.documentElement.offsetHeight)
      page.setViewport({
        width: ${width},
        height: height
      })
    })
    afterAll(async() => browser.close())
  `;
