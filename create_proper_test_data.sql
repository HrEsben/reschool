-- Create comprehensive test data for ReSchool tools
-- This script creates test data for the test child (ID: 12) based on actual schema
-- Tools: barometers, dagens_smiley, sengetider

-- ================== BAROMETER TOOLS ==================

-- Create barometer tools for test child
INSERT INTO barometers (child_id, created_by, topic, scale_min, scale_max, created_at, updated_at) VALUES
(12, 1, 'Humør i skolen', 1, 5, NOW(), NOW()),
(12, 1, 'Koncentration', 1, 10, NOW(), NOW()),
(12, 1, 'Sociale færdigheder', 1, 5, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create barometer entries for the test child (last 7 days)
INSERT INTO barometer_entries (barometer_id, recorded_by, entry_date, rating, comment, created_at, updated_at) VALUES
-- Humør i skolen entries
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Humør i skolen' LIMIT 1), 1, CURRENT_DATE - INTERVAL '6 days', 4, 'Glad og deltog aktivt i undervisningen', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Humør i skolen' LIMIT 1), 1, CURRENT_DATE - INTERVAL '5 days', 3, 'Lidt træt men i godt humør', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Humør i skolen' LIMIT 1), 1, CURRENT_DATE - INTERVAL '4 days', 5, 'Meget glad og engageret', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Humør i skolen' LIMIT 1), 1, CURRENT_DATE - INTERVAL '3 days', 4, 'God dag med klassekammeraterne', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Humør i skolen' LIMIT 1), 1, CURRENT_DATE - INTERVAL '2 days', 3, 'Lidt udfordret af matematik', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Humør i skolen' LIMIT 1), 1, CURRENT_DATE - INTERVAL '1 days', 4, 'Godt humør og social interaktion', NOW(), NOW()),

-- Koncentration entries
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Koncentration' LIMIT 1), 1, CURRENT_DATE - INTERVAL '6 days', 7, 'Koncentrerede sig godt om opgaverne', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Koncentration' LIMIT 1), 1, CURRENT_DATE - INTERVAL '5 days', 5, 'Lidt distraheret af støj', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Koncentration' LIMIT 1), 1, CURRENT_DATE - INTERVAL '4 days', 8, 'Meget fokuseret hele dagen', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Koncentration' LIMIT 1), 1, CURRENT_DATE - INTERVAL '3 days', 6, 'God koncentration i formiddag', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Koncentration' LIMIT 1), 1, CURRENT_DATE - INTERVAL '2 days', 4, 'Svært at koncentrere sig efter frokost', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Koncentration' LIMIT 1), 1, CURRENT_DATE - INTERVAL '1 days', 7, 'Gode koncentrationsperioder', NOW(), NOW()),

-- Sociale færdigheder entries
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Sociale færdigheder' LIMIT 1), 1, CURRENT_DATE - INTERVAL '6 days', 4, 'Legede godt med andre børn', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Sociale færdigheder' LIMIT 1), 1, CURRENT_DATE - INTERVAL '5 days', 3, 'Lidt tilbageholden i gruppelege', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Sociale færdigheder' LIMIT 1), 1, CURRENT_DATE - INTERVAL '4 days', 5, 'Initierede selv leg med andre', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Sociale færdigheder' LIMIT 1), 1, CURRENT_DATE - INTERVAL '3 days', 4, 'Delte gerne materialer', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Sociale færdigheder' LIMIT 1), 1, CURRENT_DATE - INTERVAL '2 days', 3, 'Havde en mindre konflikt, men løste det godt', NOW(), NOW()),
((SELECT id FROM barometers WHERE child_id = 12 AND topic = 'Sociale færdigheder' LIMIT 1), 1, CURRENT_DATE - INTERVAL '1 days', 4, 'Hjælpsomhed overfor klassekammerater', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ================== DAGENS SMILEY TOOLS ==================

-- Create dagens smiley tools for test child
INSERT INTO dagens_smiley (child_id, created_by, topic, description, is_public, created_at, updated_at) VALUES
(12, 1, 'Morgenstemning', 'Hvordan har test barnet det når dagen starter?', true, NOW(), NOW()),
(12, 1, 'Eftermiddagsstemning', 'Hvordan er test barnets humør efter skoledag/aktiviteter?', true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create dagens smiley entries for the test child (last 7 days)
INSERT INTO dagens_smiley_entries (smiley_id, recorded_by, entry_date, selected_emoji, reasoning, created_at, updated_at) VALUES
-- Morgenstemning entries
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Morgenstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '6 days', '😊', 'Vågnede af sig selv og var glad for at skulle i skole', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Morgenstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '5 days', '😴', 'Træt efter sen aften, men kom i gang', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Morgenstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '4 days', '😄', 'Meget energisk og glad - weekend starter', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Morgenstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '3 days', '😊', 'God morgen, glædede sig til aktiviteter', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Morgenstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '2 days', '😐', 'Lidt neutral, tog lidt tid at vågne', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Morgenstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '1 days', '😊', 'I godt humør og klar til skole', NOW(), NOW()),

-- Eftermiddagsstemning entries
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Eftermiddagsstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '6 days', '😊', 'Tilfreds med skoledagen, fortalte om vennerne', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Eftermiddagsstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '5 days', '😅', 'Lidt træt men glad, havde lært noget nyt', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Eftermiddagsstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '4 days', '😄', 'Meget glad efter sjov weekend dag', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Eftermiddagsstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '3 days', '😊', 'God stemning, legede godt hjemme', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Eftermiddagsstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '2 days', '😤', 'Lidt frustreret over matematik lektier', NOW(), NOW()),
((SELECT id FROM dagens_smiley WHERE child_id = 12 AND topic = 'Eftermiddagsstemning' LIMIT 1), 1, CURRENT_DATE - INTERVAL '1 days', '😊', 'Glad og afslappet efter god skoledag', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ================== SENGETIDER TOOL ==================

-- Create sengetider tool for test child (Note: corrected schema from migration files)
INSERT INTO sengetider (child_id, created_by, description, is_public, created_at, updated_at) 
VALUES (12, 1, 'Test barnets sengetider og søvnmønster', true, NOW(), NOW())
ON CONFLICT (child_id) DO NOTHING;

-- Create sengetider entries for the test child (using correct schema with puttetid, sov_kl, vaagnede)
INSERT INTO sengetider_entries (sengetider_id, recorded_by, entry_date, puttetid, sov_kl, vaagnede, notes, created_at, updated_at) VALUES
((SELECT id FROM sengetider WHERE child_id = 12 LIMIT 1), 1, CURRENT_DATE - INTERVAL '6 days', '19:30', '20:00', '07:00', 'God nat, faldt hurtigt i søvn', NOW(), NOW()),
((SELECT id FROM sengetider WHERE child_id = 12 LIMIT 1), 1, CURRENT_DATE - INTERVAL '5 days', '19:30', '20:15', '07:15', 'Lidt svært at falde i søvn', NOW(), NOW()),
((SELECT id FROM sengetider WHERE child_id = 12 LIMIT 1), 1, CURRENT_DATE - INTERVAL '4 days', '19:45', '20:30', '07:30', 'Weekend - lidt senere sengetid', NOW(), NOW()),
((SELECT id FROM sengetider WHERE child_id = 12 LIMIT 1), 1, CURRENT_DATE - INTERVAL '3 days', '19:30', '19:45', '06:45', 'Meget træt, faldt hurtigt i søvn', NOW(), NOW()),
((SELECT id FROM sengetider WHERE child_id = 12 LIMIT 1), 1, CURRENT_DATE - INTERVAL '2 days', '19:30', '20:00', '07:00', 'Normal nat med god søvn', NOW(), NOW()),
((SELECT id FROM sengetider WHERE child_id = 12 LIMIT 1), 1, CURRENT_DATE - INTERVAL '1 days', '19:30', '20:15', '07:15', 'Læste en bog inden sengetid', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- ================== INDSATSTRAPPE (unchanged from previous version) ==================

-- Create indsatstrappe plan for the test child
INSERT INTO indsatstrappe (child_id, created_by, title, description, start_date, is_active, created_at, updated_at) 
VALUES (12, 1, 'Test Indsatstrappe - Skoleintegration', 'En testplan for at hjælpe test barnet med skoleintegration og sociale færdigheder', CURRENT_DATE, true, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Create steps for the indsatstrappe plan
INSERT INTO indsatstrappe_steps (indsatstrappe_id, step_number, title, description, målsætning, is_completed, created_at, updated_at) VALUES
((SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1), 1, 'Introduktion til skolen', 'Test barnet besøger skolen sammen med forældre og lærer. Fokus på at blive fortrolig med miljøet.', 'Test barnet føler sig tryg og velkommen på skolen.', true, NOW(), NOW()),
((SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1), 2, 'Møde klassekammerater', 'Test barnet introduceres for 2-3 klassekammerater i et struktureret miljø.', 'Test barnet kan navngive og interagere positivt med klassekammeraterne.', true, NOW(), NOW()),
((SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1), 3, 'Deltagelse i gruppeaktiviteter', 'Test barnet deltager i små gruppeaktiviteter med støtte fra lærer.', 'Test barnet kan arbejde sammen med andre børn i 15-20 minutter.', false, NOW(), NOW()),
((SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1), 4, 'Selvstændig arbejde i klassen', 'Test barnet arbejder selvstændigt med opgaver i klasselokalet.', 'Test barnet kan koncentrere sig om opgaver i 30 minutter uden konstant støtte.', false, NOW(), NOW()),
((SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1), 5, 'Pauseaktiviteter', 'Test barnet deltager i pauseaktiviteter med klassekammerater.', 'Test barnet initierer og deltager i leg med andre børn.', false, NOW(), NOW()),
((SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1), 6, 'Fuld skoledag', 'Test barnet gennemfører en hel skoledag med minimal støtte.', 'Test barnet trives gennem en fuld skoledag og udtrykker glæde ved at gå i skole.', false, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Add completion data to show progression for the active plan
UPDATE indsatstrappe_steps 
SET completed_at = NOW() - INTERVAL '3 days', completed_by = 1
WHERE indsatstrappe_id = (SELECT id FROM indsatstrappe WHERE child_id = 12 AND title = 'Test Indsatstrappe - Skoleintegration' LIMIT 1) 
AND step_number IN (1, 2);

-- ================== SUMMARY ==================
-- This test data creates:
-- 1. Three barometer tools with rating entries over the last week
-- 2. Two dagens smiley tools with emoji entries showing mood progression  
-- 3. One sengetider tool with sleep time entries
-- 4. One active indsatstrappe plan with partial completion
-- 5. All data linked to test child ID 12 and created by user ID 1
-- 6. Realistic data showing how tools work together to track child development
