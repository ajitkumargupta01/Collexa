async function test() {
  try {
    const email = `student${Date.now()}@test.com`;
    const password = 'password123';

    console.log(`Registering ${email}...`);
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Student',
        email,
        password,
        role: 'student',
        studentDetails: {
          collegeName: 'Test College',
          mobileNumber: '9998887776'
        }
      })
    });
    
    let regData;
    try {
      regData = await regRes.json();
    } catch (e) {
      console.log('Failed to parse register response text:', await regRes.text());
      throw e;
    }
    console.log('Register successful:', regData.success);

    console.log(`Logging in...`);
    const logRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password
      })
    });
    let logData;
    try {
      logData = await logRes.json();
    } catch (e) {
      console.log('Failed to parse login response text:', await logRes.text());
      throw e;
    }
    console.log('Login successful:', logData.success);

  } catch (err) {
    console.error('Error:', err.message);
  }
}
test();
