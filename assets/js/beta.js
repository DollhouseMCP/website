(() => {
  const form = document.getElementById("beta-request-form");
  if (!form) return;
  const button = form.querySelector('button[type="submit"]');
  const status = document.getElementById("beta-status");
  const clients = [...form.querySelectorAll('input[name="clients"]')];
  let open = false;
  let sending = false;

  const validateClients = () => {
    clients[0].setCustomValidity(clients.some((client) => client.checked) ? "" : "Select at least one MCP client.");
  };
  clients.forEach((client) => client.addEventListener("change", validateClients));
  validateClients();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!open || sending || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    status.textContent = "Sending your request…";
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new URLSearchParams(new FormData(form)),
        credentials: "omit",
        signal: AbortSignal.timeout(15000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "We could not save your request. Please try again later.");
      form.reset();
      validateClients();
      open = false;
      status.textContent = "Request received. Mick will review it by hand and email you if access is approved.";
    } catch (error) {
      status.textContent = error.name === "TimeoutError"
        ? "The connection timed out. Your request may have been saved. Please wait before trying again."
        : error.message === "Failed to fetch"
          ? "We could not reach the form. Please try again later."
          : error.message;
    } finally {
      sending = false;
      button.disabled = !open;
      status.focus();
    }
  });

  fetch(form.action, { credentials: "omit", cache: "no-store", signal: AbortSignal.timeout(5000) })
    .then(async (response) => {
      if (!response.ok || !(await response.json()).enabled) throw new Error("closed");
      open = true;
      button.disabled = false;
      status.textContent = "Requests are open. Access is approved by hand.";
    })
    .catch(() => {
      status.textContent = "This form is not accepting requests yet. Please check back later.";
    });
})();
