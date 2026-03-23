import autocannon from 'autocannon';
import { exit } from 'process';

function runLoadTest() {
  const instance = autocannon({
    url: 'http://localhost:3000',
    connections: 50, // Sustained
    duration: 15,
    pipelining: 1,
    requests: [
      {
        method: 'POST',
        path: '/api/v1/auth/login',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'vinayakjatti044@gmail.com',
          password: 'Vinu@1234'
        })
      },
      {
          method: 'GET',
          path: '/api/v1/feed'
      }
    ]
  }, (err, result) => {
    if (err) {
      console.error("AUTOCANNON ERROR:", err);
      exit(1);
    }
    console.log("LOAD TEST COMPLETED.");
    console.log(autocannon.printResult(result));
    exit(0);
  });

  autocannon.track(instance, { renderProgressBar: true });
}

runLoadTest();
