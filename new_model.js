(async () => {
  const AUTH_STORAGE = JSON.parse(localStorage.getItem('auth-storage'));
  const CLIENT_KEY = "CAP-9C3B0E752F38D866518010D71238E7E288763ED3579031F654D82FB608E7973D";
  const SITE_KEY = "6LdyiGMsAAAAAJefesdWMjxy8pu3A3DmbeJkkdUl";
  const POOL_KEY = 'captcha_pool';

  const API = {
    CAPTCHA_CREATE: "https://api.capsolver.com/createTask",
    CAPTCHA_RESULT: "https://api.capsolver.com/getTaskResult",
    RESERVE_SLOT: "https://api.ivacbd.com/iams/api/v1/slots/reserveSlot",
    INITIATE: "https://api.ivacbd.com/iams/api/v1/payment/ssl/initiate"
  };

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // --- Pool Management ---
  const getPool = () => {
    try {
      return JSON.parse(localStorage.getItem(POOL_KEY) || "[]");
    } catch (e) { return []; }
  };

  const addToPool = (token) => {
    const pool = getPool();
    pool.push({ token, addedAt: Date.now() });
    localStorage.setItem(POOL_KEY, JSON.stringify(pool));
    console.log(`✅ Token Added. Current Pool: ${pool.length}`);
  };

  const popFromPool = () => {
    const pool = getPool();
    if (pool.length === 0) return null;
    const item = pool.shift();
    localStorage.setItem(POOL_KEY, JSON.stringify(pool));
    return item.token;
  };

  /*********************************
   * 1. TOKEN COLLECTOR
   *********************************/
  async function startCollector() {
    // Manual listener: Checks if you solved the on-screen captcha
    setInterval(() => {
      if (window.grecaptcha && typeof grecaptcha.getResponse === 'function') {
        const t = grecaptcha.getResponse();
        if (t) {
          console.log("🖐️ Manual solve detected!");
          addToPool(t);
          grecaptcha.reset();
        }
      }
    }, 1000);

    // Auto-solve loop: Keeps the pool filled to 5
    while (true) {
      if (getPool().length < 5) {
        try {
          console.log("🤖 CapSolver: Requesting new token...");
          const createRes = await fetch(API.CAPTCHA_CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              clientKey: CLIENT_KEY,
              task: { 
                type: "ReCaptchaV2TaskProxyLess", 
                websiteURL: "https://appointment.ivacbd.com", 
                websiteKey: SITE_KEY 
              }
            })
          });
          
          const createData = await createRes.json();
          const taskId = createData.taskId;

          if (!taskId) throw new Error("No TaskID received");

          let solved = false;
          while (!solved) {
            await sleep(3000); // Wait 3s between checks
            const checkRes = await fetch(API.CAPTCHA_RESULT, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clientKey: CLIENT_KEY, taskId })
            });
            
            const result = await checkRes.json();
            
            if (result.status === "ready") {
              console.log("🤖 CapSolver: Token ready!");
              addToPool(result.solution.gRecaptchaResponse);
              solved = true;
            } else if (result.status === "failed") {
              break; 
            }
          }
        } catch (e) {
          console.error("Collector Error:", e.message);
          await sleep(5000);
        }
      }
      await sleep(2000);
    }
  }

  /*********************************
   * 2. CONTINUOUS SENDER
   *********************************/
  async function startSender() {
    console.log("🚀 Sender active. Running every 2 seconds.");
    
    while (true) {
      const startTime = Date.now();
      const token = popFromPool();

      if (token) {
        console.log(`📡 Sending Reserve Request (Pool: ${getPool().length})`);
        try {
          const res = await fetch(API.RESERVE_SLOT, {
            method: "POST",
            headers: {
              "authorization": "Bearer " + AUTH_STORAGE.state.token,
              "content-type": "application/json",
            },
            body: JSON.stringify({ captchaToken: token })
          }).then(r => r.json());

          if (res?.message === "Slot reserved successfully") {
            console.log("🎯 SUCCESS! Initiating payment...");
            const pay = await fetch(API.INITIATE, {
              method: "POST",
              headers: { "authorization": "Bearer " + AUTH_STORAGE.state.token }
            }).then(r => r.json());
            
            if (pay?.data?.GatewayPageURL) {
              window.open(pay.data.GatewayPageURL, "_blank");
              return; 
            }
          } else {
            console.log("❌ Slot busy/Token rejected.");
          }
        } catch (e) {
          console.error("Network error.");
        }
      } else {
        console.warn("⚠️ Pool empty. Sender waiting...");
      }

      // Exact 2-second heartbeat
      const executionTime = Date.now() - startTime;
      await sleep(Math.max(0, 2000 - executionTime));
    }
  }

  // --- STARTUP ---
  console.log("🛠️ Initializing pool and collector...");
  startCollector();
  
  // Wait until we have exactly 5 tokens to start the 2s loop
  const bufferCheck = setInterval(() => {
    const count = getPool().length;
    console.clear();
    console.log(`📊 Status: Waiting for 5 tokens to start. Current: ${count}/5`);
    
    if (count >= 5) {
      clearInterval(bufferCheck);
      startSender();
    }
  }, 1000);

})();
