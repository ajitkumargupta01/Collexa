async function run() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'John Doe',
        email: `john${Date.now()}@example.com`,
        password: 'password123',
        role: 'student',
        studentDetails: {
          collegeName: 'Test College',
          mobileNumber: '1234567890'
        }
      })
    });
    const text = await res.text();
    console.log('Register Response:', text);
  } catch(e) {
    console.error(e);
  }
}
run();
