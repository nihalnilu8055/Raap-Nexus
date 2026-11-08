// One-time setup: copies the original Help Center package (pages, assets, screenshots, gifs) into public/help-center.
// Runs automatically before dev, preview and build when public/help-center is missing (so a build can never ship without the Help content).
// Manual use:  node scripts/install-help-center.mjs [--if-missing] ["path\to\RaapNexus-Help"]
import { cpSync, existsSync, rmSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const ifMissing = args.includes('--if-missing')
const src = args.find((a) => !a.startsWith('--')) || process.env.HELP_CENTER_SRC || 'C:\\Users\\Anju\\Desktop\\Techlogica\\Project\\RaapNexus docs\\RaapNexus-Help'
const dest = join(root, 'public', 'help-center')
if (ifMissing && existsSync(join(dest, 'assets', 'data.js')) && existsSync(join(dest, 'shots', 'en'))) process.exit(0) // already installed
if (!existsSync(join(src, 'assets', 'data.js'))) { console.error('\nHELP CENTER CONTENT MISSING: public/help-center is not installed and the source folder was not found:\n  ' + src + '\nCopy the RaapNexus-Help folder there, or run: node scripts/install-help-center.mjs "<path to RaapNexus-Help>"\n'); process.exit(1) }
rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true, filter: (p) => !/web\.config$/i.test(p) })
console.log(`Copied ${readdirSync(dest).filter((f) => f.endsWith('.html')).length} pages + assets, shots and gifs to public/help-center`)
