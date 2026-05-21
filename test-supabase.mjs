import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing connection to Supabase...')
  // Test 1: Can we fetch something public? Or just check auth?
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123'
  })
  
  if (error) {
    console.log('Login failed (Expected if user does not exist):', error.message)
  } else {
    console.log('Login succeeded!')
  }

  // Create a random user to see if the trigger fails
  const randomEmail = `test_${Date.now()}@example.com`
  console.log(`\nTesting signup with ${randomEmail}...`)
  const signupResult = await supabase.auth.signUp({
    email: randomEmail,
    password: 'password123',
    options: {
      data: {
        username: 'testuser'
      }
    }
  })

  if (signupResult.error) {
    console.error('Signup failed! Error:', signupResult.error.message)
  } else {
    console.log('Signup succeeded!')
    console.log('Session returned?', !!signupResult.data.session)
  }
}

test()
