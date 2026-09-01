// Exports the CV pages to PDF as a single continuous page matching the
// normal desktop (screen) rendering, instead of relying on third-party
// webpage-to-PDF converters that don't reflow the layout correctly.
//
// Requirements:
//   - Node.js 20+
//
// Setup (once):
//   npm install
//
// Run:
//   npm run pdf
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VIEWPORT_WIDTH = 1920;

const pages = [
	{ input: "index.html", output: "Thibaut-Nurit-CV-EN.pdf" },
	{ input: "index_fr.html", output: "Thibaut-Nurit-CV-FR.pdf" },
];

async function run() {
	const browser = await puppeteer.launch();
	try {
		for (const { input, output } of pages) {
			const page = await browser.newPage();
			await page.setViewport({ width: VIEWPORT_WIDTH, height: 1080 });

			const fileUrl = "file://" + path.resolve(__dirname, "..", input).replace(/\\/g, "/");
			await page.goto(fileUrl, { waitUntil: "networkidle0" });
			await page.evaluate(() => document.fonts.ready);

			// page.pdf() defaults to print media; force screen so the page
			// renders exactly like the live desktop site.
			await page.emulateMediaType("screen");

			const contentHeight = await page.evaluate(() => document.querySelector(".main-wrapper").scrollHeight);

			const outputPath = path.resolve(__dirname, "..", output);
			await page.pdf({
				path: outputPath,
				printBackground: true,
				width: `${VIEWPORT_WIDTH}px`,
				height: `${contentHeight}px`,
				pageRanges: "1",
			});

			console.log(`Generated ${output} (${VIEWPORT_WIDTH}x${contentHeight}px)`);
			await page.close();
		}
	} finally {
		await browser.close();
	}
}

run().catch((err) => {
	console.error(err);
	process.exit(1);
});
