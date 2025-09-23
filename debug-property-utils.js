const { shouldPropertyHaveBHK, generatePropertyTitle } = require('./src/lib/propertyUtils.ts');

// Test cases
const testCases = [
  // Residential cases - should have BHK
  { type: 'flat', category: 'residential', bhk: 2, location: 'Mumbai', expected: true },
  { type: 'apartment', category: 'residential', bhk: 3, location: 'Delhi', expected: true },
  { type: 'house', category: 'residential', bhk: 4, location: 'Pune', expected: true },
  { type: 'plot', category: 'residential', bhk: null, location: 'Bangalore', expected: true },
  
  // Agricultural cases - should NOT have BHK
  { type: 'farmland', category: 'agricultural', bhk: 2, location: 'Nashik', expected: false },
  { type: 'orchard', category: 'agricultural', bhk: 3, location: 'Aurangabad', expected: false },
  
  // Commercial cases - should NOT have BHK
  { type: 'office', category: 'commercial', bhk: 2, location: 'Mumbai', expected: false },
  { type: 'shop', category: 'commercial', bhk: 1, location: 'Delhi', expected: false },
  
  // Edge cases without category
  { type: 'flat', category: null, bhk: 2, location: 'Mumbai', expected: true },
  { type: 'farmland', category: null, bhk: 2, location: 'Nashik', expected: false },
];

console.log('Testing shouldPropertyHaveBHK function:');
console.log('======================================');

testCases.forEach((testCase, index) => {
  const result = shouldPropertyHaveBHK(testCase.type, testCase.category);
  const title = generatePropertyTitle(testCase.type, testCase.location, testCase.bhk, testCase.category);
  
  console.log(`${index + 1}. Type: ${testCase.type}, Category: ${testCase.category || 'none'}`);
  console.log(`   Should have BHK: ${result} (expected: ${testCase.expected}) ${result === testCase.expected ? '✅' : '❌'}`);
  console.log(`   Generated title: "${title}"`);
  console.log('');
});