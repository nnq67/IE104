const grid = document.getElementById("grid-upcomingAuction");

let Name = "a"; //may nay dung neo4j để lấy giá trị
let author = "b";
let price = "c";
//----
function updateCards() {
  const nowUTC = new Date();

  document.querySelectorAll(".card").forEach((card) => {
    const endUTC = new Date(card.dataset.end);
    const diffMs = endUTC - nowUTC;
    const minutesLeft = Math.floor(diffMs / 60000);

    const dot = card.querySelector(".dot");
    const text = card.querySelector(".time-text");
    const btn = card.querySelector("#bid-btn");

    dot.className = "dot";

    if (minutesLeft > 60) {
      dot.classList.add("active");
      text.textContent = `auction ends in: ${formatGMT7(endUTC)}`;
      btn.disabled = false;
    } else if (minutesLeft > 0) {
      dot.classList.add("warning");
      text.textContent = `ending soon: ${formatGMT7(endUTC)}`;
      btn.disabled = false;
    } else {
      dot.classList.add("ended");
      text.textContent = "auction ended";
      btn.disabled = true;
    }
  });
}

function toGMT7(dateUTC) {
  return new Date(dateUTC.getTime() + 7 * 60 * 60 * 1000);
} // trả về giờ việt nam

function formatGMT7(dateUTC) {
  const d = toGMT7(dateUTC);
  const pad = (n) => String(n).padStart(2, "0");

  return (
    `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} GMT+7`
  );
}

//TEST SAMPLE
const testAuctions = [
  // ACTIVE (ends in days)
  { id: 1, endTime: "2025-12-22T10:00:00Z" },

  // ACTIVE (ends in hours)
  { id: 2, endTime: "2025-12-18T06:00:00Z" },

  // WARNING (ends in < 60 min)
  { id: 3, endTime: new Date(Date.now() + 45 * 60000).toISOString() },

  // WARNING (ends in < 5 min)
  { id: 4, endTime: new Date(Date.now() + 3 * 60000).toISOString() },

  // ENDED (already finished)
  { id: 5, endTime: new Date(Date.now() - 10 * 60000).toISOString() },
];
//cho bien gi do chứa các card rồi .forEach()
testAuctions.forEach((auction) => {
  const card = document.createElement("div");
  card.className = "card";

  card.dataset.end = auction.endTime; //truyen thoi gian end vào đây !!!
  //sửa href="link tới chi tiết sản phẩm đúng"
  card.innerHTML = `
    <div class="cardImg"><a href="#"><img src="./images/ea.png" /></a></div>
    <a href="#" class="cardName"><h1>${Name}</h1></a>
    <p>${author}</p>
    <h2>current bid: <b>${price}</b></h2>
    <hr />
    <div class="status">
        <span class="dot"></span>
        <p class="time-text"></p>
    </div>
    <button id="bid-btn">Bid now</button>
  `;

  grid.appendChild(card);
});

updateCards();
