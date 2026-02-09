const phone = "01764806080";
const password = "Msd@458@";

const signin = "https://api.ivacbd.com/iams/api/v1/auth/signin";
const getOtp = "https://hyperslot-otp-358970714333.us-central1.run.app/otp/read?phone=" + phone;
const verifyOtp = "https://api.ivacbd.com/iams/api/v1/otp/verifySigninOtp";

(async () => {
  console.log("🚀 Auto login started");

  /* -------------------- STEP 1: SIGN IN -------------------- */
  const signinRes = await fetch(signin, {
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,bn;q=0.8,de;q=0.7,es;q=0.6",
      "cache-control": "no-cache, no-store, must-revalidate",
      "content-type": "application/json",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    referrer: "https://appointment.ivacbd.com/",
    body: JSON.stringify({ phone, password }),
    method: "POST",
    mode: "cors",
    credentials: "omit"
  });

  const signinJson = await signinRes.json();
  if (!signinJson?.data?.accessToken) {
    console.error("❌ Signin failed", signinJson);
    return;
  }

  const accessToken = signinJson.data.accessToken;
  const requestId = signinJson.data.requestId;

  /* save token same way app does */
  localStorage.setItem(
    "auth-storage",
    JSON.stringify({
      state: { token: accessToken },
      version: 0
    })
  );

  console.log("✅ Signin OK");
  console.log("🔐 Token saved");
  console.log("🆔 requestId:", requestId);

  /* -------------------- STEP 2: READ OTP -------------------- */
  let otp = null;

  for (let i = 0; i < 10; i++) {
    const otpRes = await fetch(getOtp);
    const otpJson = await otpRes.json();

    if (otpJson?.otp) {
      otp = otpJson.otp;
      console.log("📩 OTP received:", otp);
      break;
    }

    console.log("⏳ Waiting for OTP...");
    await new Promise(r => setTimeout(r, 1500));
  }

  if (!otp) {
    console.error("❌ OTP not received");
    return;
  }

  /* -------------------- STEP 3: VERIFY OTP -------------------- */
  const verifyRes = await fetch(verifyOtp, {
    headers: {
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-US,en;q=0.9,bn;q=0.8,de;q=0.7,es;q=0.6",
      "authorization": "Bearer " + accessToken,
      "cache-control": "no-cache, no-store, must-revalidate",
      "content-type": "application/json",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site"
    },
    referrer: "https://appointment.ivacbd.com/verify-login-phone-otp",
    body: JSON.stringify({
      requestId,
      phone,
      code: otp,
      otpChannel: "PHONE"
    }),
    method: "POST",
    mode: "cors"
  });

  const verifyJson = await verifyRes.json();

  if (verifyJson?.data?.verified) {
    console.log("🎉 LOGIN SUCCESS");
  } else {
    console.error("❌ OTP verification failed", verifyJson);
  }
})();
