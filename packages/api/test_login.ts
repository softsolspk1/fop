import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const API_URL = `http://localhost:${process.env.PORT || 4000}`;

async function testLogin() {
  console.log('--- Testing Login Reproduction ---');
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'student@uok.edu.pk',
      password: '123456'
    });
    console.log('Login Success:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Login Failed with Status:', error.response.status);
      console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
  }
}

testLogin();
