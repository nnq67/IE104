const API_KEY = "AIzaSyBv0RWd2CYVDxa0b4ui-bWcIMzcPgqNLx4"; 

const GEN_MODEL = "gemini-flash-latest";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEN_MODEL}:generateContent?key=${API_KEY}`;

async function generateAuctionHeadlineWithGemini(itemName, itemAuthor, desiredPrice) {
  const prompt = `
    Viết một đoạn miêu tả sản phẩm đấu giá (description) xúc tích, chuyên nghiệp, hấp dẫn bằng tiếng Anh cho:
    Item: ${itemName}
    Brand/Author: ${itemAuthor}
    Starting Price: $${desiredPrice}
    Chỉ trả về text của miêu tả, không có dấu ngoặc kép, hay in đậm gì cả.
  `;

  const requestBody = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  console.log("Sending a request to the AI...", requestBody);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("Error data:", errorData);
    throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("The AI ​​returned no results. (Blocked or Empty).");
  }

  return data.candidates[0].content.parts[0].text.trim();
}

document.getElementById("generate-btn").addEventListener("click", async () => {
  const itemName = document.getElementById("itemName").value;
  const itemAuthor = document.getElementById("itemAuthor").value;
  const itemPrice = document.getElementById("itemPrice").value;
  
  const resultDiv = document.getElementById("result");
  const headlineText = document.getElementById("headlineText");

  headlineText.innerHTML = "";
  headlineText.style.color = "#333";

  if (!itemName || !itemAuthor || !itemPrice) {
    alert("Please fill in all the information!");
    return;
  }

  const btn = document.getElementById("generate-btn");
  const originalBtnText = btn.innerText;
  btn.innerText = "Generating...";
  btn.disabled = true;
  headlineText.innerHTML = "<i>Please wait...</i>";

  try {
    const aiHeadline = await generateAuctionHeadlineWithGemini(itemName, itemAuthor, itemPrice);
    
    headlineText.innerText = aiHeadline;
    headlineText.style.fontWeight = "normal";
    headlineText.style.fontSize = "1.2em";
    
  } catch (error) {
    console.error(error);
    headlineText.innerHTML = `<span style="color: red; font-weight: bold;">LỖI: ${error.message}</span>`;
  } finally {
    // Khôi phục nút bấm
    btn.innerText = originalBtnText;
    btn.disabled = false;
  }
});

// Logic xử lý ảnh
const imageInput = document.getElementById("imageInput");
const outputImage = document.getElementById("outputImage");

imageInput.onchange = function () {
  const [file] = imageInput.files;
  if (file) {
    outputImage.src = URL.createObjectURL(file);
    outputImage.style.display = "block";
  }
};