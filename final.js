(async () => {
  /* --- CONFIGURATION --- */
  const phone = "01764806080";
  const password = "Msd@458@";
  const CLIENT_KEY = "CAP-9C3B0E752F38D866518010D71238E7E288763ED3579031F654D82FB608E7973D";
  const SITE_KEY = "6LdyiGMsAAAAAJefesdWMjxy8pu3A3DmbeJkkdUl";
  const POOL_KEY = 'captcha_pool';

  const API = {
    SIGNIN: "https://api.ivacbd.com/iams/api/v1/auth/signin",
    GET_OTP: "https://hyperslot-otp-358970714333.us-central1.run.app/otp/read?phone=" + phone,
    VERIFY_OTP: "https://api.ivacbd.com/iams/api/v1/otp/verifySigninOtp",
    CAPTCHA_CREATE: "https://api.capsolver.com/createTask",
    CAPTCHA_RESULT: "https://api.capsolver.com/getTaskResult",
    RESERVE_SLOT: "https://api.ivacbd.com/iams/api/v1/slots/reserveSlot",
    INITIATE: "https://api.ivacbd.com/iams/api/v1/payment/ssl/initiate"
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  /* --- POOL HELPERS --- */
  const getPool = () => JSON.parse(localStorage.getItem(POOL_KEY) || "[]");
  const addToPool = (token) => {
    const pool = getPool();
    pool.push({ token, addedAt: Date.now() });
    localStorage.setItem(POOL_KEY, JSON.stringify(pool));
    console.log(`✅ Token Added. Pool: ${pool.length}`);
  };
  const popFromPool = () => {
    const pool = getPool();
    if (pool.length === 0) return null;
    const item = pool.shift();
    localStorage.setItem(POOL_KEY, JSON.stringify(pool));
    return item.token;
  };

  /* ---------------------------------------------------------
     PHASE 1: AUTH CHECK / LOGIN
  --------------------------------------------------------- */
  let accessToken = null;
  const storedAuth = JSON.parse(localStorage.getItem("auth-storage"));
  
  if (storedAuth?.state?.token) {
    console.log("🔄 Existing session found. Skipping login...");
    accessToken = storedAuth.state.token;
  } else {
    console.log("🚀 No session. Starting Login Phase...");
    const signinRes = await fetch(API.SIGNIN, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone, password })
    }).then(r => r.json());

    if (!signinRes?.data?.accessToken) return console.error("❌ Signin failed");

    const tempToken = signinRes.data.accessToken;
    const requestId = signinRes.data.requestId;

    let otp = null;
    for (let i = 0; i < 15; i++) {
      const otpRes = await fetch(API.GET_OTP).then(r => r.json());
      if (otpRes?.otp) { otp = otpRes.otp; break; }
      console.log("⏳ Waiting for OTP...");
      await sleep(2000);
    }

    if (!otp) return console.error("❌ OTP Timeout");
    
    const verifyRes = await fetch(API.VERIFY_OTP, {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": "Bearer " + tempToken },
      body: JSON.stringify({ requestId, phone, code: otp, otpChannel: "PHONE" })
    }).then(r => r.json());

    if (!verifyRes?.data?.verified) return console.error("❌ Verification failed");
    
    accessToken = tempToken;
    localStorage.setItem("auth-storage", JSON.stringify({ state: { token: accessToken }, version: 0 }));
    console.log("🎉 Login Successful.");
  }

  /* ---------------------------------------------------------
     PHASE 2: CAPTCHA LISTENERS (Manual & Auto)
  --------------------------------------------------------- */
  
  // Manual Listener (Checks if you solved captcha on screen)
  setInterval(() => {
    try {
      if (window.grecaptcha && typeof window.grecaptcha.getResponse === 'function') {
        const t = window.grecaptcha.getResponse();
        if (t && t.length > 10) {
          addToPool(t);
          window.grecaptcha.reset();
        }
      }
    } catch (e) {}
  }, 1000);

  // Auto Solver (CapSolver)
  async function startCollector() {
    while (true) {
      if (getPool().length < 3) {
        try {
          const create = await fetch(API.CAPTCHA_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientKey: CLIENT_KEY,
              task: { type: "ReCaptchaV2TaskProxyLess", websiteURL: "https://appointment.ivacbd.com", websiteKey: SITE_KEY }
            })
          }).then(r => r.json());

          if (create.taskId) {
            let solved = false;
            while (!solved) {
              await sleep(4000);
              const result = await fetch(API.CAPTCHA_RESULT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ clientKey: CLIENT_KEY, taskId: create.taskId })
              }).then(r => r.json());

              if (result.status === "ready") {
                addToPool(result.solution.gRecaptchaResponse);
                solved = true;
              } else if (result.status === "failed") break;
            }
          }
        } catch (e) {}
      }
      await sleep(3000);
    }
  }

  /* ---------------------------------------------------------
     PHASE 3: RESERVATION LOOP WITH RATE-LIMIT HANDLING
  --------------------------------------------------------- */
  async function startSender() {
    console.log("📡 Reservation loop active...");
    while (true) {
      const token = popFromPool();
      if (token) {
        try {
          const response = await fetch(API.RESERVE_SLOT, {
            method: "POST",
            headers: { "authorization": "Bearer " + accessToken, "content-type": "application/json" },
            body: JSON.stringify({ captchaToken: token })
          });

          // Handle 429 Too Many Requests
          if (response.status === 429) {
            console.warn("⚠️ Rate limited (429). Retrying in 10 seconds...");
            addToPool(token); // Put the token back so it's not wasted
            await sleep(10000);
            continue; 
          }

          const res = await response.json();

          if (res?.message?.includes("successfully") || res?.data?.reservationId) {
            console.log("🎯 SLOT SECURED! Initiating payment...");
            const pay = await fetch(API.INITIATE, {
              method: "POST",
              headers: { "authorization": "Bearer " + accessToken }
            }).then(r => r.json());

            if (pay?.data?.GatewayPageURL) {
              window.location.href = pay.data.GatewayPageURL;
              return;
            }
          } else if (res?.statusCode === 401) {
            console.error("⛔ Session expired.");
            localStorage.removeItem("auth-storage");
            return;
          } else {
            console.log("❌ Slot busy:", res.message);
          }
        } catch (e) { 
          console.error("Network Error during reservation."); 
          await sleep(2000);
        }
      }
      await sleep(1500);
    }
  }

  startCollector();
  startSender();
})();
