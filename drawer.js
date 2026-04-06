(function () {
  const PROJECTS_URL =
    "https://lschiavini.github.io/projects-drawer/projects.json";

  const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@500;600&display=swap');
#ls-drawer-trigger {
  position: fixed; right: 0; top: 50%; transform: translateY(-50%);
  width: 26px; height: 72px; background: #1a1a1a; border-radius: 8px 0 0 8px;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  z-index: 999998; transition: background 0.2s;
  box-shadow: -2px 0 12px rgba(0,0,0,0.08);
}
#ls-drawer-trigger:hover { background: #333; }
#ls-drawer-trigger svg { width: 11px; height: 11px; color: #fff; transition: transform 0.3s; }
#ls-drawer {
  position: fixed; right: -320px; top: 0; height: 100%; width: 300px;
  background: #fafafa; border-left: 1px solid #e8e8e8;
  z-index: 999997; transition: right 0.35s cubic-bezier(0.4,0,0.2,1);
  overflow-y: auto; display: flex; flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}
#ls-drawer.open { right: 0; }
#ls-drawer-header {
  padding: 20px 16px 12px; border-bottom: 1px solid #efefef;
  background: #fff; position: sticky; top: 0; z-index: 1;
}
#ls-drawer-header .ls-title {
  font-family: 'Cormorant', Georgia, serif;
  font-size: 28px; font-weight: 600; color: #1a1a1a; letter-spacing: -0.01em;
}
#ls-drawer-header .ls-sub { font-size: 14px; color: #777; margin-top: 1px; }
#ls-project-grid { padding: 12px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
.ls-card {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px;
  background: #fff; border: 1px solid #ececec; border-radius: 10px;
  text-decoration: none; cursor: pointer; position: relative; overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s, border-color 0.15s;
}
.ls-card:hover { transform: translateX(-3px); box-shadow: 3px 3px 0px #1a1a1a; border-color: #1a1a1a; }
.ls-thumb {
  width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
  background: #f0f0f0; display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #999; overflow: hidden;
}
.ls-thumb img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; display: block; }
.ls-info { flex: 1; min-width: 0; }
.ls-name { font-size: 15px; font-weight: 600; color: #1a1a1a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ls-desc { font-size: 13px; color: #6b6b6b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.ls-badge { font-size: 11px; font-weight: 600; padding: 2px 6px; border-radius: 4px; flex-shrink: 0; text-transform: uppercase; letter-spacing: 0.04em; }
.ls-badge-building { background: #e8f0fb; color: #4a7fc1; }
.ls-badge-acquired { background: #e6f4ea; color: #3a8a50; }
#ls-drawer-footer {
  padding: 12px 16px; border-top: 1px solid #efefef;
  font-size: 13px; color: #8f8f8f; text-align: center; background: #fff;
}
`;

  function inject() {
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    const trigger = document.createElement("div");
    trigger.id = "ls-drawer-trigger";
    trigger.innerHTML = `<svg viewBox="0 0 11 11" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline id="ls-arrow" points="7,2 3,5.5 7,9"/></svg>`;
    trigger.addEventListener("click", toggle);
    document.body.appendChild(trigger);

    const drawer = document.createElement("div");
    drawer.id = "ls-drawer";
    drawer.innerHTML = `
      <div id="ls-drawer-header">
        <div class="ls-title">Things I've built</div>
        <div class="ls-sub" id="ls-sub">Loading...</div>
      </div>
      <div id="ls-project-grid"></div>
      <div id="ls-drawer-footer">lucas-schiavini.com</div>
    `;
    document.body.appendChild(drawer);

    fetch(PROJECTS_URL)
      .then((r) => r.json())
      .then(render)
      .catch(() => {
        document.getElementById("ls-sub").textContent = "Could not load projects";
      });
  }

  function render(projects) {
    const grid = document.getElementById("ls-project-grid");
    const acquired = projects.filter((p) => p.status === "acquired").length;
    document.getElementById("ls-sub").textContent =
      `${projects.length} projects · ${acquired} acquired`;

    projects.forEach((p) => {
      const card = document.createElement("a");
      card.className = "ls-card";
      card.href = p.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const initials = p.name.split(" ").slice(0, 2).map((w) => w[0]).join("");
      const badge =
        p.status === "building"
          ? `<span class="ls-badge ls-badge-building">WIP</span>`
          : p.status === "acquired"
          ? `<span class="ls-badge ls-badge-acquired">Acq.</span>`
          : "";

      card.innerHTML = `
        <div class="ls-thumb">
          ${p.img ? `<img src="${p.img}" alt="${p.name}" onerror="this.parentElement.textContent='${initials}'">` : initials}
        </div>
        <div class="ls-info">
          <div class="ls-name">${p.name}</div>
          <div class="ls-desc">${p.desc || ""}</div>
        </div>
        ${badge}
      `;
      grid.appendChild(card);
    });
  }

  function toggle() {
    const drawer = document.getElementById("ls-drawer");
    const open = drawer.classList.toggle("open");
    document.getElementById("ls-arrow").setAttribute(
      "points",
      open ? "4,2 8,5.5 4,9" : "7,2 3,5.5 7,9"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
