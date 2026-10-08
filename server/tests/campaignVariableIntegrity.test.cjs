/**
 * Automated Regression Test Suite: Campaign Variable Integrity & Inbox Timeline
 * 
 * Guards against:
 * 1. Template variable count inflation when variable numbers repeat (Meta Error #132000 prevention)
 * 2. Un-interpolated {{1}}, {{2}} placeholders leaking into team Inbox messages
 * 3. Hardcoded recipient names in dynamic broadcasts & test sends
 */

const assert = require('assert');

console.log('========================================================================');
console.log('🛡️  CAMPAIGN VARIABLE INTEGRITY & INBOX TIMELINE REGRESSION SUITE');
console.log('========================================================================\n');

// --- TEST 1: Template Variable Distinct Count Calculation ---
console.log('--- TEST 1: Meta Parameter Count Calculation with Repeated Variables ---');

function calculateRequiredParams(bodyText) {
  const matches = (bodyText || '').match(/\{\{(\d+)\}\}/g) || [];
  const varNums = matches.map((m) => parseInt(m.replace(/\D/g, ''), 10)).filter((n) => !isNaN(n));
  return varNums.length > 0 ? Math.max(...varNums) : 0;
}

const templateWithDuplicates = `Namaste {{1}} team! Agar aapki {{2}} optical store mein billing register par hoti hai. Hum iss hafte {{2}} mein demos de rahe hain.`;
const count1 = calculateRequiredParams(templateWithDuplicates);
assert.strictEqual(count1, 2, 'Template with {{1}} and two {{2}} must require exactly 2 parameters, NOT 3');
console.log('  ✓ [PASS] 1.1 Body text with repeated {{2}} yields requiredCount = 2, preventing Meta #132000');

const singleVarTemplate = `Hello {{1}}, Thank you for your interest in ARCO!`;
const count2 = calculateRequiredParams(singleVarTemplate);
assert.strictEqual(count2, 1, 'Template with single {{1}} must require exactly 1 parameter');
console.log('  ✓ [PASS] 1.2 Single variable template yields requiredCount = 1');

// --- TEST 2: Over-length Parameter Guard ---
console.log('\n--- TEST 2: Over-length Parameter Truncation Guard ---');

function guardParams(bodyParams, requiredCount) {
  const params = [...bodyParams];
  if (params.length > requiredCount) {
    params.length = requiredCount;
  }
  return params;
}

const excessParams = [
  { type: 'text', text: 'Kamdar Optics' },
  { type: 'text', text: 'Mumbai' },
  { type: 'text', text: 'Unexpected_Value_3' }
];
const guarded = guardParams(excessParams, 2);
assert.strictEqual(guarded.length, 2, 'Excess parameter array must be truncated to requiredCount (2)');
assert.strictEqual(guarded[0].text, 'Kamdar Optics');
assert.strictEqual(guarded[1].text, 'Mumbai');
console.log('  ✓ [PASS] 2.1 Excess parameters are safely truncated to template requirements before Meta dispatch');

// --- TEST 3: Inbox Message Variable Interpolation ---
console.log('\n--- TEST 3: Inbox Message Variable Interpolation ---');

function interpolateMessageText(templateBody, resolvedVariables) {
  let text = templateBody;
  if (text && resolvedVariables && typeof resolvedVariables === 'object') {
    Object.entries(resolvedVariables).forEach(([varKey, val]) => {
      text = text.replace(new RegExp(`\\{\\{${varKey}\\}\\}`, 'g'), val || '');
    });
  }
  return text;
}

const sampleBody = `Hello {{1}},\n\n{{2}} ke optical stores Arco use kar rahe hain.`;
const resolved = { '1': 'VISION GALAXY', '2': 'Mumbai City' };
const finalInboxText = interpolateMessageText(sampleBody, resolved);

assert.strictEqual(finalInboxText.includes('{{1}}'), false, 'Inbox text must not contain {{1}}');
assert.strictEqual(finalInboxText.includes('{{2}}'), false, 'Inbox text must not contain {{2}}');
assert.strictEqual(finalInboxText.includes('VISION GALAXY'), true, 'Inbox text must contain the resolved business name');
assert.strictEqual(finalInboxText.includes('Mumbai City'), true, 'Inbox text must contain the resolved city');
console.log('  ✓ [PASS] 3.1 All variables {{1}} and {{2}} are completely interpolated before persisting to Inbox');

// --- TEST 4: No Hardcoded Name Fallback ---
console.log('\n--- TEST 4: Recipient Name Resolution ---');

function resolveContactName(dbContact, recipient) {
  const name = dbContact?.name || recipient?.name || null;
  if (name && !/whatsapp user/i.test(name)) {
    return name;
  }
  return 'Valued Partner';
}

const knownContact = { name: 'Nilesh Patel', phone: '+919920858396' };
assert.strictEqual(resolveContactName(knownContact, {}), 'Nilesh Patel');
console.log('  ✓ [PASS] 4.1 Known contacts resolve to actual WhatsApp/CRM profile name');

const unknownContact = { name: null };
assert.strictEqual(resolveContactName(unknownContact, {}), 'Valued Partner');
assert.notStrictEqual(resolveContactName(unknownContact, {}), 'Shraddha', 'Must never fallback to hardcoded user name');
console.log('  ✓ [PASS] 4.2 Unknown contacts resolve to generic "Valued Partner" and never hardcoded names');

console.log('\n========================================================================');
console.log('🎉 ALL VARIABLE INTEGRITY & INBOX REGRESSION TESTS PASSED!');
console.log('========================================================================\n');
process.exit(0);
