const http = require('http');
const app = require('../server');

async function runTests() {
  console.log('--- Starting Comprehensive Vibely API Verification Tests ---');

  // Start server on random ephemeral port
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`Test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200 && healthJson.status === 'ok', '1. API Health Check');

    // 2. Register User A (Alice)
    const uniqueSuffix = Date.now();
    const aliceData = {
      name: 'Alice Tester',
      username: `alice_${uniqueSuffix}`,
      email: `alice_${uniqueSuffix}@example.com`,
      password: 'SecurePassword123!',
      bio: 'Test bio for Alice'
    };
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aliceData)
    });
    const regJson = await regRes.json();
    assert(regRes.status === 201 && regJson.token && regJson.user.username === aliceData.username, '2. Registration with valid credentials works');
    const tokenA = regJson.token;
    const userA = regJson.user;

    // 3. Duplicate registration rejected
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aliceData)
    });
    assert(dupRes.status === 409, '3. Duplicate username/email registration rejected');

    // 4. Login with correct credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: aliceData.email, password: aliceData.password })
    });
    const loginJson = await loginRes.json();
    assert(loginRes.status === 200 && loginJson.token, '4. Login with valid credentials works');

    // 5. Login with incorrect password rejected
    const badLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: aliceData.email, password: 'WrongPassword999!' })
    });
    assert(badLogin.status === 401, '5. Incorrect credentials rejected with 401');

    // 6. Protected route rejects missing/invalid token
    const unauthRes = await fetch(`${baseUrl}/auth/me`);
    assert(unauthRes.status === 401, '6. Protected route rejects request without token');

    // 7. Protected route succeeds with valid token
    const authMeRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    const authMeJson = await authMeRes.json();
    assert(authMeRes.status === 200 && authMeJson.user.id === userA.id, '7. /api/auth/me returns authenticated user');

    // 8. Register User B (Bob)
    const bobData = {
      name: 'Bob Tester',
      username: `bob_${uniqueSuffix}`,
      email: `bob_${uniqueSuffix}@example.com`,
      password: 'SecurePassword123!',
      bio: 'Test bio for Bob'
    };
    const regBob = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bobData)
    });
    const bobJson = await regBob.json();
    const tokenB = bobJson.token;
    const userB = bobJson.user;
    assert(regBob.status === 201 && userB.id !== userA.id, '8. User B created for multi-user tests');

    // 9. Alice creates a post
    const postRes = await fetch(`${baseUrl}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ content: 'Hello Vibely! This is a test post by Alice.' })
    });
    const postJson = await postRes.json();
    assert(postRes.status === 201 && postJson.post && postJson.post.content.includes('Hello Vibely'), '9. Authenticated user can create post');
    const postId = postJson.post.id;

    // 10. Bob likes Alice's post
    const likeRes = await fetch(`${baseUrl}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const likeJson = await likeRes.json();
    assert(likeRes.status === 201 && likeJson.liked === true && likeJson.likes_count === 1, '10. User can like a post');

    // 11. Duplicate like is prevented cleanly
    const dupLikeRes = await fetch(`${baseUrl}/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const dupLikeJson = await dupLikeRes.json();
    assert(dupLikeJson.likes_count === 1, '11. Duplicate like prevented (count remains 1)');

    // 12. Bob unlikes Alice's post
    const unlikeRes = await fetch(`${baseUrl}/posts/${postId}/like`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const unlikeJson = await unlikeRes.json();
    assert(unlikeRes.status === 200 && unlikeJson.liked === false && unlikeJson.likes_count === 0, '12. User can unlike a post');

    // 13. Bob comments on Alice's post
    const commentRes = await fetch(`${baseUrl}/posts/${postId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenB}`
      },
      body: JSON.stringify({ content: 'Awesome post Alice! Keep vibrating!' })
    });
    const commentJson = await commentRes.json();
    assert(commentRes.status === 201 && commentJson.comment && commentJson.comments_count === 1, '13. User can comment on a post');
    const commentId = commentJson.comment.id;

    // 14. Alice cannot delete Bob's comment
    const illegalDelComment = await fetch(`${baseUrl}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(illegalDelComment.status === 403, '14. User cannot delete another user comment (403)');

    // 15. Bob can delete his own comment
    const legalDelComment = await fetch(`${baseUrl}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const legalDelJson = await legalDelComment.json();
    assert(legalDelComment.status === 200 && legalDelJson.comments_count === 0, '15. User can delete own comment');

    // 16. Self-follow prevention
    const selfFollow = await fetch(`${baseUrl}/users/${userA.id}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(selfFollow.status === 400, '16. Users cannot follow themselves (400)');

    // 17. Bob follows Alice
    const followRes = await fetch(`${baseUrl}/users/${userA.id}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const followJson = await followRes.json();
    assert(followRes.status === 201 && followJson.following === true && followJson.followers_count >= 1, '17. User can follow another user');

    // 18. Duplicate follow handled
    const dupFollow = await fetch(`${baseUrl}/users/${userA.id}/follow`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(dupFollow.status === 200, '18. Duplicate follow prevented safely');

    // 19. Bob unfollows Alice
    const unfollowRes = await fetch(`${baseUrl}/users/${userA.id}/follow`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    const unfollowJson = await unfollowRes.json();
    assert(unfollowRes.status === 200 && unfollowJson.following === false, '19. User can unfollow another user');

    // 20. Update current user profile
    const updateRes = await fetch(`${baseUrl}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenA}`
      },
      body: JSON.stringify({ name: 'Alice Updated', bio: 'New updated biography!' })
    });
    const updateJson = await updateRes.json();
    assert(updateRes.status === 200 && updateJson.user.name === 'Alice Updated' && updateJson.user.bio === 'New updated biography!', '20. User can update profile name and bio');

    // 21. Bob cannot delete Alice's post
    const illegalDelPost = await fetch(`${baseUrl}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenB}` }
    });
    assert(illegalDelPost.status === 403, '21. User cannot delete another user post (403)');

    // 22. Alice can delete her own post
    const legalDelPost = await fetch(`${baseUrl}/posts/${postId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenA}` }
    });
    assert(legalDelPost.status === 200, '22. User can delete own post');

    // 23. Explore search
    const searchRes = await fetch(`${baseUrl}/users?q=Alice`);
    const searchJson = await searchRes.json();
    assert(searchRes.status === 200 && searchJson.users.some(u => u.username === aliceData.username), '23. Explore user search returns matching users');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log('==================================================');
    console.log(`API Verification Complete: ${passed} passed, ${failed} failed.`);
    console.log('==================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
