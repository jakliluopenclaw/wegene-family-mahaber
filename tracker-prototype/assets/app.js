const STORAGE_KEY = 'wegene-tracker-prototype-v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const CONFIG = window.WEGENE_CONFIG || {};

const $ = (id) => document.getElementById(id);

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function isLoggedIn() {
  return sessionStorage.getItem(CONFIG.sessionStorageKey || 'wegene-member-session-v1') === 'ok';
}

function showApp() {
  $('login-screen').hidden = true;
  $('app-shell').hidden = false;
}

function showLogin() {
  $('login-screen').hidden = false;
  $('app-shell').hidden = true;
}

async function setupLoginGate() {
  if (isLoggedIn()) {
    showApp();
    return true;
  }
  showLogin();
  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const entered = $('member-password').value;
    const hash = await sha256Hex(entered);
    if (hash === CONFIG.memberPasswordHash) {
      sessionStorage.setItem(CONFIG.sessionStorageKey || 'wegene-member-session-v1', 'ok');
      $('member-password').value = '';
      $('login-error').hidden = true;
      showApp();
    } else {
      $('login-error').hidden = false;
    }
  });
  return false;
}

async function loadSeedData() {
  const [members, state, history] = await Promise.all([
    fetch('data/members.json').then(r => r.json()),
    fetch('data/state.json').then(r => r.json()),
    fetch('data/history.json').then(r => r.json())
  ]);
  return { members, state, history };
}

function getInitials(name) {
  return name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

function minHostDate() {
  const date = new Date(Date.now() + 21 * DAY_MS);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function parseDateInput(value) {
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function badge(status) {
  const map = {
    hosted: ['hosted', '✅ Hosted'],
    ready: ['ready', '🔘 Get Ready'],
    scheduled: ['scheduled', '📅 Scheduled'],
    passed: ['passed', '⏭️ Passed'],
    waiting: ['waiting', 'Waiting']
  };
  const [cls, label] = map[status] || map.waiting;
  return `<span class="badge ${cls}">${label}</span>`;
}

function memberById(data, id) {
  return data.members.find(m => m.id === id);
}

function sortedActiveMembers(data) {
  return [...data.members].filter(m => m.active && m.hostingEligible).sort((a, b) => a.rotationOrder - b.rotationOrder);
}

function nextInMainOrder(data, afterOrder) {
  const members = sortedActiveMembers(data);
  return members.find(m => m.rotationOrder > afterOrder) || members[0];
}

function computeMemberStatus(data, member) {
  if (data.state.scheduled?.memberId === member.id) return 'scheduled';
  if (data.state.currentMemberId === member.id) return 'ready';
  if (data.state.passQueue.includes(member.id)) return 'passed';
  if (data.history.some(h => h.memberId === member.id && h.round === data.state.round && h.status === 'hosted')) return 'hosted';
  return 'waiting';
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function showMessage(text) {
  const box = $('validation-message');
  box.textContent = text;
  box.hidden = false;
}

function scheduleHost(data, dateValue) {
  if (!dateValue) return showMessage('Please choose a hosting date first.');
  const selected = parseDateInput(dateValue);
  const minimum = parseDateInput(minHostDate());
  if (selected < minimum) {
    return showMessage(`Please choose a date at least 3 weeks from today: ${minHostDate()} or later.`);
  }
  data.state.scheduled = { memberId: data.state.currentMemberId, date: dateValue, status: 'scheduled' };
  data.state.updatedAt = new Date().toISOString();
  save(data);
  render(data);
  showMessage('Hosting date scheduled in local demo. Logged-in members can view the MVP call list; reminders would be triggered in production.');
}

function passCurrentMember(data) {
  const current = memberById(data, data.state.currentMemberId);
  if (!current) return;
  if (!confirm(`${current.name} will pass and move into the pass queue. Continue?`)) return;
  if (!data.state.passQueue.includes(current.id)) data.state.passQueue.push(current.id);
  const next = nextInMainOrder(data, current.rotationOrder);
  data.state.currentMemberId = next.id;
  data.state.mainPointerOrder = next.rotationOrder;
  data.state.scheduled = null;
  data.state.updatedAt = new Date().toISOString();
  save(data);
  render(data);
  showMessage(`${current.name} was added to the pass queue. ${next.name} is now Get Ready.`);
}

function confirmHosted(data) {
  const scheduled = data.state.scheduled;
  if (!scheduled) return;
  const hostedMember = memberById(data, scheduled.memberId);
  data.history.unshift({
    id: `hist-${Date.now()}`,
    memberId: hostedMember.id,
    memberName: hostedMember.name,
    hostingDate: scheduled.date,
    round: data.state.round,
    status: 'hosted',
    notes: 'Confirmed in local prototype demo.'
  });
  data.state.lastHostedMemberId = hostedMember.id;
  let next;
  if (data.state.passQueue.length) {
    const nextId = data.state.passQueue.shift();
    next = memberById(data, nextId);
  } else {
    next = nextInMainOrder(data, hostedMember.rotationOrder);
  }
  data.state.currentMemberId = next.id;
  data.state.mainPointerOrder = next.rotationOrder;
  data.state.scheduled = null;
  data.state.updatedAt = new Date().toISOString();
  save(data);
  render(data);
  showMessage(`${hostedMember.name} marked hosted. ${next.name} is now Get Ready${data.state.passQueue.length ? ' from the pass queue' : ''}.`);
}

function renderAvatar(member) {
  if (member.photo) return `<span class="avatar"><img src="${member.photo}" alt="${member.name}" /></span>`;
  return `<span class="avatar" aria-hidden="true">${getInitials(member.name)}</span>`;
}

function render(data) {
  const current = memberById(data, data.state.currentMemberId);
  const scheduled = data.state.scheduled;
  $('current-summary').innerHTML = current
    ? `${renderAvatar(current)} <strong>${current.name}</strong> is current/Get Ready. Round ${data.state.round}. ${scheduled ? `<br>Scheduled date: <strong>${scheduled.date}</strong>` : ''}`
    : 'No current member selected.';

  const min = minHostDate();
  $('current-actions').innerHTML = scheduled
    ? `<button class="secondary" id="confirm-hosted">Demo: confirm hosted</button><span class="badge scheduled">Minimum date rule met</span>`
    : `<input type="date" id="host-date" min="${min}" aria-label="Hosting date" />
       <button id="host-button">📅 I will host</button>
       <button class="warn" id="pass-button">❌ I will pass</button>
       <span class="badge waiting">Earliest: ${min}</span>`;

  if (scheduled) $('confirm-hosted').addEventListener('click', () => confirmHosted(data));
  else {
    $('host-button').addEventListener('click', () => scheduleHost(data, $('host-date').value));
    $('pass-button').addEventListener('click', () => passCurrentMember(data));
  }

  $('pass-queue').innerHTML = data.state.passQueue.length
    ? `<ol>${data.state.passQueue.map(id => `<li>${memberById(data, id)?.name || `Member ${id}`}</li>`).join('')}</ol>`
    : '<p>No passed members waiting.</p>';

  $('member-table').innerHTML = sortedActiveMembers(data).map(member => {
    const status = computeMemberStatus(data, member);
    const date = data.state.scheduled?.memberId === member.id ? data.state.scheduled.date : (data.history.find(h => h.memberId === member.id && h.round === data.state.round)?.hostingDate || '—');
    return `<tr class="${member.id === data.state.currentMemberId ? 'current' : ''}">
      <td>${member.rotationOrder}</td>
      <td class="name-cell">${renderAvatar(member)} ${member.name}</td>
      <td>${badge(status)}</td>
      <td>${date}</td>
    </tr>`;
  }).join('');

  $('call-list-table').innerHTML = sortedActiveMembers(data).map(member => `<tr>
    <td>${member.rotationOrder}</td><td class="name-cell">${renderAvatar(member)} ${member.name}</td><td>${member.phone || '(pending)'}</td>
  </tr>`).join('');

  $('history-table').innerHTML = data.history.map(row => `<tr>
    <td>${row.memberName}</td><td>${row.hostingDate}</td><td>${row.round}</td><td>${badge(row.status)}</td><td>${row.notes || ''}</td>
  </tr>`).join('');
}

async function boot() {
  const loginReady = await setupLoginGate();
  $('logout-button').addEventListener('click', () => {
    sessionStorage.removeItem(CONFIG.sessionStorageKey || 'wegene-member-session-v1');
    showLogin();
  });
  const seed = await loadSeedData();
  let data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || seed;
  render(data);
  $('reset-demo').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });
  $('export-state').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wegene-tracker-demo-state.json';
    a.click();
    URL.revokeObjectURL(url);
  });
}

boot().catch(err => {
  console.error(err);
  document.body.insertAdjacentHTML('afterbegin', `<main class="card"><h1>Could not load prototype data</h1><p>Run through a local web server, not direct file open. See README.md.</p></main>`);
});
