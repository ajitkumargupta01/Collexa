async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Mobile',
        email: `test${Date.now()}@test.com`,
        password: 'password123',
        role: 'student',
        studentDetails: {
          collegeName: 'Test College',
          mobileNumber: '9998887776'
        }
      })
    });
    const data = await res.json();
    console.log('Registration Response User:', JSON.stringify(data.user, null, 2));

    const resMe = await fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${data.token}` }
    });
    const dataMe = await resMe.json();
    console.log('GetMe Response User:', JSON.stringify(dataMe.data, null, 2));
  } catch (err) {
    console.error(err);
  }
}
test();
