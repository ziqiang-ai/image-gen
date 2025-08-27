-- Insert some featured sample images for the gallery
INSERT INTO public.images (id, user_id, title, prompt, image_url, thumbnail_url, is_public, is_featured, likes_count) VALUES
(gen_random_uuid(), NULL, 'Cyberpunk City', 'A futuristic cyberpunk cityscape at night with neon lights and flying cars', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', true, true, 42),
(gen_random_uuid(), NULL, 'Mystical Forest', 'An enchanted forest with glowing mushrooms and magical creatures', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', true, true, 38),
(gen_random_uuid(), NULL, 'Space Explorer', 'An astronaut exploring an alien planet with purple skies and crystal formations', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', true, true, 55),
(gen_random_uuid(), NULL, 'Dragon Guardian', 'A majestic dragon guarding a treasure hoard in a mountain cave', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', true, true, 67),
(gen_random_uuid(), NULL, 'Ocean Depths', 'Deep sea creatures swimming around a sunken pirate ship', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', true, true, 29),
(gen_random_uuid(), NULL, 'Steampunk Airship', 'A Victorian-era airship flying through clouds with brass gears and steam', '/placeholder.svg?height=400&width=600', '/placeholder.svg?height=200&width=300', true, true, 44);
