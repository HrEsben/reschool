-- Setup database triggers for real-time push notifications
-- This file sets up PostgreSQL triggers that will notify our application
-- when important events happen in the database

-- Drop existing triggers and functions if they exist
DROP TRIGGER IF EXISTS notify_new_registration ON children;
DROP TRIGGER IF EXISTS notify_sengetid_entry ON sengetider_entries;
DROP TRIGGER IF EXISTS notify_barometer_entry ON barometer_entries;
DROP TRIGGER IF EXISTS notify_smiley_entry ON dagens_smiley_entries;
DROP TRIGGER IF EXISTS notify_indsatstrappe_update ON indsatstrappe_steps;

DROP FUNCTION IF EXISTS notify_new_registration();
DROP FUNCTION IF EXISTS notify_sengetid_entry();
DROP FUNCTION IF EXISTS notify_barometer_entry();
DROP FUNCTION IF EXISTS notify_smiley_entry();
DROP FUNCTION IF EXISTS notify_indsatstrappe_update();

-- Function to notify about new child registrations
CREATE OR REPLACE FUNCTION notify_new_registration() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('new_registration', json_build_object(
    'type', 'new_child',
    'child_id', NEW.id,
    'child_name', NEW.name,
    'timestamp', NOW()
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify about new sengetider entries
CREATE OR REPLACE FUNCTION notify_sengetid_entry() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('sengetid_entry', json_build_object(
    'type', 'sengetid_entry',
    'entry_id', NEW.id,
    'child_id', (SELECT child_id FROM sengetider WHERE id = NEW.sengetider_id),
    'puttetid', NEW.puttetid,
    'timestamp', NOW()
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify about new barometer entries
CREATE OR REPLACE FUNCTION notify_barometer_entry() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('barometer_entry', json_build_object(
    'type', 'barometer_entry',
    'entry_id', NEW.id,
    'child_id', (SELECT child_id FROM barometers WHERE id = NEW.barometer_id),
    'rating', NEW.rating,
    'timestamp', NOW()
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify about new dagens smiley entries
CREATE OR REPLACE FUNCTION notify_smiley_entry() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('smiley_entry', json_build_object(
    'type', 'smiley_entry',
    'entry_id', NEW.id,
    'child_id', (SELECT child_id FROM dagens_smiley WHERE id = NEW.smiley_id),
    'smiley', NEW.selected_emoji,
    'timestamp', NOW()
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to notify about indsatstrappe step updates
CREATE OR REPLACE FUNCTION notify_indsatstrappe_update() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('indsatstrappe_update', json_build_object(
    'type', 'indsatstrappe_step',
    'step_id', NEW.id,
    'child_id', (SELECT child_id FROM indsatstrappe WHERE id = NEW.indsatstrappe_id),
    'completed', NEW.completed_at IS NOT NULL,
    'timestamp', NOW()
  )::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER notify_new_registration
  AFTER INSERT ON children
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_registration();

CREATE TRIGGER notify_sengetid_entry
  AFTER INSERT ON sengetider_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_sengetid_entry();

CREATE TRIGGER notify_barometer_entry
  AFTER INSERT ON barometer_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_barometer_entry();

CREATE TRIGGER notify_smiley_entry
  AFTER INSERT ON dagens_smiley_entries
  FOR EACH ROW
  EXECUTE FUNCTION notify_smiley_entry();

CREATE TRIGGER notify_indsatstrappe_update
  AFTER UPDATE ON indsatstrappe_steps
  FOR EACH ROW
  EXECUTE FUNCTION notify_indsatstrappe_update();
