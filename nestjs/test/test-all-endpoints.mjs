const BASE_URL = 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const response = await fetch(url, { ...options, headers });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { status: response.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FALLÓ: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
}

async function runTests() {
  console.log('--- INICIANDO PRUEBAS DE ENDPOINTS Y MANEJO DE CONFLICTOS ---\n');

  // ==========================================
  // 1. PRUEBAS PARA CATEGORIES
  // ==========================================
  console.log('▶ [1/5] Pruebas en /categories');
  const catGetAll = await request('/categories');
  assert(catGetAll.status === 200, 'GET /categories responde 200 OK');

  const randomSlug = `test-cat-${Date.now()}`;
  const catCreate = await request('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: `Cat Test ${Date.now()}`,
      slug: randomSlug,
      icon: 'star',
      displayOrder: 99,
    }),
  });
  assert(catCreate.status === 201, 'POST /categories responde 201 Created');
  const createdCategory = catCreate.data;

  // Probar conflicto único (mismo slug o nombre)
  const catConflict = await request('/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: createdCategory.name,
      slug: randomSlug,
      icon: 'star',
    }),
  });
  assert(
    catConflict.status === 409,
    `POST /categories duplicado responde 409 Conflict correctamente (Status: ${catConflict.status}, Msg: ${catConflict.data?.message})`,
  );

  const catGetOne = await request(`/categories/${createdCategory.id}`);
  assert(catGetOne.status === 200, 'GET /categories/:id responde 200 OK');

  const catPatch = await request(`/categories/${createdCategory.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name: `Cat Updated ${Date.now()}` }),
  });
  assert(catPatch.status === 200, 'PATCH /categories/:id responde 200 OK');

  // ==========================================
  // 2. PRUEBAS PARA USERS
  // ==========================================
  console.log('\n▶ [2/5] Pruebas en /users');
  const usersGetAll = await request('/users');
  assert(usersGetAll.status === 200, 'GET /users responde 200 OK');

  const randomEmail = `usuario_${Date.now()}@test.com`;
  const userCreate = await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      email: randomEmail,
      fullName: 'Usuario Prueba',
      password: 'password123',
    }),
  });
  assert(userCreate.status === 201, 'POST /users responde 201 Created');
  const createdUser = userCreate.data;

  // Probar conflicto único (mismo correo)
  const userConflict = await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      email: randomEmail,
      fullName: 'Usuario Clon',
      password: 'password123',
    }),
  });
  assert(
    userConflict.status === 409,
    `POST /users con email duplicado responde 409 Conflict correctamente (Status: ${userConflict.status}, Msg: ${userConflict.data?.message})`,
  );

  const userGetOne = await request(`/users/${createdUser.id}`);
  assert(userGetOne.status === 200, 'GET /users/:id responde 200 OK');

  const userPatch = await request(`/users/${createdUser.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ fullName: 'Usuario Prueba Actualizado' }),
  });
  assert(userPatch.status === 200, 'PATCH /users/:id responde 200 OK');

  // ==========================================
  // 3. PRUEBAS PARA PLACES
  // ==========================================
  console.log('\n▶ [3/5] Pruebas en /places');
  const placesGetAll = await request('/places');
  assert(placesGetAll.status === 200, 'GET /places responde 200 OK');

  const placeCreate = await request('/places', {
    method: 'POST',
    body: JSON.stringify({
      name: `Lugar Prueba ${Date.now()}`,
      description: 'Hermoso lugar turístico de prueba en Manta',
      address: 'Malecón de Manta',
      categoryId: createdCategory.id,
      authorId: createdUser.id,
      hasWifi: true,
      isOpen: true,
    }),
  });
  assert(placeCreate.status === 201, 'POST /places responde 201 Created');
  const createdPlace = placeCreate.data;

  // Probar conflicto de integridad referencial (categoría inexistente)
  const placeFkConflict = await request('/places', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Lugar Inexistente',
      description: 'Lugar con categoría no válida',
      address: 'Calle Falsa 123',
      categoryId: '00000000-0000-0000-0000-000000000000',
    }),
  });
  assert(
    placeFkConflict.status === 409,
    `POST /places con categoryId inexistente responde 409 Conflict correctamente (Status: ${placeFkConflict.status})`,
  );

  const placeGetOne = await request(`/places/${createdPlace.id}`);
  assert(placeGetOne.status === 200, 'GET /places/:id responde 200 OK');

  const placePatch = await request(`/places/${createdPlace.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ description: 'Descripción modificada con éxito' }),
  });
  assert(placePatch.status === 200, 'PATCH /places/:id responde 200 OK');

  // ==========================================
  // 4. PRUEBAS PARA PLACE_LIKES
  // ==========================================
  console.log('\n▶ [4/5] Pruebas en /place-likes');
  const likesGetAll = await request('/place-likes');
  assert(likesGetAll.status === 200, 'GET /place-likes responde 200 OK');

  const clientIdTest = `device-${Date.now()}`;
  const likeCreate = await request('/place-likes', {
    method: 'POST',
    body: JSON.stringify({
      placeId: createdPlace.id,
      clientId: clientIdTest,
    }),
  });
  assert(likeCreate.status === 201, 'POST /place-likes responde 201 Created');
  const createdLike = likeCreate.data;

  // Probar conflicto único (mismo lugar y cliente)
  const likeConflict = await request('/place-likes', {
    method: 'POST',
    body: JSON.stringify({
      placeId: createdPlace.id,
      clientId: clientIdTest,
    }),
  });
  assert(
    likeConflict.status === 409,
    `POST /place-likes duplicado responde 409 Conflict correctamente (Status: ${likeConflict.status}, Msg: ${likeConflict.data?.message})`,
  );

  const likeGetOne = await request(`/place-likes/${createdLike.id}`);
  assert(likeGetOne.status === 200, 'GET /place-likes/:id responde 200 OK');

  const likePatch = await request(`/place-likes/${createdLike.id}`, {
    method: 'PATCH',
    body: JSON.stringify({ clientId: `${clientIdTest}-updated` }),
  });
  assert(likePatch.status === 200, 'PATCH /place-likes/:id responde 200 OK');

  const likeDelete = await request(`/place-likes/${createdLike.id}`, {
    method: 'DELETE',
  });
  assert(likeDelete.status === 200, 'DELETE /place-likes/:id responde 200 OK');

  // ==========================================
  // 5. PRUEBAS PARA USER_FAVORITES
  // ==========================================
  console.log('\n▶ [5/5] Pruebas en /user-favorites');
  const favGetAll = await request('/user-favorites');
  assert(favGetAll.status === 200, 'GET /user-favorites responde 200 OK');

  const favCreate = await request('/user-favorites', {
    method: 'POST',
    body: JSON.stringify({
      userId: createdUser.id,
      placeId: createdPlace.id,
    }),
  });
  assert(favCreate.status === 201, 'POST /user-favorites responde 201 Created');

  // Probar conflicto único en favoritos (mismo usuario y lugar)
  const favConflict = await request('/user-favorites', {
    method: 'POST',
    body: JSON.stringify({
      userId: createdUser.id,
      placeId: createdPlace.id,
    }),
  });
  assert(
    favConflict.status === 409,
    `POST /user-favorites duplicado responde 409 Conflict correctamente (Status: ${favConflict.status}, Msg: ${favConflict.data?.message})`,
  );

  const favGetByUser = await request(`/user-favorites/${createdUser.id}`);
  assert(favGetByUser.status === 200, 'GET /user-favorites/:userId responde 200 OK');

  const favGetOne = await request(`/user-favorites/${createdUser.id}/${createdPlace.id}`);
  assert(favGetOne.status === 200, 'GET /user-favorites/:userId/:placeId responde 200 OK');

  const favDelete = await request(`/user-favorites/${createdUser.id}/${createdPlace.id}`, {
    method: 'DELETE',
  });
  assert(favDelete.status === 200, 'DELETE /user-favorites/:userId/:placeId responde 200 OK');

  // ==========================================
  // 6. PRUEBAS PARA REVIEWS
  // ==========================================
  console.log('\n▶ [6/6] Pruebas en /reviews');
  const reviewsGetAll = await request('/reviews');
  assert(reviewsGetAll.status === 200, 'GET /reviews responde 200 OK');

  const reviewCreate = await request('/reviews', {
    method: 'POST',
    body: JSON.stringify({
      placeId: createdPlace.id,
      userId: createdUser.id,
      rating: 5,
      comment: '¡Excelente lugar para estudiar y pasar la tarde!',
      authorName: 'Estudiante Tester',
    }),
  });
  assert(reviewCreate.status === 201, 'POST /reviews responde 201 Created');
  const createdReview = reviewCreate.data;

  const reviewGetOne = await request(`/reviews/${createdReview.id}`);
  assert(reviewGetOne.status === 200, 'GET /reviews/:id responde 200 OK');

  const reviewPatch = await request(`/reviews/${createdReview.id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      rating: 4,
      comment: 'Comentario actualizado satisfactoriamente',
    }),
  });
  assert(reviewPatch.status === 200, 'PATCH /reviews/:id responde 200 OK');

  const reviewDelete = await request(`/reviews/${createdReview.id}`, {
    method: 'DELETE',
  });
  assert(reviewDelete.status === 200, 'DELETE /reviews/:id responde 200 OK');

  // ==========================================
  // LIMPIEZA FINAL Y PRUEBAS DELETE DE PLACES, USERS Y CATEGORIES
  // ==========================================
  console.log('\n▶ [7/7] Pruebas de DELETE para places, users y categories');
  const placeDelete = await request(`/places/${createdPlace.id}`, {
    method: 'DELETE',
  });
  assert(placeDelete.status === 200, 'DELETE /places/:id responde 200 OK');

  const userDelete = await request(`/users/${createdUser.id}`, {
    method: 'DELETE',
  });
  assert(userDelete.status === 200, 'DELETE /users/:id responde 200 OK');

  const catDelete = await request(`/categories/${createdCategory.id}`, {
    method: 'DELETE',
  });
  assert(catDelete.status === 200, 'DELETE /categories/:id responde 200 OK');

  console.log('\n🎉 ¡TODAS LAS PRUEBAS DE GET, POST, PATCH, DELETE Y CONFLICTOS PASARON EXITOSAMENTE!');
}

runTests().catch((err) => {
  console.error('\n❌ ERROR EN EJECUCIÓN DE PRUEBAS:', err);
  process.exit(1);
});
