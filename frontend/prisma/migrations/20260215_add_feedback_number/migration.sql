-- AlterTable
ALTER TABLE "feedback" ADD COLUMN "feedbackNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "feedback_feedbackNumber_key" ON "feedback"("feedbackNumber");

-- CreateIndex
CREATE INDEX "feedback_type_idx" ON "feedback"("type");

-- Backfill feedbackNumber with sequential numbers based on creation date (FB-001 format)
DO $$
DECLARE
  feedback_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR feedback_record IN 
    SELECT id FROM feedback ORDER BY "createdAt" ASC
  LOOP
    UPDATE feedback 
    SET "feedbackNumber" = 'FB-' || LPAD(counter::TEXT, 3, '0')
    WHERE id = feedback_record.id;
    counter := counter + 1;
  END LOOP;
END $$;

-- Make feedbackNumber NOT NULL after backfill
ALTER TABLE "feedback" ALTER COLUMN "feedbackNumber" SET NOT NULL;
