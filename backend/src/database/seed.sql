-- =====================================================================
-- CareTrack Clinic MRMS - Sample seed data
--
-- Run AFTER schema.sql:
--   mysql -u root -p caretrack_mrms < seed.sql
--
-- IMPORTANT:
--   The password_hash values below are bcrypt hashes of these passwords:
--     admin       -> Admin@123
--     clinician   -> Clinic@123
--     receptionist-> Recep@123
--   You can also re-create users via the /api/auth/register endpoint,
--   which hashes passwords through bcrypt automatically.
-- =====================================================================

USE caretrack_mrms;

-- Wipe existing rows in dependency order (safe to re-seed).
DELETE FROM diagnoses;
DELETE FROM patients;
DELETE FROM doctors;
DELETE FROM users;

ALTER TABLE diagnoses AUTO_INCREMENT = 1;
ALTER TABLE patients  AUTO_INCREMENT = 1;
ALTER TABLE doctors   AUTO_INCREMENT = 1;
ALTER TABLE users     AUTO_INCREMENT = 1;


-- ----------------------- users -----------------------
-- Bcrypt passwords (10 salt rounds). Actual passwords:
--   admin       -> Admin@123
--   dr_smith    -> Clinic@123
--   dr_lee      -> Clinic@123
--   reception   -> Recep@123
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
  ('admin',    'admin@caretrack.test',
   '$2a$10$KvOmlaaBMB38o7XR0hETJOapHP4oXYIu/JyoztMQcpGoVvLA/tYxW',
   'System Administrator', 'admin'),

  ('dr_smith', 'smith@caretrack.test',
   '$2a$10$bn.Qe3fSIbiKKJoUfISWmOs.CrNV2GGjAjljjmfEzM7NEiBmEgnHq',
   'Dr. John Smith', 'clinician'),

  ('dr_lee',   'lee@caretrack.test',
   '$2a$10$bn.Qe3fSIbiKKJoUfISWmOs.CrNV2GGjAjljjmfEzM7NEiBmEgnHq',
   'Dr. Sarah Lee', 'clinician'),

  ('reception','reception@caretrack.test',
   '$2a$10$FzCtwqxG4BDdy5namFJoO.CTB.T1iUvqgwlTL00MsvaaD3KmZGmcK',
   'Front Desk', 'receptionist');


-- ----------------------- doctors ---------------------
INSERT INTO doctors (user_id, full_name, specialty, department, email, phone) VALUES
  (2, 'Dr. John Smith',  'Cardiology',  'Cardiology Dept.',  'smith@caretrack.test', '+998-90-111-2233'),
  (3, 'Dr. Sarah Lee',   'Neurology',   'Neurology Dept.',   'lee@caretrack.test',   '+998-90-222-3344'),
  (NULL, 'Dr. Aziz Karim','Dermatology','Dermatology Dept.', 'aziz@caretrack.test',  '+998-90-333-4455'),
  (NULL, 'Dr. Maria Ruiz','Orthopaedics','Orthopaedics Dept.','maria@caretrack.test', '+998-90-444-5566');


-- ----------------------- patients --------------------
INSERT INTO patients
  (first_name, last_name, dob, gender, phone, email, address, emergency_contact, blood_group, doctor_id)
VALUES
  ('Alice',  'Johnson', '1990-04-12', 'female', '+998-91-100-0001',
   'alice.j@example.com', '12 Mustaqillik St., Tashkent', 'Bob Johnson +998-91-100-9001', 'O+',  1),
  ('Bobur',  'Aliyev',  '1985-07-30', 'male',   '+998-91-100-0002',
   'bobur.a@example.com', '5 Amir Temur Ave., Tashkent', 'Dilnoza Aliyeva +998-91-100-9002', 'A+', 1),
  ('Clara',  'Demir',   '2002-11-05', 'female', '+998-91-100-0003',
   'clara.d@example.com', '7 Navoi St., Samarkand',      'Mehmet Demir +998-91-100-9003', 'B-',  2),
  ('Diyor',  'Tursunov','1975-01-22', 'male',   '+998-91-100-0004',
   'diyor.t@example.com', '21 Bunyodkor St., Tashkent',  'Nigora Tursunova +998-91-100-9004', 'AB+', 3);


-- ----------------------- diagnoses -------------------
INSERT INTO diagnoses
  (patient_id, icd_code, description, severity, treatment, status, diagnosed_at, created_by)
VALUES
  (1, 'I10',   'Essential (primary) hypertension', 'moderate',
   'Lifestyle changes; lisinopril 10mg daily.', 'active',   '2026-01-15', 2),

  (1, 'E11.9', 'Type 2 diabetes mellitus, no complications', 'mild',
   'Metformin 500mg twice daily; diet review.', 'active',   '2026-02-03', 2),

  (2, 'J45.909','Unspecified asthma, uncomplicated', 'moderate',
   'Salbutamol inhaler PRN; follow-up in 1 month.', 'active', '2026-03-10', 2),

  (3, 'G43.909','Migraine, unspecified, not intractable', 'moderate',
   'Sumatriptan 50mg at onset; trigger journal.',   'resolved','2026-02-20', 3),

  (4, 'L20.9', 'Atopic dermatitis, unspecified', 'mild',
   'Topical hydrocortisone 1%; emollients daily.', 'active',  '2026-04-01', 1);
