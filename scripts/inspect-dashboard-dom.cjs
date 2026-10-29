const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'public', 'erp', 'dashboard.html'), 'utf8');

console.log('--- DASHBOARD STRUCTURE ---');
// Extract top title / brand
const title = content.match(/<title>([^<]+)<\/title>/i);
console.log('Title:', title ? title[1] : 'None');

// Extract first 500 chars of body
const bodyStart = content.indexOf('<body');
console.log('Body start sample:\n', content.slice(bodyStart, bodyStart + 1500));

// Find sections or main divisions
const sections = [...content.matchAll(/<(?:section|div)[^>]+id=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
console.log('IDs in DOM:', sections.slice(0, 30));

// Find tables
const tables = [...content.matchAll(/<table[^>]*>/gi)];
console.log('Number of tables:', tables.length);
