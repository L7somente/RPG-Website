-- Keep existing values in feet; permit precise metric edits without rounding to a whole foot.
ALTER TABLE "Character" ALTER COLUMN "speed" TYPE DOUBLE PRECISION USING "speed"::DOUBLE PRECISION;
