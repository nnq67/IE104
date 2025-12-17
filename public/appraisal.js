function generateAuctionHeadline(itemName, itemAuthor, desiredPrice) {
  const templates = [
    `You Won't Believe This ${itemName} by ${itemAuthor} Is Going For Only $${desiredPrice}!`,
    `SHOCKING: Why Collectors Are Scrambling For ${itemAuthor}'s ${itemName} (Starting at $${desiredPrice})`,
    `The $${desiredPrice} Secret: Is This ${itemName} by ${itemAuthor} The Steal Of The Century?`,
    `Is This ${itemAuthor}'s Masterpiece? Get This ${itemName} Now Before It Hits $${
      desiredPrice * 2
    }!`,
    `Billionaires Are MAD: This ${itemName} by ${itemAuthor} Is Listed For A Mere $${desiredPrice}!`,
  ];

  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

document.getElementById("generate-btn").addEventListener("click", () => {
  const itemName = document.getElementById("itemName").value;
  const itemAuthor = document.getElementById("itemAuthor").value;
  const itemPrice = document.getElementById("itemPrice").value;
  document.getElementById("result").innerHTML = generateAuctionHeadline(
    itemName,
    itemAuthor,
    itemPrice
  );
});

const imageInput = document.getElementById("imageInput");
const outputImage = document.getElementById("outputImage");

imageInput.onchange = function () {
  const [file] = imageInput.files;
  if (file) {
    outputImage.src = URL.createObjectURL(file);

    outputImage.style.display = "block";
  }
};
