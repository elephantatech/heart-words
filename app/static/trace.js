const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.querySelectorAll("[data-trace]").forEach((root) => {
  const canvases = [...root.querySelectorAll("canvas")];
  const clearButton = root.querySelector("[data-clear]");
  const nextButton = root.querySelector("[data-next]");
  const contexts = canvases.map((canvas) => canvas.getContext("2d"));

  function fit(canvas, context) {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * scale));
    canvas.height = Math.max(1, Math.floor(rect.height * scale));
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#1a2744";
  }

  function fitAll() {
    canvases.forEach((canvas, index) => fit(canvas, contexts[index]));
    nextButton.disabled = true;
  }

  function point(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return [event.clientX - rect.left, event.clientY - rect.top];
  }

  fitAll();
  window.addEventListener("resize", fitAll);

  canvases.forEach((canvas, index) => {
    const context = contexts[index];
    let drawing = false;

    canvas.addEventListener("pointerdown", (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const [x, y] = point(canvas, event);
      context.beginPath();
      context.moveTo(x, y);
      nextButton.disabled = false;
    });

    canvas.addEventListener("pointermove", (event) => {
      if (!drawing) return;
      const [x, y] = point(canvas, event);
      context.lineTo(x, y);
      context.stroke();
      nextButton.disabled = false;
    });

    function stop() {
      drawing = false;
    }

    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  });

  clearButton.addEventListener("click", () => {
    canvases.forEach((canvas, index) => {
      const context = contexts[index];
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.restore();
    });
    nextButton.disabled = true;
  });

  nextButton.addEventListener("click", () => {
    const target = document.getElementById(nextButton.dataset.next);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  });
});
