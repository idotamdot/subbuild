ALTER TABLE inquiries ADD COLUMN IF NOT EXISTS assigned_staff_email text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'inquiries'
      AND column_name = 'assigned_staff_id'
  ) THEN
    EXECUTE 'UPDATE inquiries SET assigned_staff_email = assigned_staff_id WHERE assigned_staff_email IS NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS inquiries_assigned_status_created_idx
  ON inquiries (assigned_staff_email, status, created_at DESC);
