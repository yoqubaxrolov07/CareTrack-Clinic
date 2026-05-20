-- =====================================================================
-- CareTrack Clinic - Medical Record Management System (MRMS)
-- Database Schema
--
-- Notes:
--   * Database name: caretrack_mrms
--   * Engine: InnoDB (supports foreign keys + transactions)
--   * Charset: utf8mb4 (full unicode support)
--
-- Run this file once to create all tables.
--   mysql -u root -p < schema.sql
-- =====================================================================

CREATE DATABASE IF NOT EXISTS caretrack_mrms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE caretrack_mrms;

-- Drop in reverse dependency order so re-running this file works cleanly.
DROP TABLE IF EXISTS diagnoses;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS doctors;
DROP TABLE IF EXISTS users;


-- =====================================================================
-- users
--   Staff accounts that can log in to the system.
--   Roles come straight from the assignment brief.
-- =====================================================================
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(120) NOT NULL,
  role          ENUM('admin', 'clinician', 'receptionist') NOT NULL,
  is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;


-- =====================================================================
-- doctors
--   Doctor PROFILES (the data the clinic stores about each doctor).
--   Optionally linked to a `users` row when the doctor also has a login
--   account. user_id is nullable: a profile can exist without a user.
-- =====================================================================
CREATE TABLE doctors (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NULL,                       -- optional login account
  full_name   VARCHAR(120) NOT NULL,
  specialty   VARCHAR(80)  NOT NULL,          -- e.g. cardiology, neurology
  department  VARCHAR(80)  NOT NULL,          -- e.g. Cardiology Dept.
  email       VARCHAR(120) NOT NULL UNIQUE,
  phone       VARCHAR(30),
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_doctors_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_doctors_user_id    (user_id),
  INDEX idx_doctors_specialty  (specialty),
  INDEX idx_doctors_department (department)
) ENGINE=InnoDB;


-- =====================================================================
-- patients
--   Patient records.  Each patient is assigned to one doctor (1:N).
--   doctor_id is nullable so a patient stays in the system if their
--   doctor is removed (admin can re-assign later).
-- =====================================================================
CREATE TABLE patients (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  first_name         VARCHAR(60)  NOT NULL,
  last_name          VARCHAR(60)  NOT NULL,
  dob                DATE         NOT NULL,
  gender             ENUM('male', 'female', 'other') NOT NULL,
  phone              VARCHAR(30),
  email              VARCHAR(120) UNIQUE,
  address            VARCHAR(255),
  emergency_contact  VARCHAR(120),                          -- name + phone
  blood_group        ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','unknown')
                       NOT NULL DEFAULT 'unknown',
  doctor_id          INT NULL,                              -- assigned doctor
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                       ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_patients_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_patients_doctor_id  (doctor_id),
  INDEX idx_patients_last_name  (last_name),
  INDEX idx_patients_email      (email)
) ENGINE=InnoDB;


-- =====================================================================
-- diagnoses  (Disease / Diagnosis records)
--   Each diagnosis belongs to exactly one patient (N:1).
--   If a patient is deleted, their diagnoses are removed too (CASCADE).
--   created_by tracks which staff user recorded the diagnosis.
-- =====================================================================
CREATE TABLE diagnoses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  patient_id    INT NOT NULL,
  icd_code      VARCHAR(20)  NOT NULL,                  -- e.g. "E11.9"
  description   VARCHAR(255) NOT NULL,
  severity      ENUM('mild', 'moderate', 'severe', 'critical') NOT NULL,
  treatment     TEXT,                                   -- prescribed treatment
  status        ENUM('active', 'resolved') NOT NULL DEFAULT 'active',
  diagnosed_at  DATE NOT NULL,                          -- date of diagnosis
  created_by    INT NULL,                               -- user who recorded it
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                  ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_diagnoses_patient
    FOREIGN KEY (patient_id) REFERENCES patients(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT fk_diagnoses_user
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,

  INDEX idx_diagnoses_patient_id (patient_id),
  INDEX idx_diagnoses_icd_code   (icd_code),
  INDEX idx_diagnoses_status     (status),
  INDEX idx_diagnoses_created_by (created_by)
) ENGINE=InnoDB;
