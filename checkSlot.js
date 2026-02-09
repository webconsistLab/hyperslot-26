const CHECK_DELAY = 2000;

async function checkSlotOpen() {
  try {
    const res = await fetch(
      "https://api.ivacbd.com/iams/api/v1/file/file-confirmation-and-slot-status",
      {
        method: "GET",
        mode: "cors",
        referrer: "https://appointment.ivacbd.com/",
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,bn;q=0.8,de;q=0.7,es;q=0.6",
          "authorization": "Bearer "+JSON.parse(localStorage.getItem('auth-storage')).state.token,
          "cache-control": "no-cache, no-store, must-revalidate",
          "pragma": "no-cache",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site"
        }
      }
    );

    const json = await res.json();
    const slotOpen = json?.data?.slotOpen;

    console.log("slotOpen:", slotOpen);

    if (slotOpen === true) {
      console.log(true); // 🎯 FOUND
      return;
    }

  } catch (err) {
    console.error("Request failed:", err);
  }

  // retry after 5s
  setTimeout(checkSlotOpen, CHECK_DELAY);
}

// start checking
checkSlotOpen();
