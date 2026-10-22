/**
 * Life Dashboard — js/script.js
 * Single JavaScript file. No frameworks, no build tools.
 *
 * Modules
 * -------
 * 1.  Storage utilities   — safe localStorage wrappers
 * 2.  Theme               — light/dark toggle, persistence
 * 3.  Clock & Greeting    — live clock, date, time-of-day greeting
 * 4.  Custom Name         — inline name editing, persistence
 * 5.  Focus Timer         — 25-min countdown, start/stop/reset
 * 6.  To-Do List          — add/edit/complete/delete, persistence
 * 7.  Quick Links         — add/delete, URL validation, persistence
 *
 * All user-provided text is set via textContent (never innerHTML)
 * to prevent injection.
 */

document.addEventListener('DOMContentLoaded', function () {

  /* ==============================================================
     1. STORAGE UTILITIES
     Thin wrappers around localStorage that catch errors silently.
     localStorage can throw SecurityError in some private-browsing
     modes or when storage is full.
     ============================================================== */

  /** LocalStorage keys — all in one place so they're easy to audit */
  var KEYS = {
    theme:  'dashboard_theme',
    name:   'dashboard_username',
    tasks:  'dashboard_tasks',
    links:  'dashboard_links'
  };

  /**
   * Read a value from localStorage.
   * Returns null if the key doesn't exist or storage is unavailable.
   */
  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  /**
   * Write a value to localStorage.
   * Fails silently if storage is unavailable or full.
   */
  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      // Storage unavailable — data won't persist but the app still works
    }
  }

  /**
   * Read a JSON array from localStorage.
   * Returns an empty array if the key is missing or data is malformed.
   */
  function storageGetJSON(key) {
    var raw = storageGet(key);
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      // Guard: ensure we got an actual array, not a string or object
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * Write a JavaScript value as JSON to localStorage.
   */
  function storageSetJSON(key, value) {
    storageSet(key, JSON.stringify(value));
  }


  /* ==============================================================
     2. THEME MODULE
     Reads saved theme on load, applies it, and wires up the toggle.
     The body's data-theme attribute drives all CSS token overrides.
     ============================================================== */

  var themeToggleBtn = document.getElementById('theme-toggle');

  /**
   * Apply a theme ('light' or 'dark') to the page.
   * Updates data-theme, aria-label, and aria-pressed on the button.
   */
  function applyTheme(theme) {
    document.body.dataset.theme = theme;
    if (theme === 'dark') {
      themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
      themeToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      themeToggleBtn.setAttribute('aria-pressed', 'false');
    }
  }

  /** Toggle between light and dark, then save the choice. */
  function toggleTheme() {
    var current = document.body.dataset.theme;
    var next = (current === 'dark') ? 'light' : 'dark';
    applyTheme(next);
    storageSet(KEYS.theme, next);
  }

  // Initialise: use saved theme, fall back to 'light'
  var savedTheme = storageGet(KEYS.theme) || 'light';
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener('click', toggleTheme);


  /* ==============================================================
     3. CLOCK & GREETING MODULE
     Updates the clock every second using a fresh Date() read.
     Never increments a counter — this keeps the clock accurate
     even if the browser throttles the tab in the background.
     ============================================================== */

  var clockEl   = document.getElementById('clock-display');
  var dateEl    = document.getElementById('date-display');
  var greetingPrefixEl = document.getElementById('greeting-prefix');

  /** Return a greeting string based on the hour (0-23). */
  function getGreeting(hour) {
    if (hour >= 5  && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }

  /** Format a Date into "HH:MM:SS AM/PM" with two-digit padding. */
  function formatTime(date) {
    var h = date.getHours();
    var m = date.getMinutes();
    var s = date.getSeconds();
    var ampm = h >= 12 ? 'PM' : 'AM';
    var h12  = h % 12 || 12; // convert 0 to 12 for midnight
    return (
      pad2(h12) + ':' + pad2(m) + ':' + pad2(s) + ' ' + ampm
    );
  }

  /** Format a Date into e.g. "Thursday, October 22, 2026". */
  function formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric'
    });
  }

  /** Zero-pad a number to two digits: 5 → "05". */
  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  /** Run once per second — reads a fresh Date() every call. */
  function tickClock() {
    var now  = new Date();
    var timeStr = formatTime(now);
    var dateStr = formatDate(now);

    clockEl.textContent = timeStr;
    // datetime attribute holds the machine-readable ISO value
    clockEl.setAttribute('datetime', now.toISOString());

    dateEl.textContent = dateStr;
    greetingPrefixEl.textContent = getGreeting(now.getHours());
  }

  // Run immediately so the display isn't blank for one second
  tickClock();
  setInterval(tickClock, 1000);


  /* ==============================================================
     4. CUSTOM NAME MODULE
     Inline click-to-edit pattern:
       greeting line → click ✏ → input appears → save/cancel.
     Name is persisted in localStorage.
     ============================================================== */

  var greetingNameEl   = document.getElementById('greeting-name');
  var editNameBtn      = document.getElementById('edit-name-btn');
  var nameEditForm     = document.getElementById('name-edit-form');
  var nameInput        = document.getElementById('name-input');
  var saveNameBtn      = document.getElementById('save-name-btn');
  var cancelNameBtn    = document.getElementById('cancel-name-btn');
  var greetingTextEl   = document.getElementById('greeting-text');

  var DEFAULT_NAME = 'Friend';

  /** Load saved name from storage, or fall back to 'Friend'. */
  function loadName() {
    var saved = storageGet(KEYS.name);
    // Treat an empty string the same as nothing saved
    return (saved && saved.trim()) ? saved.trim() : DEFAULT_NAME;
  }

  /** Show the edit form, hide the greeting display. */
  function openNameEdit() {
    greetingTextEl.hidden  = true;
    nameEditForm.hidden    = false;
    nameInput.value        = greetingNameEl.textContent === DEFAULT_NAME
      ? ''
      : greetingNameEl.textContent;
    nameInput.focus();
    nameInput.select();
  }

  /** Hide the edit form, show the greeting display. */
  function closeNameEdit() {
    nameEditForm.hidden   = true;
    greetingTextEl.hidden = false;
    editNameBtn.focus();
  }

  /** Save the name, update the display, persist to storage. */
  function saveName() {
    var raw = nameInput.value.trim();
    var name = raw || DEFAULT_NAME;
    greetingNameEl.textContent = name;
    storageSet(KEYS.name, name === DEFAULT_NAME ? '' : name);
    closeNameEdit();
  }

  // Initialise name from storage
  greetingNameEl.textContent = loadName();

  // Open edit on ✏ button click
  editNameBtn.addEventListener('click', openNameEdit);

  // Save on button click
  saveNameBtn.addEventListener('click', saveName);

  // Cancel on button click
  cancelNameBtn.addEventListener('click', closeNameEdit);

  // Keyboard support inside the name input
  nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    }
    if (e.key === 'Escape') {
      closeNameEdit();
    }
  });


  /* ==============================================================
     5. FOCUS TIMER MODULE
     State machine: idle → running → paused → done
                                  ↑           |
                                  └─ (reset) ─┘

     Accurate countdown: instead of counting ticks, we record the
     wall-clock endTime when Start is pressed, and compute
     remaining = endTime - Date.now() on each tick.
     This means browser tab throttling can't cause drift.
     ============================================================== */

  var timerDisplay    = document.getElementById('timer-display');
  var timerRing       = document.getElementById('timer-ring');
  var timerStatus     = document.getElementById('timer-status');
  var timerSrAnnounce = document.getElementById('timer-sr-announce');
  var timerStartBtn   = document.getElementById('timer-start');
  var timerStopBtn    = document.getElementById('timer-stop');
  var timerResetBtn   = document.getElementById('timer-reset');

  var TIMER_DURATION_MS = 25 * 60 * 1000; // 25 minutes in milliseconds

  // Timer state
  var timerState     = 'idle';    // 'idle' | 'running' | 'paused' | 'done'
  var timerIntervalId = null;     // setInterval handle
  var timerEndTime   = 0;         // wall-clock ms when timer should reach 0
  var timerRemaining = TIMER_DURATION_MS; // ms left (used when paused)

  /**
   * Convert milliseconds to a "MM:SS" string.
   * Clamps to zero so we never show negative values.
   */
  function msToDisplay(ms) {
    var totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    var mins = Math.floor(totalSeconds / 60);
    var secs = totalSeconds % 60;
    return pad2(mins) + ':' + pad2(secs);
  }

  /**
   * Update the ring's --progress CSS variable.
   * progress is 1.0 at the start, 0.0 when done.
   */
  function updateRing(remainingMs) {
    var progress = Math.max(0, Math.min(1, remainingMs / TIMER_DURATION_MS));
    timerRing.style.setProperty('--progress', progress);
  }

  /**
   * Sync the three control buttons to the current timerState.
   * Also updates the Start button label (Start vs Resume).
   */
  function syncTimerButtons() {
    switch (timerState) {
      case 'idle':
        timerStartBtn.textContent = 'Start';
        timerStartBtn.disabled = false;
        timerStopBtn.disabled  = true;
        timerResetBtn.disabled = true;
        break;
      case 'running':
        timerStartBtn.textContent = 'Start';
        timerStartBtn.disabled = true;
        timerStopBtn.disabled  = false;
        timerResetBtn.disabled = false;
        break;
      case 'paused':
        timerStartBtn.textContent = 'Resume';
        timerStartBtn.disabled = false;
        timerStopBtn.disabled  = true;
        timerResetBtn.disabled = false;
        break;
      case 'done':
        timerStartBtn.textContent = 'Start';
        timerStartBtn.disabled = true;
        timerStopBtn.disabled  = true;
        timerResetBtn.disabled = false;
        break;
    }
  }

  /**
   * Write a message to the screen-reader live region.
   * We clear it first so that the same message re-triggers
   * an announcement if needed (some screen readers skip
   * a mutation if the text content hasn't changed).
   */
  function announceTimer(msg) {
    timerSrAnnounce.textContent = '';
    // Use setTimeout to give the DOM a chance to observe the clear
    // before writing the new message
    setTimeout(function () {
      timerSrAnnounce.textContent = msg;
    }, 50);
  }

  /** Called on every interval tick while running. */
  function timerTick() {
    var remaining = timerEndTime - Date.now();

    if (remaining <= 0) {
      // Timer completed
      clearInterval(timerIntervalId);
      timerIntervalId = null;
      timerRemaining  = 0;
      timerState      = 'done';

      timerDisplay.textContent  = '00:00';
      updateRing(0);
      timerStatus.textContent   = "Time's up! 🎉";
      timerStatus.classList.add('is-done');
      syncTimerButtons();
      announceTimer("Time's up! Your 25-minute focus session is complete.");
      return;
    }

    timerRemaining = remaining;
    timerDisplay.textContent = msToDisplay(remaining);
    updateRing(remaining);
  }

  /** Start or resume the timer. */
  function startTimer() {
    if (timerState === 'running') return; // Guard: already running

    // Clear any stale interval (safety net)
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }

    timerEndTime = Date.now() + timerRemaining;
    timerState   = 'running';

    timerStatus.textContent = 'Running…';
    timerStatus.classList.remove('is-done');
    syncTimerButtons();
    announceTimer(
      timerRemaining === TIMER_DURATION_MS ? 'Timer started.' : 'Timer resumed.'
    );

    // Tick immediately so the display is correct right away,
    // then continue every 500ms for a smooth update feel
    timerTick();
    timerIntervalId = setInterval(timerTick, 500);
  }

  /** Pause the timer. */
  function stopTimer() {
    if (timerState !== 'running') return;

    clearInterval(timerIntervalId);
    timerIntervalId = null;

    // Save remaining ms at the moment of pause
    timerRemaining  = Math.max(0, timerEndTime - Date.now());
    timerState      = 'paused';

    timerDisplay.textContent = msToDisplay(timerRemaining);
    timerStatus.textContent  = 'Paused';
    syncTimerButtons();
    announceTimer('Timer paused.');
  }

  /** Reset the timer to the initial 25:00. */
  function resetTimer() {
    if (timerIntervalId !== null) {
      clearInterval(timerIntervalId);
      timerIntervalId = null;
    }

    timerRemaining = TIMER_DURATION_MS;
    timerState     = 'idle';

    timerDisplay.textContent = msToDisplay(TIMER_DURATION_MS);
    updateRing(TIMER_DURATION_MS);
    timerStatus.textContent  = 'Ready';
    timerStatus.classList.remove('is-done');
    syncTimerButtons();
    announceTimer('Timer reset to 25 minutes.');
  }

  // Initialise display
  timerDisplay.textContent = msToDisplay(TIMER_DURATION_MS);
  updateRing(TIMER_DURATION_MS);
  syncTimerButtons();

  timerStartBtn.addEventListener('click', startTimer);
  timerStopBtn.addEventListener('click',  stopTimer);
  timerResetBtn.addEventListener('click', resetTimer);


  /* ==============================================================
     6. TO-DO LIST MODULE
     Data shape: array of task objects
       { id: string, text: string, done: boolean }

     Sorting: active tasks first, completed tasks last.
     Duplicate check: case-insensitive, trimmed.
     All text set via textContent — never innerHTML.
     Event delegation: one click listener on the <ul>.
     ============================================================== */

  var todoForm    = document.getElementById('todo-form');
  var todoInput   = document.getElementById('todo-input');
  var todoList    = document.getElementById('todo-list');
  var todoError   = document.getElementById('todo-error');
  var todoSrStatus = document.getElementById('todo-sr-status');

  /** Array of task objects — loaded once from storage. */
  var tasks = loadTasks();

  /** Load tasks from storage, filter out any malformed entries. */
  function loadTasks() {
    var raw = storageGetJSON(KEYS.tasks);
    return raw.filter(function (t) {
      return t && typeof t.id === 'string' &&
             typeof t.text === 'string' && t.text.trim() !== '' &&
             typeof t.done === 'boolean';
    });
  }

  /** Save the current tasks array to storage. */
  function saveTasks() {
    storageSetJSON(KEYS.tasks, tasks);
  }

  /**
   * Generate a simple unique ID using timestamp + random suffix.
   * We don't need cryptographic randomness here.
   */
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /**
   * Show an error message on the todo form.
   * Auto-clears after 4 seconds.
   */
  function showTodoError(msg) {
    todoError.textContent = msg;
    todoError.hidden = false;
    todoInput.classList.add('is-error');
    clearTimeout(showTodoError._timer);
    showTodoError._timer = setTimeout(clearTodoError, 4000);
  }

  function clearTodoError() {
    todoError.hidden = true;
    todoError.textContent = '';
    todoInput.classList.remove('is-error');
  }

  /**
   * Announce a short message to screen readers via the SR status region.
   * Clears first so the same message can re-announce if needed.
   */
  function announceTodo(msg) {
    todoSrStatus.textContent = '';
    setTimeout(function () {
      todoSrStatus.textContent = msg;
    }, 50);
  }

  /**
   * Check whether a task name is a duplicate of any existing task.
   * Comparison is case-insensitive and whitespace-trimmed.
   * If excludeId is provided, that task is skipped (used during editing).
   */
  function isDuplicate(text, excludeId) {
    var norm = text.trim().toLowerCase();
    return tasks.some(function (t) {
      return t.id !== excludeId && t.text.trim().toLowerCase() === norm;
    });
  }

  /**
   * Return a sorted copy of tasks:
   *   active tasks (done: false) first, completed tasks (done: true) last.
   * Within each group, insertion order is preserved.
   */
  function getSortedTasks() {
    var active    = tasks.filter(function (t) { return !t.done; });
    var completed = tasks.filter(function (t) { return t.done; });
    return active.concat(completed);
  }

  /**
   * Build the SVG markup for icons used inside task buttons.
   * Using createElement + setAttribute instead of innerHTML.
   */
  function makeSVG(pathData, label) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.classList.add('icon');
    pathData.forEach(function (d) {
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      svg.appendChild(path);
    });
    return svg;
  }

  /**
   * Build a single <li> element for a task.
   * All user text is written via textContent.
   */
  function buildTaskItem(task) {
    var li = document.createElement('li');
    li.className = 'todo-item' + (task.done ? ' is-complete' : '');
    li.dataset.id = task.id;

    // Checkbox
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'todo-checkbox';
    cb.checked = task.done;
    cb.setAttribute('aria-label', 'Mark "' + task.text + '" as ' +
      (task.done ? 'incomplete' : 'complete'));
    cb.dataset.action = 'toggle';

    // Task name span
    var nameSpan = document.createElement('span');
    nameSpan.className = 'todo-name';
    nameSpan.textContent = task.text; // safe: textContent, not innerHTML

    // Actions container
    var actions = document.createElement('div');
    actions.className = 'todo-actions';

    // Edit button
    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'btn-task-action';
    editBtn.setAttribute('aria-label', 'Edit task: ' + task.text);
    editBtn.dataset.action = 'edit';
    editBtn.appendChild(makeSVG(
      ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7',
       'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z']
    ));

    // Delete button
    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'btn-task-action btn-delete';
    delBtn.setAttribute('aria-label', 'Delete task: ' + task.text);
    delBtn.dataset.action = 'delete';
    delBtn.appendChild(makeSVG(
      ['M3 6h18', 'M19 6l-1 14H6L5 6', 'M8 6V4h8v2']
    ));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(cb);
    li.appendChild(nameSpan);
    li.appendChild(actions);

    return li;
  }

  /** Render the full task list from the tasks array. */
  function renderTasks() {
    // Clear existing content safely
    while (todoList.firstChild) {
      todoList.removeChild(todoList.firstChild);
    }

    var sorted = getSortedTasks();

    if (sorted.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No tasks yet. Add one above!';
      todoList.appendChild(empty);
      return;
    }

    sorted.forEach(function (task) {
      todoList.appendChild(buildTaskItem(task));
    });
  }

  /**
   * Switch a task's name <span> to an inline <input> for editing.
   * The input gets a blur and keydown handler; saving re-renders.
   */
  function startEditTask(li) {
    var taskId   = li.dataset.id;
    var task     = tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;

    var nameSpan = li.querySelector('.todo-name');
    var actions  = li.querySelector('.todo-actions');

    // Replace span with input
    var editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = task.text;
    editInput.maxLength = 200;
    editInput.setAttribute('aria-label', 'Editing task: ' + task.text);

    nameSpan.replaceWith(editInput);
    editInput.focus();
    editInput.select();

    // Hide action buttons while editing
    actions.style.opacity = '0';
    actions.style.pointerEvents = 'none';

    var committed = false;

    function commitEdit() {
      if (committed) return;
      committed = true;

      var newText = editInput.value.trim();

      if (!newText) {
        // Empty — revert to original text
        editInput.replaceWith(nameSpan);
        actions.style.opacity = '';
        actions.style.pointerEvents = '';
        return;
      }

      if (isDuplicate(newText, taskId)) {
        // Duplicate — shake the input and revert
        editInput.classList.add('is-error');
        committed = false; // allow retry
        editInput.focus();
        return;
      }

      task.text = newText;
      saveTasks();
      renderTasks();
      announceTodo('Task updated.');
    }

    editInput.addEventListener('blur',    commitEdit);
    editInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitEdit();
      }
      if (e.key === 'Escape') {
        committed = true; // skip commitEdit on subsequent blur
        editInput.replaceWith(nameSpan);
        actions.style.opacity      = '';
        actions.style.pointerEvents = '';
      }
    });
  }

  /** Toggle a task's done state. */
  function toggleTask(taskId) {
    var task = tasks.find(function (t) { return t.id === taskId; });
    if (!task) return;
    task.done = !task.done;
    saveTasks();
    renderTasks();
    announceTodo(task.text + (task.done ? ' marked complete.' : ' marked incomplete.'));
  }

  /** Delete a task by id. */
  function deleteTask(taskId) {
    var task = tasks.find(function (t) { return t.id === taskId; });
    var name = task ? task.text : 'Task';
    tasks = tasks.filter(function (t) { return t.id !== taskId; });
    saveTasks();
    renderTasks();
    announceTodo(name + ' deleted.');
  }

  // Event delegation: handle all task interactions from one listener
  todoList.addEventListener('click', function (e) {
    // Walk up the DOM from the click target to find the actionable element
    var actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    var li = e.target.closest('li[data-id]');
    if (!li) return;

    var taskId = li.dataset.id;
    var action = actionEl.dataset.action;

    if (action === 'toggle') toggleTask(taskId);
    if (action === 'edit')   startEditTask(li);
    if (action === 'delete') deleteTask(taskId);
  });

  // Add new task on form submit (works with Enter key too)
  todoForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = todoInput.value.trim();

    if (!text) {
      showTodoError('Please enter a task name.');
      todoInput.focus();
      return;
    }

    if (isDuplicate(text)) {
      showTodoError('"' + text + '" already exists. Try a different name.');
      todoInput.focus();
      return;
    }

    var task = { id: generateId(), text: text, done: false };
    tasks.push(task);
    saveTasks();
    renderTasks();
    clearTodoError();
    todoInput.value = '';
    todoInput.focus();
    announceTodo(text + ' added.');
  });

  // Clear error state when the user starts typing again
  todoInput.addEventListener('input', clearTodoError);

  // Initial render
  renderTasks();


  /* ==============================================================
     7. QUICK LINKS MODULE
     Data shape: array of link objects
       { id: string, name: string, url: string }

     URL validation uses the URL constructor — if it throws,
     the URL is malformed. Then we check the protocol is
     http: or https: to block javascript: and other schemes.
     All text set via textContent — never innerHTML.
     Event delegation: one click listener on the <ul>.
     ============================================================== */

  var linksForm     = document.getElementById('links-form');
  var linkNameInput = document.getElementById('link-name-input');
  var linkUrlInput  = document.getElementById('link-url-input');
  var linksList     = document.getElementById('links-list');
  var linksError    = document.getElementById('links-error');
  var linksSrStatus = document.getElementById('links-sr-status');

  /** Array of link objects — loaded once from storage. */
  var links = loadLinks();

  /** Load links from storage, filter malformed entries. */
  function loadLinks() {
    var raw = storageGetJSON(KEYS.links);
    return raw.filter(function (l) {
      return l && typeof l.id   === 'string' &&
                  typeof l.name === 'string' && l.name.trim() !== '' &&
                  typeof l.url  === 'string' && l.url.trim()  !== '';
    });
  }

  /** Save the current links array to storage. */
  function saveLinks() {
    storageSetJSON(KEYS.links, links);
  }

  /**
   * Validate a URL string.
   * Returns { valid: true, url: normalised } or { valid: false, error: msg }.
   */
  function validateUrl(raw) {
    var trimmed = raw.trim();
    if (!trimmed) {
      return { valid: false, error: 'Please enter a URL.' };
    }
    var parsed;
    try {
      parsed = new URL(trimmed);
    } catch (e) {
      return { valid: false, error: 'That doesn\'t look like a valid URL.' };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only http:// and https:// URLs are allowed.' };
    }
    return { valid: true, url: parsed.href };
  }

  /**
   * Show an error on the links form.
   * Highlights whichever input is more likely to be wrong.
   */
  function showLinksError(msg, highlightEl) {
    linksError.textContent = msg;
    linksError.hidden = false;
    if (highlightEl) highlightEl.classList.add('is-error');
    clearTimeout(showLinksError._timer);
    showLinksError._timer = setTimeout(clearLinksError, 4000);
  }

  function clearLinksError() {
    linksError.hidden = true;
    linksError.textContent = '';
    linkNameInput.classList.remove('is-error');
    linkUrlInput.classList.remove('is-error');
  }

  /** Announce a short message for screen readers. */
  function announceLinks(msg) {
    linksSrStatus.textContent = '';
    setTimeout(function () {
      linksSrStatus.textContent = msg;
    }, 50);
  }

  /**
   * Build a single <li> pill for a link.
   * Opens in a new tab; delete button removes it.
   */
  function buildLinkItem(link) {
    var li = document.createElement('li');
    li.className = 'link-item';
    li.dataset.id = link.id;

    // Anchor that opens the URL
    var anchor = document.createElement('a');
    anchor.className  = 'link-anchor';
    anchor.href       = link.url;    // safe: validated to http/https only
    anchor.target     = '_blank';
    anchor.rel        = 'noopener noreferrer'; // security: prevent tab hijacking
    anchor.textContent = link.name;  // safe: textContent

    // External-link icon
    var extSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    extSvg.setAttribute('viewBox', '0 0 24 24');
    extSvg.setAttribute('aria-hidden', 'true');
    extSvg.setAttribute('focusable', 'false');
    extSvg.classList.add('icon');
    var extPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    extPath.setAttribute('d', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6');
    var extPath2 = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    extPath2.setAttribute('points', '15 3 21 3 21 9');
    var extPath3 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    extPath3.setAttribute('x1', '10'); extPath3.setAttribute('y1', '14');
    extPath3.setAttribute('x2', '21'); extPath3.setAttribute('y2', '3');
    extSvg.appendChild(extPath);
    extSvg.appendChild(extPath2);
    extSvg.appendChild(extPath3);
    anchor.appendChild(extSvg);

    // Delete button
    var delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'link-delete-btn';
    delBtn.setAttribute('aria-label', 'Delete link: ' + link.name);
    delBtn.dataset.action = 'delete';

    var delSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    delSvg.setAttribute('viewBox', '0 0 24 24');
    delSvg.setAttribute('aria-hidden', 'true');
    delSvg.setAttribute('focusable', 'false');
    delSvg.classList.add('icon');

    // × (close) icon: two diagonal lines with explicit numeric coordinates.
    // Previously this used SVG path strings split on spaces, which broke
    // on "M6 6l12 12" because "6l12" is one token (no space before 'l').
    [
      { x1: '18', y1: '6',  x2: '6',  y2: '18' },
      { x1: '6',  y1: '6',  x2: '18', y2: '18' }
    ].forEach(function (coords) {
      var ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      ln.setAttribute('x1', coords.x1);
      ln.setAttribute('y1', coords.y1);
      ln.setAttribute('x2', coords.x2);
      ln.setAttribute('y2', coords.y2);
      delSvg.appendChild(ln);
    });
    delBtn.appendChild(delSvg);

    li.appendChild(anchor);
    li.appendChild(delBtn);

    return li;
  }

  /** Render the full links list. */
  function renderLinks() {
    while (linksList.firstChild) {
      linksList.removeChild(linksList.firstChild);
    }

    if (links.length === 0) {
      var empty = document.createElement('li');
      empty.className = 'empty-state';
      empty.textContent = 'No links yet. Add one above!';
      linksList.appendChild(empty);
      return;
    }

    links.forEach(function (link) {
      linksList.appendChild(buildLinkItem(link));
    });
  }

  /** Delete a link by id. */
  function deleteLink(linkId) {
    var link = links.find(function (l) { return l.id === linkId; });
    var name = link ? link.name : 'Link';
    links = links.filter(function (l) { return l.id !== linkId; });
    saveLinks();
    renderLinks();
    announceLinks(name + ' deleted.');
  }

  // Event delegation on the links list
  linksList.addEventListener('click', function (e) {
    var actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    var li = e.target.closest('li[data-id]');
    if (!li) return;
    if (actionEl.dataset.action === 'delete') {
      deleteLink(li.dataset.id);
    }
  });

  // Add new link on form submit
  linksForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = linkNameInput.value.trim();
    if (!name) {
      showLinksError('Please enter a site name.', linkNameInput);
      linkNameInput.focus();
      return;
    }

    var urlResult = validateUrl(linkUrlInput.value);
    if (!urlResult.valid) {
      showLinksError(urlResult.error, linkUrlInput);
      linkUrlInput.focus();
      return;
    }

    var link = { id: generateId(), name: name, url: urlResult.url };
    links.push(link);
    saveLinks();
    renderLinks();
    clearLinksError();
    linkNameInput.value = '';
    linkUrlInput.value  = '';
    linkNameInput.focus();
    announceLinks(name + ' added.');
  });

  // Clear error when user types
  linkNameInput.addEventListener('input', clearLinksError);
  linkUrlInput.addEventListener('input',  clearLinksError);

  // Initial render
  renderLinks();

}); // end DOMContentLoaded
