-- =====================================================================
-- CareTrack Clinic MRMS - Example / reference queries
--
-- These are useful for:
--   * Manual testing in MySQL Workbench
--   * Copy-pasting into controllers when building new features
--   * Demonstrating relational queries in your assignment report
-- =====================================================================

USE caretrack_mrms;

-- ---------------------------------------------------------------------
-- 1.  All doctors with how many patients they have
-- ---------------------------------------------------------------------
SELECT  d.id,
        d.full_name,
        d.specialty,
        d.department,
        COUNT(p.id) AS patient_count
FROM    doctors d
LEFT JOIN patients p ON p.doctor_id = d.id
GROUP BY d.id
ORDER BY d.full_name;


-- ---------------------------------------------------------------------
-- 2.  Full patient profile + assigned doctor + all diagnoses
--     (matches the brief: "View a full Patient profile showing their
--      assigned Doctor and all linked Disease/Diagnosis records")
-- ---------------------------------------------------------------------
SELECT  p.id              AS patient_id,
        p.first_name,
        p.last_name,
        p.dob,
        p.gender,
        p.blood_group,
        d.full_name       AS doctor_name,
        d.specialty       AS doctor_specialty,
        dx.id             AS diagnosis_id,
        dx.icd_code,
        dx.description,
        dx.severity,
        dx.status,
        dx.diagnosed_at
FROM    patients   p
LEFT JOIN doctors    d  ON d.id = p.doctor_id
LEFT JOIN diagnoses  dx ON dx.patient_id = p.id
WHERE   p.id = 1
ORDER BY dx.diagnosed_at DESC;


-- ---------------------------------------------------------------------
-- 3.  Active diagnoses only
-- ---------------------------------------------------------------------
SELECT  dx.id, dx.icd_code, dx.description, dx.severity,
        CONCAT(p.first_name, ' ', p.last_name) AS patient
FROM    diagnoses dx
JOIN    patients  p ON p.id = dx.patient_id
WHERE   dx.status = 'active'
ORDER BY dx.diagnosed_at DESC;


-- ---------------------------------------------------------------------
-- 4.  Search across doctors / patients / diseases
--     (the brief requires search & filter)
-- ---------------------------------------------------------------------
-- Doctors by name or specialty
SELECT * FROM doctors
WHERE  full_name LIKE '%smith%' OR specialty LIKE '%cardio%';

-- Patients by name
SELECT * FROM patients
WHERE  first_name LIKE '%ali%' OR last_name LIKE '%ali%';

-- Diagnoses by ICD code or description keyword
SELECT * FROM diagnoses
WHERE  icd_code LIKE 'E11%' OR description LIKE '%diabetes%';


-- ---------------------------------------------------------------------
-- 5.  All patients of a specific doctor (e.g. clinician dashboard)
-- ---------------------------------------------------------------------
SELECT  p.id, p.first_name, p.last_name, p.phone, p.blood_group
FROM    patients p
WHERE   p.doctor_id = 1
ORDER BY p.last_name;


-- ---------------------------------------------------------------------
-- 6.  Diagnosis report for a patient (chronological history)
-- ---------------------------------------------------------------------
SELECT  dx.diagnosed_at,
        dx.icd_code,
        dx.description,
        dx.severity,
        dx.status,
        dx.treatment,
        u.full_name AS recorded_by
FROM    diagnoses dx
LEFT JOIN users u ON u.id = dx.created_by
WHERE   dx.patient_id = 1
ORDER BY dx.diagnosed_at DESC;


-- ---------------------------------------------------------------------
-- 7.  Re-assign a patient to another doctor (admin action)
-- ---------------------------------------------------------------------
UPDATE patients
SET    doctor_id = 2
WHERE  id = 4;


-- ---------------------------------------------------------------------
-- 8.  Mark a diagnosis as resolved (clinician action)
-- ---------------------------------------------------------------------
UPDATE diagnoses
SET    status    = 'resolved',
       treatment = CONCAT(IFNULL(treatment,''),
                          '\nResolved on ', CURRENT_DATE())
WHERE  id = 3;
