(async () => {
  console.log("🔍 Waiting for user to solve captcha...");

  // Wait until grecaptcha is loaded
  while (typeof grecaptcha === "undefined") {
    await new Promise(r => setTimeout(r, 100));
  }

  // Wait for user to solve captcha
  const captchaToken = await new Promise(resolve => {
    const checkToken = () => {
      const token = grecaptcha.getResponse();
      if (token) {
        resolve(token);
      } else {
        requestAnimationFrame(checkToken); // Poll next frame without interval
      }
    };
    checkToken();
  });

  // Save token immediately
  localStorage.setItem("captchaToken", captchaToken);
  console.log("✅ Captcha solved! Token saved:", captchaToken);
})();


async function getCaptchaToken() {
  
  let token = localStorage.getItem("captchaToken");

  if (token) {
    console.log("✅ Using existing captcha token from localStorage");
    // Optionally remove it if you want one-time use
    // localStorage.removeItem("captchaToken");
    return token;
  }

  console.log("⏳ No token found, solving captcha...");
  token = await solveAction();

  if (token) {
    localStorage.setItem("captchaToken", token);
    console.log("✅ New captcha token saved to localStorage");
  }

  return token;
}

(async () => {
  
  const AUTH_STORAGE = JSON.parse(localStorage.getItem('auth-storage'));
  const CLIENT_KEY = "CAP-9C3B0E752F38D866518010D71238E7E288763ED3579031F654D82FB608E7973D";
  const SITE_KEY = "6LdyiGMsAAAAAJefesdWMjxy8pu3A3DmbeJkkdUl";

  const API = {
    CAPTCHA_CREATE: "https://api.capsolver.com/createTask",
    CAPTCHA_RESULT: "https://api.capsolver.com/getTaskResult",
    RESERVE_SLOT: "https://api.ivacbd.com/iams/api/v1/slots/reserveSlot",
    INITIATE: "https://api.ivacbd.com/iams/api/v1/payment/ssl/initiate"
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /***********************
   * STEP 1: SOLVE CAPTCHA
   ***********************/
  async function solveAction() {
    const createRes = await fetch(API.CAPTCHA_CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientKey: CLIENT_KEY,
        task: {
          type: "ReCaptchaV2TaskProxyLess",
          websiteURL: "https://appointment.ivacbd.com",
          websiteKey: SITE_KEY,
          pageAction: "login"
        }
      })
    });

    const { taskId } = await createRes.json();

    while (true) {
      await sleep(1000);

      const resultRes = await fetch(API.CAPTCHA_RESULT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: CLIENT_KEY,
          taskId
        })
      });

      const result = await resultRes.json();

      if (result.status === "ready") {
        localStorage.setItem('captchaToken', result.solution.gRecaptchaResponse)
        return result.solution.gRecaptchaResponse;
      }
    }
  }

  /***********************
   * STEP 2: RESERVE SLOT
   ***********************/
  async function reserveSlot(captchaToken) {
    return fetch(API.RESERVE_SLOT, {
      method: "POST",
      mode: "cors",
      headers: {
        "accept": "application/json, text/plain, */*",
        "accept-language": "en-US,en;q=0.9",
        "authorization": "Bearer " + AUTH_STORAGE.state.token,
        "cache-control": "no-cache, no-store, must-revalidate",
        "content-type": "application/json",
        "pragma": "no-cache",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      referrer: "https://appointment.ivacbd.com/appointment/time-slot",
      body: JSON.stringify({ captchaToken })
    }).then(r => r.json());
  }

  /***********************
   * STEP 3: INITIATE PAYMENT
   ***********************/
  async function initiatePayment() {
    return fetch(API.INITIATE, {
      method: "POST",
      mode: "cors",
      headers: {
        "accept": "application/json, text/plain, */*",
        "authorization": "Bearer " + AUTH_STORAGE.state.token,
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site"
      },
      referrer: "https://appointment.ivacbd.com/appointment/continue-payment",
      body: null
    }).then(r => r.json());
  }

  /***********************
   * MAIN AUTOMATION LOOP
   ***********************/
  let attempt = 0;

  while (true) {
    attempt++;
    console.log(`🔁 Attempt #${attempt}`);

    // 1️⃣ CAPTCHA
    const captchaToken = await getCaptchaToken();

    // 2️⃣ RESERVE SLOT
    const reserveRes = await reserveSlot(captchaToken);

    if (
      reserveRes?.message === "Slot reserved successfully" &&
      reserveRes?.reservationId
    ) {
      console.log("🎉 Slot reserved");

      // 3️⃣ INITIATE PAYMENT
      const paymentRes = await initiatePayment();

      // ✅ EXACT LOGIC YOU ASKED FOR
      if (paymentRes?.data?.GatewayPageURL) {
        window.open(paymentRes.data.GatewayPageURL, "_blank");
      } else {
        console.error("No Gateway Page URL received");
        alert("Payment initiation failed. Please try again.");
      }

      break;
    }

    // Retry if slot not available
    if (reserveRes?.reservationId === null) {
      console.log("❌ Slot unavailable, retrying...");
      localStorage.removeItem('captchaToken');
      await sleep(5000);
    }
  }
})();
