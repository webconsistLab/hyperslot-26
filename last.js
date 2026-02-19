fetch("https://api.ivacbd.com/iams/api/v1/otp/sendOtp", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,bn;q=0.8,de;q=0.7,es;q=0.6",
    "authorization": "Bearer eyJraWQiOiJpYW0tand0LXJzYS0xIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3OGUzNDM1Zi1mYmNkLTQ2NzktYWFmYy0zYWM3YjhlMGNlZjQiLCJhdWQiOiJpYW1zLWFwaSIsInJvbGVzIjpbXSwiaXNzIjoiaWFtcyIsImV4cCI6MTc3MTQ1MzkxNiwiaWF0IjoxNzcxNDUzMDE2LCJqdGkiOiI1NmI2ODE5Yy01MzMzLTQ1ZWUtYjRmMC0yOWExYmEwZTcyOTkiLCJzaWQiOiI1YzNiOWFjNi0yMzcyLTRlZGEtOTY0MC1hYWRiZGU2YjU1YjEifQ.sXV1U4m9Fo5iOGDN1ugfuP1xtUd6hsWqPkdFHfMhBSUmpVAuX0x4Ht6yEu3aVzKph_gRwNnU6pzK9_8YC-OqiGMCA80IYYC5hXfpCAtv8gNGYeseC13q3Iet-InstFeSNg5qDoE4DDkuO18AKoxZovMzzVUwoutsRmZSHIHUxBOvOmaISuJB4oLe9zkS_mGHUqBCBsFAtNVQNDQ7hanAHpZH9mRrYp9JiwH8PDEEpd0VqPfbsRc0eV-rdKyXMzXIy-uf98PiiGI2204MV7hOzQWc-ZJThP4tPrvCF_Edt5lqos8vBkqJ2AVTIPvgaSFusXBhdgd3LDf88Yaqh8TnFg",
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
  "referrer": "https://appointment.ivacbd.com/",
  "body": "{\"requestId\":\"5df608a4-4617-4f38-befa-6b12d6358f89\",\"phone\":\"01764806080\",\"otp_code\":\"739242\",\"otpChannel\":\"PHONE\"}",
  "method": "POST"
});

fetch("https://api.ivacbd.com/iams/api/v1/otp/verifySigninOtp", {
  "headers": {
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9,bn;q=0.8,de;q=0.7,es;q=0.6",
    "authorization": "Bearer eyJraWQiOiJpYW0tand0LXJzYS0xIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI3OGUzNDM1Zi1mYmNkLTQ2NzktYWFmYy0zYWM3YjhlMGNlZjQiLCJhdWQiOiJpYW1zLWFwaSIsInJvbGVzIjpbXSwiaXNzIjoiaWFtcyIsImV4cCI6MTc3MTQ1MzkxNiwiaWF0IjoxNzcxNDUzMDE2LCJqdGkiOiI1NmI2ODE5Yy01MzMzLTQ1ZWUtYjRmMC0yOWExYmEwZTcyOTkiLCJzaWQiOiI1YzNiOWFjNi0yMzcyLTRlZGEtOTY0MC1hYWRiZGU2YjU1YjEifQ.TkGavLFbEoW0NoxkBLgU98eLHCIaDzeLQxWgjHr5FUT-NVc96ye1qArphCSusvrvDALd1snx7jN1OoNbKsALBQG7OFYPrwxveBAY-L96n4GpPxiez5BVGjQSzKOmJmsh07sgS5XJJOXEOywszenhyvF90JNLqhLmWWfK-Vht2dNF3uXa8Wfm1ISCfKhkJnC1qAVNmg3XoNkMeRNwIn3cnIwNYjEOVs4W_4UJ1VY7FJC2sJ-ZDxIM0M8lTVmXNQ49jvxtJ2ofIiK2OGaYfAh_ba0l45rbTI4QiqVSEkkyrWE4mFWL87SwjbA2D3FOoCOMaDeeHwJ3WrfVQ86cRz19Eg",
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
  "referrer": "https://appointment.ivacbd.com/",
  "body": "{\"requestId\":\"1cd766ae-db8d-4b7e-8c36-22bf8d10c6a7\",\"phone\":\"01764806080\",\"code\":\"509497\",\"otpChannel\":\"PHONE\"}",
  "method": "POST"
});

 const res = await fetch(
      "https://api.ivacbd.com/iams/api/v1/file/file-confirmation-and-slot-status",
      {
        method: "GET",
        mode: "cors",
        referrer: "https://appointment.ivacbd.com/",
        headers: {
          "accept": "application/json, text/plain, */*",
          "accept-language": "en-US,en;q=0.9,bn;q=0.8,de;q=0.7,es;q=0.6",
          "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIiwia2lkIjoiaWFtLWp3dC1yc2EtMSJ9.eyJzdWIiOiI3OGUzNDM1Zi1mYmNkLTQ2NzktYWFmYy0zYWM3YjhlMGNlZjQiLCJhdWQiOiJpYW1zLWFwaSIsImlzcyI6ImlhbXMiLCJpYXQiOjE3NzE0NTg5MzQsImV4cCI6MTc3MTU0NTMzNCwic2lkIjoiMzJkYjlmNjYtYjdlYy1sZTA0LThiZTItYzBjNmI3NTI5Y2I1Iiwicm9sZXMiOltdfQ",
          "cache-control": "no-cache, no-store, must-revalidate",
          "pragma": "no-cache",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-site"
        }
      }
    );

    const json = await res.json();
json
