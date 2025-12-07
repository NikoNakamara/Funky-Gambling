(function () {
  const body = document.body;
  const toggle = document.getElementById("theme-toggle");
  const iconSpan = document.querySelector("[data-theme-icon]");
  const sprite = document.querySelector("[data-bg-sprite]");
  const fumo = document.querySelector("[data-fumo]");

  // Random fumo sprite on each load (fumo1.png ... fumo10.png)
  if (fumo) {
    const maxFumo = 10;
    const index = 1 + Math.floor(Math.random() * maxFumo);
    fumo.src = `fumo${index}.png`;
  }


  // DARK THEME ONLY
  body.setAttribute("data-theme", "dark");
  if (iconSpan) {
    iconSpan.textContent = "☾";
  }

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // BACKGROUND PATTERN MOVEMENT
  if (sprite) {
    let baseX = 0;
    let baseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    window.addEventListener("mousemove", (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      mouseX = e.clientX / w - 0.5;
      mouseY = e.clientY / h - 0.5;
    });

    function animateBg() {
      baseX += 2;
      baseY += 2;

      const parallax = 24;
      const x = baseX - mouseX * parallax;
      const y = baseY - mouseY * parallax;

      sprite.style.backgroundPosition = `${x}px ${y}px`;

      requestAnimationFrame(animateBg);
    }

    requestAnimationFrame(animateBg);
  }

  // WANDERING + DRAGGABLE FUMO
  if (fumo) {
    // logical position (top-left)
    let posX = window.innerWidth / 2 - 48;
    let posY = window.innerHeight - 140;

    // wandering state
    let wanderTargetX = posX;
    let lastTime = performance.now();
    let nextJumpTime = lastTime + 4000 + Math.random() * 4000;
    let nextWanderChange = lastTime + 3000;

    // vertical motion
    let vy = 0;

    // dragging state
    let dragging = false;
    let pointerId = null;
    let offsetX = 0;
    let offsetY = 0;

    function clampToViewport() {
      const rect = fumo.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const margin = 8;
      const ground = h - rect.height - 12;

      posX = Math.min(Math.max(posX, margin), w - margin - rect.width);
      posY = Math.min(Math.max(posY, margin), ground);
    }

    function applyTransform() {
      fumo.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
    }

    window.addEventListener("resize", () => {
      clampToViewport();
      applyTransform();
    });

    fumo.addEventListener("dragstart", (e) => e.preventDefault());

    // Pointer drag handlers
    fumo.addEventListener("pointerdown", (e) => {
      dragging = true;
      pointerId = e.pointerId;
      fumo.classList.add("dragging");
      try { fumo.setPointerCapture(pointerId); } catch {}
      const rect = fumo.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;
      vy = 0;
    });

    fumo.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pointerId) return;
      posX = e.clientX - offsetX;
      posY = e.clientY - offsetY;
      clampToViewport();
      applyTransform();
    });

    function endDrag(e) {
      if (!dragging || (e && e.pointerId !== pointerId)) return;
      dragging = false;
      fumo.classList.remove("dragging");
      try { fumo.releasePointerCapture(pointerId); } catch {}
      clampToViewport();
      lastTime = performance.now();
      nextWanderChange = lastTime + 1500 + Math.random() * 2500;
      nextJumpTime = lastTime + 3000 + Math.random() * 4000;
    }

    fumo.addEventListener("pointerup", endDrag);
    fumo.addEventListener("pointercancel", endDrag);

    function animateFumo(now) {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      const rect = fumo.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      const margin = 8;
      const ground = h - rect.height - 12;

      if (!dragging) {
        const speed = 60;      // walk speed
        const gravity = 900;   // gravity strength
        const jumpVelocity = -260;

        // choose new wander target sometimes
        if (now >= nextWanderChange || Math.abs(wanderTargetX - posX) < 4) {
          const maxX = Math.max(w - margin - rect.width, margin + 1);
          wanderTargetX = margin + Math.random() * (maxX - margin);
          nextWanderChange = now + 2500 + Math.random() * 3500;
        }

        // move toward target
        const dir = wanderTargetX > posX ? 1 : -1;
        posX += dir * speed * dt;

        // little jumps sometimes (only when on ground)
        if (now >= nextJumpTime && Math.abs(posY - ground) < 2) {
          vy = jumpVelocity;
          nextJumpTime = now + 4000 + Math.random() * 5000;
        }

        // gravity
        vy += gravity * dt;
        posY += vy * dt;
        if (posY > ground) {
          posY = ground;
          vy = 0;
        }
      }

      clampToViewport();
      applyTransform();
      requestAnimationFrame(animateFumo);
    }

    clampToViewport();
    applyTransform();
    requestAnimationFrame(animateFumo);
  }
})();