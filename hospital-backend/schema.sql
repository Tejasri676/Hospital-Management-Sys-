-- ============================================================
-- Hospital Information System - Oracle Database Schema
-- Run this script in Oracle SQL*Plus or SQL Developer
-- ============================================================

-- 1. PATIENT table
CREATE TABLE PATIENT (
    patient_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_name    VARCHAR2(100) NOT NULL,
    dob             DATE,
    gender          VARCHAR2(10),
    blood_group     VARCHAR2(5),
    address         VARCHAR2(255),
    phone           VARCHAR2(20)
);

-- 2. DOCTOR table
CREATE TABLE DOCTOR (
    doctor_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             VARCHAR2(100) NOT NULL,
    specialization   VARCHAR2(100),
    qualification    VARCHAR2(200),
    license_no       VARCHAR2(50),
    dept_id          NUMBER,
    email            VARCHAR2(100),
    consultation_fee NUMBER(10,2) DEFAULT 0
);

-- 3. APPOINTMENT table
CREATE TABLE APPOINTMENT (
    appt_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id       NUMBER REFERENCES PATIENT(patient_id),
    doctor_id        NUMBER REFERENCES DOCTOR(doctor_id),
    appt_date        DATE,
    duration         NUMBER DEFAULT 30,
    reason           VARCHAR2(500),
    height           NUMBER,
    weight           NUMBER,
    status           VARCHAR2(30) DEFAULT 'Scheduled',
    is_followup      NUMBER(1) DEFAULT 0,
    fee              NUMBER(10,2) DEFAULT 0
);

-- 4. PRESCRIPTION table
CREATE TABLE PRESCRIPTION (
    Presc_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    Appt_id          NUMBER REFERENCES APPOINTMENT(appt_id),
    Presc_date       DATE DEFAULT SYSDATE
);

-- 5. MEDICINE table
CREATE TABLE MEDICINE (
    med_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             VARCHAR2(100) NOT NULL,
    stock            NUMBER DEFAULT 0,
    price            NUMBER(10,2) DEFAULT 0,
    category         VARCHAR2(50)
);

-- 6. PRESCRIPTION_MEDICINES (junction table)
CREATE TABLE PRESCRIPTION_MEDICINES (
    Presc_id         NUMBER REFERENCES PRESCRIPTION(Presc_id),
    Medicine_id      NUMBER REFERENCES MEDICINE(med_id),
    Dosage           VARCHAR2(100),
    Quantity         NUMBER,
    Duration         VARCHAR2(50),
    purchased        NUMBER(1) DEFAULT 0,
    PRIMARY KEY (Presc_id, Medicine_id)
);

-- 7. LAB_TEST table
CREATE TABLE LAB_TEST (
    test_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    appt_id          NUMBER REFERENCES APPOINTMENT(appt_id),
    patient_id       NUMBER REFERENCES PATIENT(patient_id),
    doctor_id        NUMBER REFERENCES DOCTOR(doctor_id),
    test_name        VARCHAR2(100) NOT NULL,
    test_date        DATE DEFAULT SYSDATE,
    status           VARCHAR2(30) DEFAULT 'Pending',
    result           VARCHAR2(1000),
    remarks          VARCHAR2(500),
    result_date      DATE,
    test_cost        NUMBER(10,2) DEFAULT 0

);

-- 8. WARD table
CREATE TABLE WARD (
    ward_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ward_type        VARCHAR2(50),
    total_beds       NUMBER DEFAULT 0
);

-- 9. ADMISSION table
CREATE TABLE ADMISSION (
    admission_id     NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id       NUMBER REFERENCES PATIENT(patient_id),
    bed_id           NUMBER,
    ward_type        VARCHAR2(50),
    bed_number       VARCHAR2(20),
    admission_date   DATE DEFAULT SYSDATE,
    discharge_date   DATE,
    status           VARCHAR2(30) DEFAULT 'Admitted',
    total_cost       NUMBER(10,2) DEFAULT 0
);

-- 10. REFERRAL table
CREATE TABLE REFERRAL (
    referral_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    patient_id       NUMBER REFERENCES PATIENT(patient_id),
    referred_to      VARCHAR2(200),
    reason           VARCHAR2(500),
    referral_date    DATE DEFAULT SYSDATE,
    nurse_id         VARCHAR2(50)
);

-- 11. STAFF table
CREATE TABLE STAFF (
    staff_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             VARCHAR2(100) NOT NULL,
    role             VARCHAR2(50) NOT NULL,
    email            VARCHAR2(100),
    phone            VARCHAR2(20)
);

-- ============================================================
-- Seed Data (Optional)
-- ============================================================

-- Sample Medicines
INSERT INTO MEDICINE (name, stock, price, category) VALUES ('Paracetamol', 100, 5, 'Painkiller');
INSERT INTO MEDICINE (name, stock, price, category) VALUES ('Amoxicillin', 50, 15, 'Antibiotic');
INSERT INTO MEDICINE (name, stock, price, category) VALUES ('Ibuprofen', 80, 8, 'Anti-inflammatory');

-- Sample Staff
INSERT INTO STAFF (name, role, email, phone) VALUES ('Alice Admin', 'Admin', 'alice@hospital.com', '1111111111');
INSERT INTO STAFF (name, role, email, phone) VALUES ('Bob Reception', 'Receptionist', 'bob@hospital.com', '2222222222');
INSERT INTO STAFF (name, role, email, phone) VALUES ('Charlie Nurse', 'Nurse', 'charlie@hospital.com', '3333333333');
INSERT INTO STAFF (name, role, email, phone) VALUES ('David Lab', 'Lab Technician', 'david@hospital.com', '4444444444');
INSERT INTO STAFF (name, role, email, phone) VALUES ('Eve Pharma', 'Pharmacist', 'eve@hospital.com', '5555555555');

-- Sample Wards
INSERT INTO WARD (ward_type, total_beds) VALUES ('General', 20);
INSERT INTO WARD (ward_type, total_beds) VALUES ('ICU', 5);
INSERT INTO WARD (ward_type, total_beds) VALUES ('Pediatric', 10);

COMMIT;
