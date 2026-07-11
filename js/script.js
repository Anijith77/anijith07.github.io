(() => {
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------------- Mobile nav ---------------- */
  const navToggle = document.getElementById('navToggle');
  const nav = document.querySelector('.nav');
  navToggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }));

  /* ---------------- Profile (hero + about + contact) ---------------- */
  async function loadProfile() {
    try {
      const res = await fetch('data/profile.json');
      if (!res.ok) throw new Error('bad response');
      const p = await res.json();

      const dot = document.getElementById('statusDot');
      const statusText = document.getElementById('statusText');
      const isAvailable = p.availability === 'Open to work';
      dot.classList.add(isAvailable ? 'is-available' : 'is-busy');
      statusText.textContent = p.availability.toLowerCase();

      document.getElementById('heroLede').textContent = p.about;
      document.getElementById('aboutText').textContent = p.about;
      document.getElementById('aboutFacts').innerHTML = `
        <li>${p.credential}</li>
        <li>Based: ${p.location}</li>
        <li>Currently: ${p.availability}</li>
      `;
      document.getElementById('credProgram').textContent = p.credential;
      document.getElementById('credStatus').textContent = p.availability;

      document.getElementById('emailLink').textContent = p.email;
      document.getElementById('emailLink').href = `mailto:${p.email}`;
      document.getElementById('githubLink').href = p.socials.github;
      document.getElementById('linkedinLink').href = p.socials.linkedin;
      document.getElementById('resumeLink').href = p.socials.resume;

      runTerminal(p);
    } catch (err) {
      document.getElementById('statusText').textContent = 'status unavailable';
      runTerminal(null);
    }
  }

  /* ---------------- Terminal typing effect ---------------- */
  function runTerminal(profile) {
    const body = document.getElementById('terminalBody');
    const name = profile ? profile.name : 'Alex Rivera';
    const title = profile ? profile.title : 'Web Developer';
    const credential = profile ? profile.credential : 'Diploma in Web Development';
    const about = profile ? profile.about : 'Building fast, accessible, full-stack products.';

    const script = [
      { type: 'cmd', text: 'whoami' },
      { type: 'out', text: `${name} — ${title}` },
      { type: 'cmd', text: 'cat credential.txt' },
      { type: 'out', text: credential },
      { type: 'cmd', text: 'cat about.txt' },
      { type: 'out', text: about },
      { type: 'cmd', text: 'ls skills/' },
      { type: 'out', text: 'html  css  javascript  react  node  express  mongodb  git' },
      { type: 'cmd', text: './open-to-work.sh' },
      { type: 'out', text: 'Portfolio deployed and ready ✓' }
    ];

    body.innerHTML = '';
    let i = 0;

    function typeLine(line, el, done) {
      let j = 0;
      const speed = line.type === 'cmd' ? 32 : 8;
      (function step() {
        el.textContent = (line.type === 'cmd' ? '$ ' : '> ') + line.text.slice(0, j);
        j++;
        if (j <= line.text.length) {
          setTimeout(step, speed);
        } else {
          done();
        }
      })();
    }

    function next() {
      if (i >= script.length) {
        const cursor = document.createElement('span');
        cursor.className = 'terminal__cursor';
        body.appendChild(cursor);
        return;
      }
      const line = script[i];
      const el = document.createElement('div');
      el.className = 'terminal__line ' + (line.type === 'cmd' ? 'terminal__prompt' : 'terminal__output');
      body.appendChild(el);
      typeLine(line, el, () => {
        i++;
        setTimeout(next, line.type === 'cmd' ? 220 : 380);
      });
    }
    next();
  }

  /* ---------------- Projects ---------------- */
  let allProjects = [];

  async function loadProjects() {
    const grid = document.getElementById('projectGrid');
    try {
      const res = await fetch('data/projects.json');
      if (!res.ok) throw new Error('bad response');
      allProjects = await res.json();
      buildFilters(allProjects);
      renderProjects(allProjects);
    } catch (err) {
      grid.innerHTML = `<p>Couldn't load projects right now.</p>`;
    }
  }

  function buildFilters(projects) {
    const row = document.getElementById('filterRow');
    const tags = ['all', ...new Set(projects.map(p => p.tag))];
    row.innerHTML = tags.map((tag, idx) =>
      `<button class="filter-chip ${idx === 0 ? 'is-active' : ''}" data-tag="${tag}" role="tab" aria-selected="${idx === 0}">${tag}</button>`
    ).join('');

    row.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        row.querySelectorAll('.filter-chip').forEach(c => { c.classList.remove('is-active'); c.setAttribute('aria-selected', 'false'); });
        chip.classList.add('is-active');
        chip.setAttribute('aria-selected', 'true');
        const tag = chip.dataset.tag;
        renderProjects(tag === 'all' ? allProjects : allProjects.filter(p => p.tag === tag));
      });
    });
  }

  function renderProjects(projects) {
    const grid = document.getElementById('projectGrid');
    if (!projects.length) {
      grid.innerHTML = `<p>No projects tagged this way yet.</p>`;
      return;
    }
    grid.innerHTML = projects.map(p => `
      <article class="project-card">
        <div class="project-card__top">
          <h3>${p.name}</h3>
          <span class="project-card__year">${p.year}</span>
        </div>
        <span class="project-card__tag">${p.tag}</span>
        <p class="project-card__summary">${p.summary}</p>
        <ul class="project-card__highlights">
          ${p.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
        <div class="project-card__stack">
          ${p.stack.map(s => `<span>${s}</span>`).join('')}
        </div>
        <div class="project-card__links">
          <a href="${p.live}" target="_blank" rel="noopener">Live →</a>
          <a href="${p.repo}" target="_blank" rel="noopener">Code →</a>
        </div>
      </article>
    `).join('');
  }

  /* ---------------- Skills ---------------- */
  async function loadSkills() {
    const grid = document.getElementById('skillsGrid');
    try {
      const res = await fetch('data/skills.json');
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      const groupNames = { frontend: 'Frontend', backend: 'Backend', tooling: 'Tooling' };

      grid.innerHTML = Object.entries(data).map(([key, items]) => `
        <div class="skill-group">
          <h3>${groupNames[key] || key}</h3>
          ${items.map(s => `
            <div class="skill-row">
              <div class="skill-row__label"><span>${s.name}</span><span>${s.level}%</span></div>
              <div class="skill-bar"><div class="skill-bar__fill" data-level="${s.level}"></div></div>
            </div>
          `).join('')}
        </div>
      `).join('');

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.skill-bar__fill').forEach(bar => {
              bar.style.width = bar.dataset.level + '%';
            });
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      grid.querySelectorAll('.skill-group').forEach(g => observer.observe(g));
    } catch (err) {
      grid.innerHTML = `<p>Couldn't load skills right now.</p>`;
    }
  }

  /* ---------------- Contact form ---------------- */
  function setFieldError(field, msg) {
    const wrapper = document.getElementById(field).closest('.field');
    const errEl = document.getElementById('err-' + field);
    if (msg) {
      wrapper.classList.add('has-error');
      errEl.textContent = msg;
    } else {
      wrapper.classList.remove('has-error');
      errEl.textContent = '';
    }
  }

  function validateForm(data) {
    let ok = true;
    if (!data.name || data.name.trim().length < 2) { setFieldError('name', 'Enter a name with at least 2 characters.'); ok = false; } else setFieldError('name', '');
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) { setFieldError('email', 'Enter a valid email address.'); ok = false; } else setFieldError('email', '');
    if (!data.message || data.message.trim().length < 10) { setFieldError('message', 'Message should be at least 10 characters.'); ok = false; } else setFieldError('message', '');
    return ok;
  }

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    const btn = document.getElementById('submitBtn');
    const label = document.getElementById('submitLabel');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        message: document.getElementById('message').value
      };
      if (!validateForm(data)) {
        status.textContent = 'Fix the highlighted fields and try again.';
        status.className = 'form__status is-error';
        return;
      }

      btn.disabled = true;
      label.textContent = 'Opening email…';
      status.textContent = '';
      status.className = 'form__status';

      // Static hosting (GitHub Pages) has no backend, so we hand the
      // message off to the visitor's email client instead of POSTing it.
      const to = 'alex.rivera.dev@example.com';
      const subject = encodeURIComponent(`Portfolio contact from ${data.name}`);
      const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

      status.textContent = 'Your email client should open — send it from there!';
      status.className = 'form__status is-success';
      form.reset();
      btn.disabled = false;
      label.textContent = 'Send message';
    });
  }

  /* ---------------- Init ---------------- */
  loadProfile();
  loadProjects();
  loadSkills();
  initContactForm();
})();
