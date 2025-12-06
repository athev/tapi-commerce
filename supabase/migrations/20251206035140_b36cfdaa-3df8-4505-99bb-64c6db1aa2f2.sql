
-- Step 1: Create fake orders for Canva PRO (20 orders)
INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  '435d36b2-1fde-4013-9186-7950dbce5799'::uuid,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 20);

-- Step 2: Create fake orders for CAPCUT PRO (10 orders)
INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  '79a8355b-e93d-44b0-b066-f05f6232f22e'::uuid,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 10);

-- Step 3: Create fake orders for Gemini (15 orders)
INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  '39091d1e-00ee-4365-9555-354a71e89c9d'::uuid,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 15);

-- Step 4: Create fake orders for ChatGPT products
INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  '24004fb0-67c3-4701-857f-6033255ab6b8'::uuid,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 15);

INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  '1714c298-5510-4f3c-88c5-d45ba3ad2ca6'::uuid,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 12);

INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  '08acbe0a-de84-429e-9f40-c037df6574f2'::uuid,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM generate_series(1, 10);

-- Step 5: Create fake orders for remaining products (3 each)
INSERT INTO orders (id, user_id, product_id, status, delivery_status, created_at)
SELECT 
  gen_random_uuid(),
  (ARRAY['70b0274c-b916-424b-8fd9-8ba622142dff'::uuid, 'fd8e6349-85ef-4c2d-a024-5a77a7086966'::uuid, '38d1a75e-9c88-4606-966a-a86cd512e7a4'::uuid, '877c9711-2ff8-4303-ba1f-8bcd588dfe66'::uuid, '5b6ba893-9c08-4cb3-b656-951d83743d7f'::uuid])[floor(random()*5+1)::int],
  p.id,
  'paid',
  'completed',
  NOW() - (random() * interval '60 days')
FROM products p
CROSS JOIN generate_series(1, 3)
WHERE p.seller_id = 'd4f5736a-be1d-492b-a72d-97d1a6cdcde8'::uuid
  AND p.id NOT IN (
    '435d36b2-1fde-4013-9186-7950dbce5799'::uuid,
    '79a8355b-e93d-44b0-b066-f05f6232f22e'::uuid, 
    '39091d1e-00ee-4365-9555-354a71e89c9d'::uuid,
    '24004fb0-67c3-4701-857f-6033255ab6b8'::uuid,
    '1714c298-5510-4f3c-88c5-d45ba3ad2ca6'::uuid,
    '08acbe0a-de84-429e-9f40-c037df6574f2'::uuid
  );
