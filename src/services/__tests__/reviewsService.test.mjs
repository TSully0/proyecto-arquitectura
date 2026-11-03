import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createReviewsService, ReviewsApiError } from '../reviewsService.ts';

const review = {
  userId: '7264e136-aec4-4477-abae-b78bb3329b3d',
  placeId: 'debe4220-bd7b-427e-aca5-54af108c17ed',
  rating: 4,
  text: 'Muy buen lugar.'
};

test('creates a review with the backend POST contract', async () => {
  const requests = [];
  const fetcher = async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(JSON.stringify({ id: 'review-789' }), { status: 201 });
  };
  const service = createReviewsService('https://api.example.test/', fetcher, 'comment');

  await service.create(review);

  assert.equal(requests[0].url, 'https://api.example.test/reviews');
  assert.equal(requests[0].init.method, 'POST');
  assert.deepEqual(JSON.parse(requests[0].init.body), {
    userId: review.userId,
    placeId: review.placeId,
    rating: review.rating,
    comment: review.text
  });
  assert.equal('text' in JSON.parse(requests[0].init.body), false);
});

test('uses the local backend POST contract in development', async () => {
  const requests = [];
  const fetcher = async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(JSON.stringify({ id: 'review-789' }), { status: 201 });
  };
  const service = createReviewsService('http://localhost:4000', fetcher, 'text');

  await service.create(review);

  assert.deepEqual(JSON.parse(requests[0].init.body), review);
});

test('updates a review with PATCH and encodes its id', async () => {
  const requests = [];
  const fetcher = async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(null, { status: 204 });
  };
  const service = createReviewsService('https://api.example.test', fetcher);

  await service.update('review/789', review);

  assert.equal(requests[0].url, 'https://api.example.test/reviews/review%2F789');
  assert.equal(requests[0].init.method, 'PATCH');
  assert.deepEqual(JSON.parse(requests[0].init.body), {
    rating: review.rating,
    comment: review.text
  });
});

test('rejects invalid seeded UUIDs before sending a POST', async () => {
  let requestSent = false;
  const fetcher = async () => {
    requestSent = true;
    return new Response(null, { status: 201 });
  };
  const service = createReviewsService('https://api.example.test', fetcher);

  assert.throws(
    () => service.create({ ...review, placeId: 'b1111111-0000-0000-0000-000000000001' }),
    /UUID válido/
  );
  assert.equal(requestSent, false);
});

test('lists reviews from GET /reviews without sending a request body', async () => {
  const requests = [];
  const reviews = [{ id: 'review-789', placeId: 'place-456', comment: 'Muy buen lugar.' }];
  const fetcher = async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(JSON.stringify(reviews), { status: 200 });
  };
  const service = createReviewsService('http://localhost:4000', fetcher);

  assert.deepEqual(await service.list(), reviews);
  assert.equal(requests[0].url, 'http://localhost:4000/reviews');
  assert.equal(requests[0].init.method, 'GET');
  assert.equal(requests[0].init.body, undefined);
});

test('preserves backend validation errors for the interface', async () => {
  const fetcher = async () =>
    new Response(JSON.stringify({ statusCode: 400, message: ['El texto contiene palabras ofensivas.'] }), {
      status: 400
    });
  const service = createReviewsService('https://api.example.test', fetcher);

  await assert.rejects(service.create(review), (error) => {
    assert.ok(error instanceof ReviewsApiError);
    assert.equal(error.status, 400);
    assert.equal(error.message, 'El texto contiene palabras ofensivas.');
    return true;
  });
});
