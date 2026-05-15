async function run() {
  try {
    const email = `testflow${Date.now()}@example.com`;
    const pwd = 'password123';

    // 1. Register
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Flow Test',
        email,
        password: pwd,
        role: 'student',
        studentDetails: {
          collegeName: 'Flow College',
          mobileNumber: '5551112222'
        }
      })
    });
    const regData = await regRes.json();
    console.log('Register returns mobileNumber:', regData.user.studentDetails.mobileNumber);

    // 2. Login
    const logRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pwd })
    });
    const logData = await logRes.json();
    console.log('Login returns mobileNumber:', logData.user.studentDetails.mobileNumber);

  } catch(e) {
    console.error(e);
  }
}
run();
