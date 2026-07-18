import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = (process.env.BASE_URL || 'https://virat-public-school-v2.pages.dev').replace(/\/$/, '');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
if (!ADMIN_USERNAME || !ADMIN_PASSWORD) throw new Error('Set ADMIN_USERNAME and ADMIN_PASSWORD');

const stamp = Date.now().toString().slice(-8);
const data = {
  admissionPhone: '8' + stamp.slice(-8) + '1',
  parentPhone: '9' + stamp.slice(-8) + '2',
  admissionParent: `E2E Admission ${stamp}`,
  admissionStudent: `E2E Applicant ${stamp}`,
  parentName: `E2E Parent ${stamp}`,
  studentName: `E2E Student ${stamp}`,
  admissionNumber: `E2E-${stamp}`,
  contactEmail: `e2e-${stamp}@example.com`,
  contactSubject: `E2E contact ${stamp}`,
  noticeTitle: `E2E notice ${stamp}`,
  examTitle: `E2E exam ${stamp}`,
  password: `Portal-${stamp}!`
};

const report = { baseUrl: BASE, startedAt: new Date().toISOString(), testData: { stamp }, steps: [], warnings: [], cleanup: [] };
const step = (name, detail = '') => { report.steps.push({ name, detail, at: new Date().toISOString() }); console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`); };
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function gotoWithRetry(page, path, ready, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
      if (ready) await ready();
      return;
    } catch (error) {
      last = error;
      await sleep(500 * (i + 1));
    }
  }
  throw last;
}

async function adminLogin(page) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await gotoWithRetry(page, '/admin/login.html', async () => {
      await page.locator('#username').waitFor({ state: 'visible', timeout: 15000 });
    });
    await page.locator('#username').fill(ADMIN_USERNAME);
    await page.locator('#password').fill(ADMIN_PASSWORD);
    await page.locator('#login-btn').click();
    try {
      await page.waitForURL(url => /\/admin\/(?:index(?:\.html)?)?$/.test(url.pathname), { waitUntil: 'domcontentloaded', timeout: 40000 });
      await page.locator('.sidebar-brand').waitFor({ state: 'visible', timeout: 40000 });
      return;
    } catch (error) {
      report.warnings.push(`Admin login retry ${attempt + 1}`);
    }
  }
  throw new Error('Admin login failed after retries');
}

async function waitAdminPage(page, path, heading) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    try {
      await page.locator('#page-root .page-head h1').filter({ hasText: heading }).waitFor({ state: 'visible', timeout: 40000 });
      return;
    } catch (error) {
      if (page.url().includes('/admin/login')) await adminLogin(page);
      report.warnings.push(`Admin page retry: ${path}`);
    }
  }
  throw new Error(`Could not open authenticated admin page ${path}`);
}

async function waitText(locator, text, timeout = 45000) {
  await locator.filter({ hasText: text }).waitFor({ state: 'visible', timeout });
}

async function apiRetry(request, method, path, options = {}, attempts = 4) {
  let response;
  for (let i = 0; i < attempts; i++) {
    response = await request[method](BASE + path, options);
    if (response.status() < 500) return response;
    report.warnings.push(`${method.toUpperCase()} ${path} retry after ${response.status()}`);
    await sleep(500 * (i + 1));
  }
  return response;
}

async function cleanup(adminPage) {
  const request = adminPage.context().request;
  const headers = { Origin: BASE };
  const cleanList = async (listPath, arrayKey, predicate, deletePath) => {
    const response = await apiRetry(request, 'get', listPath);
    if (!response.ok()) { report.cleanup.push({ resource: listPath, ok: false, status: response.status() }); return; }
    const json = await response.json();
    const rows = (json[arrayKey] || []).filter(predicate);
    for (const row of rows) {
      const deleted = await apiRetry(request, 'delete', `${deletePath}/${encodeURIComponent(row.id)}`, { headers });
      report.cleanup.push({ resource: `${deletePath}/${row.id}`, ok: deleted.ok(), status: deleted.status() });
    }
  };

  await cleanList('/api/admin/inquiries', 'inquiries', row => row.parent_phone === data.admissionPhone, '/api/admin/inquiries');
  await cleanList('/api/admin/messages', 'messages', row => row.subject === data.contactSubject, '/api/admin/messages');
  await cleanList('/api/admin/parents', 'parents', row => row.phone === data.parentPhone, '/api/admin/parents');
  await cleanList('/api/admin/students', 'students', row => row.admission_number === data.admissionNumber, '/api/admin/students');
  await cleanList('/api/admin/notices', 'notices', row => row.title === data.noticeTitle || row.title === data.examTitle, '/api/admin/notices');
  await cleanList('/api/admin/exams', 'exams', row => row.title === data.examTitle, '/api/admin/exams');
}

mkdirSync('reports/screenshots', { recursive: true });
const browser = await chromium.launch({ headless: true });
let desktopAdmin;

try {
  // Public desktop: hierarchy + admissions feedback and successful submission.
  const publicContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  const publicPage = await publicContext.newPage();
  await gotoWithRetry(publicPage, '/', async () => pageReady(publicPage, '#home-title'));
  assert((await publicPage.locator('#home-title').textContent()).includes('strong education'), 'Homepage hierarchy heading missing');
  await publicPage.screenshot({ path: 'reports/screenshots/home-desktop.png', fullPage: true });
  step('Desktop public homepage', 'hero, CTAs, proof cards, stats and gallery visible');

  await publicPage.getByRole('link', { name: /Start an admission inquiry/i }).click({ noWaitAfter: true });
  try { await publicPage.locator('#submit-btn').waitFor({ state: 'visible', timeout: 12000 }); }
  catch { await gotoWithRetry(publicPage, '/admissions.html', async () => pageReady(publicPage, '#submit-btn')); }
  await publicPage.locator('#submit-btn').click();
  await publicPage.locator('#form-error.show').waitFor({ state: 'visible' });
  step('Admissions validation feedback');
  await publicPage.locator('#parent_name').fill(data.admissionParent);
  await publicPage.locator('#phone').fill(data.admissionPhone);
  await publicPage.locator('#student_name').fill(data.admissionStudent);
  await publicPage.locator('#applying_for').selectOption({ label: 'Class 3' });
  await publicPage.locator('#message').fill('Automated production workflow test.');
  await publicPage.locator('#submit-btn').click();
  await publicPage.locator('#form-success.show').waitFor({ state: 'visible', timeout: 60000 });
  assert((await publicPage.locator('#form-success').textContent()).includes('Reference'), 'Admissions reference feedback missing');
  step('Admissions success workflow', 'reference and next steps displayed');

  await gotoWithRetry(publicPage, '/contact.html', async () => pageReady(publicPage, '#contact-form'));
  await publicPage.locator('#name').fill(data.parentName);
  await publicPage.locator('#email').fill(data.contactEmail);
  await publicPage.locator('#subject').fill(data.contactSubject);
  await publicPage.locator('#message').fill('Automated production contact workflow test.');
  await publicPage.locator('#contact-btn').click();
  await publicPage.locator('#form-success.show').waitFor({ state: 'visible', timeout: 60000 });
  step('Contact form success feedback');

  await gotoWithRetry(publicPage, '/results.html', async () => pageReady(publicPage, '#result-form'));
  await publicPage.locator('#roll').fill('E2E-NOT-FOUND');
  await publicPage.locator('#dob').fill('2015-01-01');
  await publicPage.locator('#lookup-btn').click();
  await publicPage.locator('#lookup-status.error').waitFor({ state: 'visible', timeout: 60000 });
  step('Public results error feedback');

  // Parent registration and pending state.
  await gotoWithRetry(publicPage, '/parent/register.html', async () => pageReady(publicPage, '#regForm'));
  await publicPage.locator('#full_name').fill(data.parentName);
  await publicPage.locator('#phone').fill(data.parentPhone);
  await publicPage.locator('#password').fill(data.password);
  await publicPage.locator('#password2').fill(data.password);
  await publicPage.locator('#student_name').fill(data.studentName);
  await publicPage.locator('#admission_number').fill(data.admissionNumber);
  await publicPage.locator('#class_name').selectOption({ label: 'Class 5' });
  await publicPage.locator('#dob').fill('2015-05-11');
  await publicPage.locator('#section').selectOption('A');
  await publicPage.locator('#roll_number').fill('91');
  await publicPage.locator('#regBtn').click();
  await publicPage.locator('.form-success.show').waitFor({ state: 'visible', timeout: 70000 });
  step('Parent account registration', 'child match details submitted');

  await gotoWithRetry(publicPage, '/parent/login.html', async () => pageReady(publicPage, '#loginForm'));
  await publicPage.locator('#phone').fill(data.parentPhone);
  await publicPage.locator('#password').fill(data.password);
  await publicPage.locator('#loginBtn').click();
  await publicPage.waitForURL(/parent\/pending(?:\.html)?/, { waitUntil: 'domcontentloaded', timeout: 60000 });
  step('Pending parent sign-in state');
  await publicContext.close();

  // Authenticated desktop admin workflows.
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  desktopAdmin = await adminContext.newPage();
  await adminLogin(desktopAdmin);
  await desktopAdmin.locator('#page-root .stat-grid').waitFor({ state: 'visible', timeout: 60000 });
  step('Authenticated desktop admin dashboard');

  await waitAdminPage(desktopAdmin, '/admin/students.html', 'Student master list');
  await desktopAdmin.locator('#page-root #full_name').fill(data.studentName);
  await desktopAdmin.locator('#page-root #admission_number').fill(data.admissionNumber);
  await desktopAdmin.locator('#page-root #class_name').selectOption({ label: 'Class 5' });
  await desktopAdmin.locator('#page-root #section').selectOption('A');
  await desktopAdmin.locator('#page-root #roll_number').fill('91');
  await desktopAdmin.locator('#page-root #dob').fill('2015-05-11');
  await desktopAdmin.locator('#page-root #save-btn').click();
  await waitText(desktopAdmin.locator('#page-root #student-form-status.show'), 'Student added', 70000);
  step('Admin student form success');

  await waitAdminPage(desktopAdmin, '/admin/parents.html', 'Parent accounts');
  const parentCard = () => desktopAdmin.locator('.parent-card', { hasText: data.parentPhone });
  await parentCard().waitFor({ state: 'visible', timeout: 70000 });
  const candidate = parentCard().locator('.candidate-select');
  assert(await candidate.inputValue(), 'No student candidate was preselected');
  await parentCard().getByRole('button', { name: 'Verify & link' }).click();
  await waitText(parentCard(), 'Verified link', 70000);
  step('Admin verified child linking');
  await parentCard().getByRole('button', { name: 'Approve account' }).click();
  await waitText(parentCard(), 'Approved', 70000);
  step('Admin parent approval');

  await waitAdminPage(desktopAdmin, '/admin/inquiries.html', 'Admission inquiries');
  const inquiryCard = desktopAdmin.locator('.inquiry-card', { hasText: data.admissionPhone });
  await inquiryCard.waitFor({ state: 'visible', timeout: 70000 });
  await inquiryCard.getByRole('button', { name: 'Mark contacted' }).click();
  await waitText(desktopAdmin.locator('.inquiry-card', { hasText: data.admissionPhone }), 'Contacted', 70000);
  step('Admin admission status action');

  await waitAdminPage(desktopAdmin, '/admin/messages.html', 'Contact messages');
  const messageRow = desktopAdmin.locator('.list-item', { hasText: data.contactSubject });
  await messageRow.waitFor({ state: 'visible', timeout: 70000 });
  await messageRow.getByRole('button', { name: 'Open' }).click();
  await desktopAdmin.locator('#view-modal.open').waitFor({ state: 'visible' });
  await desktopAdmin.locator('#close-btn').click();
  step('Admin contact message click-through');

  await waitAdminPage(desktopAdmin, '/admin/notices.html', 'Notices');
  await desktopAdmin.locator('#page-root #new-btn').click();
  await desktopAdmin.locator('#edit-title-input').fill(data.noticeTitle);
  await desktopAdmin.locator('#edit-category').selectOption('GENERAL');
  await desktopAdmin.locator('#edit-body').fill('<p>Automated production test notice.</p>');
  await desktopAdmin.locator('#edit-published').uncheck();
  await desktopAdmin.locator('#edit-modal #save-btn').click();
  await desktopAdmin.locator('.list-item', { hasText: data.noticeTitle }).waitFor({ state: 'visible', timeout: 70000 });
  step('Admin notice form success');

  await waitAdminPage(desktopAdmin, '/admin/exams.html', 'Exams & results');
  await desktopAdmin.locator('#page-root #newExamBtn').click();
  await desktopAdmin.locator('[name="title"]').fill(data.examTitle);
  await desktopAdmin.locator('#new-class').selectOption({ label: 'Class 5' });
  await desktopAdmin.locator('#new-subject').selectOption({ label: 'Art' });
  await desktopAdmin.locator('[name="exam_date"]').fill('2027-03-20');
  await desktopAdmin.locator('#saveNew').click();
  await desktopAdmin.locator('.list-item', { hasText: data.examTitle }).waitFor({ state: 'visible', timeout: 70000 });
  step('Admin exam form success');

  await waitAdminPage(desktopAdmin, '/admin/results.html', 'Results lookup');
  await desktopAdmin.locator('#page-root #roll').fill('E2E-NOT-FOUND');
  await desktopAdmin.locator('#page-root #dob').fill('2015-01-01');
  await desktopAdmin.locator('#page-root #search-btn').click();
  await desktopAdmin.locator('#page-root #search-status.error').waitFor({ state: 'visible', timeout: 60000 });
  step('Admin results form error state');
  await desktopAdmin.screenshot({ path: 'reports/screenshots/admin-desktop.png', fullPage: true });

  // Authenticated mobile admin drawer click-through.
  const mobileAdminContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const mobileAdmin = await mobileAdminContext.newPage();
  await adminLogin(mobileAdmin);
  const mobileDestinations = [
    ['Notices', /notices(?:\.html)?/], ['Inquiries', /inquiries(?:\.html)?/], ['Messages', /messages(?:\.html)?/],
    ['Gallery', /gallery(?:\.html)?/], ['Results', /results(?:\.html)?/], ['Exams', /exams(?:\.html)?/],
    ['Parents', /parents(?:\.html)?/], ['Students', /students(?:\.html)?/], ['Audit log', /audit(?:\.html)?/]
  ];
  for (const [label, urlPattern] of mobileDestinations) {
    if (mobileAdmin.url().includes('/admin/login')) await adminLogin(mobileAdmin);
    await mobileAdmin.locator('#menu-btn').waitFor({ state: 'visible', timeout: 45000 });
    await mobileAdmin.locator('#menu-btn').click();
    await mobileAdmin.locator('#sidebar.open').waitFor({ state: 'visible' });
    await mobileAdmin.locator('#sidebar .nav-item', { hasText: label }).first().click();
    await mobileAdmin.waitForURL(urlPattern, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await mobileAdmin.locator('.topbar').waitFor({ state: 'visible', timeout: 45000 });
  }
  await mobileAdmin.screenshot({ path: 'reports/screenshots/admin-mobile.png', fullPage: true });
  step('Authenticated mobile admin click-through', `${mobileDestinations.length} destinations via drawer`);
  await mobileAdminContext.close();

  // Approved parent mobile flow.
  const parentContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const parentPage = await parentContext.newPage();
  await gotoWithRetry(parentPage, '/parent/login.html', async () => pageReady(parentPage, '#loginForm'));
  for (let attempt = 0; attempt < 3; attempt++) {
    await parentPage.locator('#phone').fill(data.parentPhone);
    await parentPage.locator('#password').fill(data.password);
    await parentPage.locator('#loginBtn').click();
    try { await parentPage.waitForURL(/parent\/dashboard(?:\.html)?/, { waitUntil: 'domcontentloaded', timeout: 60000 }); break; }
    catch { if (attempt === 2) throw new Error('Approved parent mobile login failed'); }
  }
  await waitText(parentPage.locator('#children'), data.studentName, 70000);
  await waitText(parentPage.locator('#children'), 'Verified', 20000);
  await parentPage.locator('#addChildDetails summary').click();
  await parentPage.locator('#childLinkForm').waitFor({ state: 'visible' });
  await parentPage.screenshot({ path: 'reports/screenshots/parent-mobile.png', fullPage: true });
  step('Authenticated mobile parent workflow', 'verified child and add-child flow visible');
  await parentContext.close();

  await cleanup(desktopAdmin);
  step('Production test-data cleanup');
  await adminContext.close();

  report.ok = true;
} catch (error) {
  report.ok = false;
  report.error = { message: error.message, stack: error.stack };
  console.error(`✗ ${error.stack || error.message}`);
  if (desktopAdmin) {
    try { await cleanup(desktopAdmin); } catch (cleanupError) { report.warnings.push(`Cleanup error: ${cleanupError.message}`); }
  }
  process.exitCode = 1;
} finally {
  report.finishedAt = new Date().toISOString();
  writeFileSync('reports/production-e2e.json', JSON.stringify(report, null, 2));
  await browser.close();
}

async function pageReady(page, selector) {
  await page.locator(selector).waitFor({ state: 'visible', timeout: 30000 });
}
