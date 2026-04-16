-- Run this in MySQL to add max_learners column
ALTER TABLE tutor_profile ADD COLUMN IF NOT EXISTS max_learners INT NOT NULL DEFAULT 10;
