export function updateCards() {
  const nowUTC = new Date();

  document.querySelectorAll(".card").forEach((card) => {
    const endUTC = new Date(card.dataset.end);
    const diffMs = endUTC - nowUTC;

    const dot = card.querySelector(".dot");
    const text = card.querySelector(".time-text");
    const btn = card.querySelector(".bid-btn");
    dot.className = "dot";

    if (minutesLeft > 60) {
      // ACTIVE
      dot.classList.add("active");
      text.textContent = `auction ends in: ${formatGMT7(endUTC)}`;
      btn.disabled = false;
    } else if (minutesLeft > 0) {
      // WARNING
      dot.classList.add("warning");
      text.textContent = `ending soon: ${formatGMT7(endUTC)}`;
      btn.disabled = false;
    } else {
      // ENDED
      dot.classList.add("ended");
      text.textContent = "auction ended";
      btn.disabled = true;
    }
  });
}
