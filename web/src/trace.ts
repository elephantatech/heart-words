export function bindTracing(root: ParentNode = document): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.querySelectorAll<HTMLElement>("[data-trace]").forEach((section) => {
    const canvases = [...section.querySelectorAll("canvas")];
    const clearButton = section.querySelector<HTMLButtonElement>("[data-clear]");
    const nextButton = section.querySelector<HTMLButtonElement>("[data-next]");
    const contexts = canvases.map((canvas) => canvas.getContext("2d")!);

    function fit(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
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

    function fitAll(): void {
      canvases.forEach((canvas, index) => fit(canvas, contexts[index]));
      if (nextButton) nextButton.disabled = true;
    }

    fitAll();
    window.addEventListener("resize", fitAll);
    canvases.forEach((canvas, index) => {
      const context = contexts[index];
      let drawing = false;
      const point = (event: PointerEvent): [number, number] => {
        const rect = canvas.getBoundingClientRect();
        return [event.clientX - rect.left, event.clientY - rect.top];
      };
      canvas.addEventListener("pointerdown", (event: PointerEvent) => {
        drawing = true;
        canvas.setPointerCapture(event.pointerId);
        const [x, y] = point(event);
        context.beginPath();
        context.moveTo(x, y);
        if (nextButton) nextButton.disabled = false;
      });
      canvas.addEventListener("pointermove", (event: PointerEvent) => {
        if (!drawing) return;
        const [x, y] = point(event);
        context.lineTo(x, y);
        context.stroke();
      });
      canvas.addEventListener("pointerup", () => {
        drawing = false;
      });
      canvas.addEventListener("pointercancel", () => {
        drawing = false;
      });
    });
    clearButton?.addEventListener("click", () => fitAll());
    nextButton?.addEventListener("click", () => {
      const target = document.getElementById(nextButton.dataset.next ?? "");
      target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  });
}
