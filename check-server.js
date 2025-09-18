const http = require('http');

const checkServer = () => {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`Server Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('✅ Development server is running at http://localhost:3000');
    }
  });

  req.on('error', (error) => {
    console.log('⏳ Server is starting up... Please wait a moment.');
    console.log('   If it takes too long, check the terminal for any errors.');
  });

  req.end();
};

// Check immediately
checkServer();

// Check again after 5 seconds
setTimeout(() => {
  console.log('\nChecking again...');
  checkServer();
}, 5000);
