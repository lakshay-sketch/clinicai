"""
ClinicAI Seed Data Generator
=============================
Single source of truth for demo seed data. Generates seed-data.json,
which prisma/seed.ts and seed.sql are both derived from, so all three
outputs stay perfectly in sync.

Clinic names/addresses/areas are REAL, publicly-listed Mumbai hospitals.
Doctors, fees, ratings, schedules, FAQs, and queue data are clearly
DEMO DATA (synthetic) since real per-doctor fee/rating data isn't
publicly scrapeable in a reliable, licensable way.

Run: python3 generate_seed.py
"""

import json
import random
from datetime import datetime, timedelta, date

random.seed(42)  # reproducible output

# ---------------------------------------------------------------------------
# 1. CLINICS — 15 real, publicly listed Mumbai hospitals/clinics
# ---------------------------------------------------------------------------

CLINICS = [
    dict(id="clinic_01", name="Lilavati Hospital and Research Centre",
         address="A-791, Bandra Reclamation", area="Bandra West", pincode="400050",
         lat=19.0509, lng=72.8296, phone="+91-22-2675-1000", email="info.demo@lilavatihospital.example"),
    dict(id="clinic_02", name="Kokilaben Dhirubhai Ambani Hospital",
         address="Rao Saheb Achutrao Patwardhan Marg, Four Bungalows", area="Andheri West", pincode="400053",
         lat=19.1306, lng=72.8259, phone="+91-22-4269-6969", email="info.demo@kokilabenhospital.example"),
    dict(id="clinic_03", name="Nanavati Max Super Speciality Hospital",
         address="S.V. Road", area="Vile Parle West", pincode="400056",
         lat=19.0996, lng=72.8438, phone="+91-22-2626-7500", email="info.demo@nanavatimax.example"),
    dict(id="clinic_04", name="Hiranandani Hospital",
         address="Hill Side Avenue, Hiranandani Gardens", area="Powai", pincode="400076",
         lat=19.1176, lng=72.9060, phone="+91-22-2576-3300", email="info.demo@hiranandanihospital.example"),
    dict(id="clinic_05", name="S. L. Raheja Hospital (A Fortis Associate)",
         address="Raheja Rugnalaya Marg", area="Mahim West", pincode="400016",
         lat=19.0410, lng=72.8397, phone="+91-22-6767-3333", email="info.demo@rahejahospital.example"),
    dict(id="clinic_06", name="P. D. Hinduja Hospital and Medical Research Centre",
         address="Veer Savarkar Marg", area="Mahim", pincode="400016",
         lat=19.0389, lng=72.8410, phone="+91-22-2445-2575", email="info.demo@hindujahospital.example"),
    dict(id="clinic_07", name="SevenHills Hospital",
         address="SevenHills Health City, Marol Maroshi Road", area="Andheri East", pincode="400059",
         lat=19.1191, lng=72.8827, phone="+91-22-6767-6767", email="info.demo@sevenhillshospital.example"),
    dict(id="clinic_08", name="Holy Family Hospital",
         address="St. Andrew's Road", area="Bandra West", pincode="400050",
         lat=19.0600, lng=72.8320, phone="+91-22-2642-2255", email="info.demo@holyfamilyhospital.example"),
    dict(id="clinic_09", name="Jaslok Hospital & Research Centre",
         address="15, Dr. G. Deshmukh Marg, Pedder Road", area="Pedder Road", pincode="400026",
         lat=18.9686, lng=72.8090, phone="+91-22-6657-3333", email="info.demo@jaslokhospital.example"),
    dict(id="clinic_10", name="Breach Candy Hospital Trust",
         address="60-A, Bhulabhai Desai Road", area="Breach Candy", pincode="400026",
         lat=18.9686, lng=72.8054, phone="+91-22-2367-1888", email="info.demo@breachcandyhospital.example"),
    dict(id="clinic_11", name="Saifee Hospital",
         address="15/17, Maharshi Karve Marg", area="Charni Road", pincode="400004",
         lat=18.9525, lng=72.8182, phone="+91-22-6757-0111", email="info.demo@saifeehospital.example"),
    dict(id="clinic_12", name="Fortis Hospital, Mulund",
         address="Mulund Goregaon Link Road", area="Mulund West", pincode="400078",
         lat=19.1726, lng=72.9425, phone="+91-22-6799-4444", email="info.demo@fortismulund.example"),
    dict(id="clinic_13", name="Wockhardt Hospital, Mumbai Central",
         address="1877, Dr Anandrao Nair Road, Agripada", area="Mumbai Central", pincode="400011",
         lat=18.9750, lng=72.8258, phone="+91-22-6178-4444", email="info.demo@wockhardtmumbaicentral.example"),
    dict(id="clinic_14", name="Nakshatra Hospital",
         address="Plot No. 39, Main Gulmohar Road", area="Andheri West", pincode="400049",
         lat=19.1364, lng=72.8296, phone="+91-22-2674-1111", email="info.demo@nakshatrahospital.example"),
    dict(id="clinic_15", name="Global Hospital",
         address="35, Dr E Borges Road", area="Parel", pincode="400012",
         lat=19.0037, lng=72.8420, phone="+91-22-6767-9999", email="info.demo@globalhospitalmumbai.example"),
]

# ---------------------------------------------------------------------------
# 2. SPECIALIZATIONS — normalized table
# ---------------------------------------------------------------------------

SPECIALIZATIONS = [
    dict(id="spec_gp", name="General Physician", description="Primary care, common illnesses, general checkups"),
    dict(id="spec_derm", name="Dermatologist", description="Skin, hair, and nail conditions"),
    dict(id="spec_dent", name="Dentist", description="Oral and dental health"),
    dict(id="spec_ent", name="ENT Specialist", description="Ear, nose, and throat conditions"),
    dict(id="spec_ortho", name="Orthopedic", description="Bones, joints, and musculoskeletal system"),
    dict(id="spec_cardio", name="Cardiologist", description="Heart and cardiovascular conditions"),
    dict(id="spec_ped", name="Pediatrician", description="Child health and development"),
    dict(id="spec_gyn", name="Gynecologist", description="Women's reproductive health"),
    dict(id="spec_neuro", name="Neurologist", description="Brain and nervous system conditions"),
    dict(id="spec_ophtho", name="Ophthalmologist", description="Eye care and vision"),
    dict(id="spec_psych", name="Psychiatrist", description="Mental health conditions"),
]

QUALIFICATIONS = {
    "spec_gp": ["MBBS, MD (Internal Medicine)", "MBBS, DNB (General Medicine)", "MBBS"],
    "spec_derm": ["MBBS, MD (Dermatology)", "MBBS, DVD"],
    "spec_dent": ["BDS", "BDS, MDS (Orthodontics)", "BDS, MDS (Periodontics)"],
    "spec_ent": ["MBBS, MS (ENT)", "MBBS, DLO"],
    "spec_ortho": ["MBBS, MS (Orthopedics)", "MBBS, D.Ortho"],
    "spec_cardio": ["MBBS, MD, DM (Cardiology)", "MBBS, MD (Medicine), DNB (Cardiology)"],
    "spec_ped": ["MBBS, MD (Pediatrics)", "MBBS, DCH"],
    "spec_gyn": ["MBBS, MD (Obstetrics & Gynecology)", "MBBS, DGO"],
    "spec_neuro": ["MBBS, MD, DM (Neurology)", "MBBS, DNB (Neurology)"],
    "spec_ophtho": ["MBBS, MS (Ophthalmology)", "MBBS, DOMS"],
    "spec_psych": ["MBBS, MD (Psychiatry)", "MBBS, DPM"],
}

BIO_TEMPLATES = [
    "Specializes in {spec_lower} with a focus on evidence-based, patient-first care.",
    "Has treated thousands of patients over a {exp}-year career in {spec_lower}.",
    "Known for a calm, thorough approach and clear explanations of treatment options.",
    "Combines clinical expertise in {spec_lower} with a strong emphasis on preventive care.",
    "Trained at leading Mumbai institutions, with special interest in {spec_lower}.",
]

FIRST_NAMES_M = ["Rohan", "Aditya", "Vikram", "Arjun", "Rajesh", "Sanjay", "Anil", "Suresh",
                  "Rahul", "Amit", "Kunal", "Nikhil", "Siddharth", "Manish", "Deepak",
                  "Ashok", "Pranav", "Karan", "Vivek", "Rakesh", "Imran", "Farhan"]
FIRST_NAMES_F = ["Priya", "Anjali", "Sneha", "Neha", "Kavita", "Meera", "Pooja", "Divya",
                  "Shreya", "Ritu", "Nisha", "Swati", "Aarti", "Fatima", "Zainab",
                  "Ayesha", "Radhika", "Sunita", "Deepika", "Rashmi", "Alisha", "Tanvi"]
LAST_NAMES = ["Sharma", "Mehta", "Patil", "Deshmukh", "Kulkarni", "Iyer", "Nair", "Rao",
              "Joshi", "Gupta", "Shah", "Kapoor", "Verma", "Reddy", "Pillai", "Khan",
              "Sheikh", "D'Souza", "Fernandes", "Bhatt", "Agarwal", "Chatterjee", "Banerjee"]

LANGUAGE_POOL = ["English", "Hindi", "Marathi", "Gujarati", "Urdu", "Tamil", "Bengali", "Kannada"]

def random_languages():
    langs = ["English", "Hindi"]
    extra_pool = [l for l in LANGUAGE_POOL if l not in langs]
    extra = random.sample(extra_pool, k=random.choice([0, 1, 1, 2]))
    return langs + extra

def random_name():
    gender = random.choice(["M", "F"])
    first = random.choice(FIRST_NAMES_M if gender == "M" else FIRST_NAMES_F)
    last = random.choice(LAST_NAMES)
    return f"Dr. {first} {last}"

# ---------------------------------------------------------------------------
# 3. DOCTORS — ~50 doctors distributed across the 15 clinics
# ---------------------------------------------------------------------------

doctors = []
doctor_counter = 1

# Ensure every clinic gets 3-4 doctors, and every specialization appears
# multiple times across the city (needed for realistic nearby-search demos).
spec_cycle = SPECIALIZATIONS * 5  # oversample, then trim
random.shuffle(spec_cycle)

TARGET_DOCTOR_COUNT = 50
doctors_per_clinic = {c["id"]: 0 for c in CLINICS}

spec_index = 0
while len(doctors) < TARGET_DOCTOR_COUNT:
    clinic = CLINICS[len(doctors) % len(CLINICS)]
    spec = spec_cycle[spec_index % len(spec_cycle)]
    spec_index += 1

    doctor_id = f"doc_{doctor_counter:02d}"
    name = random_name()
    exp = random.randint(4, 32)
    fee = random.choice([400, 500, 600, 700, 800, 900, 1000, 1200, 1500, 1800, 2000])
    rating = round(random.uniform(4.2, 5.0), 1)
    slot_duration = random.choice([15, 20])
    languages = random_languages()
    qualification = random.choice(QUALIFICATIONS[spec["id"]])
    bio_template = random.choice(BIO_TEMPLATES)
    bio = bio_template.format(spec_lower=spec["name"].lower(), exp=exp)

    doctors.append(dict(
        id=doctor_id,
        clinicId=clinic["id"],
        specializationId=spec["id"],
        name=name,
        qualification=qualification,
        experienceYears=exp,
        consultationFee=fee,       # DEMO DATA
        avgRating=rating,          # DEMO DATA
        reviewCount=0,             # no real Review rows seeded yet
        languages=languages,
        bio=bio,                   # DEMO DATA
        slotDurationMinutes=slot_duration,
        avgConsultationMinutes=slot_duration,
    ))
    doctors_per_clinic[clinic["id"]] += 1
    doctor_counter += 1

# ---------------------------------------------------------------------------
# 4. AVAILABILITY — realistic weekly schedule per doctor
# ---------------------------------------------------------------------------

availability = []
avail_id = 1
WEEKDAYS = [0, 1, 2, 3, 4]  # Mon-Fri (0=Mon per ISO convention used in this schema)

for doc in doctors:
    # ~70% doctors: Mon-Fri, two sessions/day. ~30%: Mon-Sat, morning-only + evening.
    works_saturday = random.random() < 0.3
    days = WEEKDAYS + ([5] if works_saturday else [])
    for day in days:
        # Morning session
        availability.append(dict(
            id=f"avail_{avail_id:03d}", doctorId=doc["id"], dayOfWeek=day,
            startTime="10:00", endTime="14:00",
            slotDurationMinutes=doc["slotDurationMinutes"],
        ))
        avail_id += 1
        # Evening session (skipped on Saturday for half-day doctors)
        if not (day == 5 and works_saturday):
            availability.append(dict(
                id=f"avail_{avail_id:03d}", doctorId=doc["id"], dayOfWeek=day,
                startTime="17:00", endTime="20:00",
                slotDurationMinutes=doc["slotDurationMinutes"],
            ))
            avail_id += 1

# ---------------------------------------------------------------------------
# 5. FAQs — 8-10 per clinic
# ---------------------------------------------------------------------------

FAQ_TEMPLATES = [
    ("What are your consultation fees?",
     "Consultation fees vary by doctor and specialization, typically ranging from ₹400 to ₹2000. Exact fees are shown on each doctor's profile before booking."),
    ("Is parking available at the clinic?",
     "Yes, paid parking is available on the premises for patients and visitors."),
    ("Do you accept health insurance?",
     "We accept cashless treatment from most major insurance providers. Please carry your insurance card and ID proof; our front desk can verify coverage on arrival."),
    ("Can I walk in without an appointment?",
     "Yes, walk-in patients are welcome. Scan the QR code at reception to join the live queue for your preferred doctor."),
    ("How do I get my lab reports or test results?",
     "Reports are typically available within 24-48 hours and can be collected at reception or accessed via the Patient Portal, depending on the test."),
    ("What are your emergency timings?",
     "Our emergency department operates 24x7, including holidays."),
    ("Can I reschedule or cancel my appointment online?",
     "Yes, you can reschedule or cancel any upcoming appointment directly from the Patient Portal up to 2 hours before the scheduled time."),
    ("Do you offer video consultations?",
     "Select doctors offer video consultations. This is indicated on the doctor's profile if available."),
    ("Is there a pharmacy on site?",
     "Yes, an in-house pharmacy is available during clinic operating hours."),
    ("What documents should I bring for my first visit?",
     "Please bring a valid photo ID, any previous medical records or prescriptions, and your insurance card if applicable."),
]

faqs = []
faq_id = 1
for clinic in CLINICS:
    count = random.randint(8, 10)
    chosen = random.sample(FAQ_TEMPLATES, k=count)
    for q, a in chosen:
        faqs.append(dict(id=f"faq_{faq_id:03d}", clinicId=clinic["id"], question=q, answer=a))
        faq_id += 1

# ---------------------------------------------------------------------------
# 6. PATIENTS — demo patient pool
# ---------------------------------------------------------------------------

patients = []
PATIENT_FIRST = ["Rahul", "Simran", "Arjun", "Pooja", "Karan", "Ananya", "Vivaan", "Ishita",
                  "Aryan", "Diya", "Rohit", "Naina", "Sameer", "Kritika", "Yash", "Meher",
                  "Om", "Tara", "Aakash", "Riya"]
for i, first in enumerate(PATIENT_FIRST, start=1):
    last = random.choice(LAST_NAMES)
    patients.append(dict(
        id=f"patient_{i:02d}",
        clerkUserId=f"user_demo_{i:02d}",
        name=f"{first} {last}",
        email=f"{first.lower()}.{last.lower()}{i}@demo.clinicai.example",
        phone=f"+91-98{random.randint(10000000, 99999999)}",
    ))

# ---------------------------------------------------------------------------
# 7. APPOINTMENTS — mix of upcoming SCHEDULED and today's WALK_IN
# ---------------------------------------------------------------------------

appointments = []
appt_id = 1
today = date(2026, 8, 7)  # matches "current date" used for this seed snapshot

# 7a. Some future SCHEDULED appointments
for i in range(15):
    doc = random.choice(doctors)
    patient = random.choice(patients)
    future_date = today + timedelta(days=random.randint(1, 10))
    hour = random.choice([10, 11, 12, 13, 17, 18, 19])
    minute = random.choice([0, 15, 30, 45])
    appointments.append(dict(
        id=f"appt_{appt_id:03d}",
        patientId=patient["id"],
        doctorId=doc["id"],
        type="SCHEDULED",
        status="confirmed",
        date=future_date.isoformat(),
        startTime=f"{hour:02d}:{minute:02d}",
    ))
    appt_id += 1

# 7b. Walk-in appointments for today, feeding the live queue (see section 8)
WALKIN_DOCS = random.sample(doctors, k=4)  # 4 doctors have an active queue today

walkin_appointments = []
for doc in WALKIN_DOCS:
    n_waiting = random.randint(3, 7)
    for _ in range(n_waiting):
        patient = random.choice(patients)
        a = dict(
            id=f"appt_{appt_id:03d}",
            patientId=patient["id"],
            doctorId=doc["id"],
            type="WALK_IN",
            status="confirmed",
            date=today.isoformat(),
            startTime=None,
        )
        appointments.append(a)
        walkin_appointments.append(a)
        appt_id += 1

# ---------------------------------------------------------------------------
# 8. QUEUE ENTRIES — live walk-in queue demo data
# ---------------------------------------------------------------------------

queue_entries = []
queue_id = 1
STATUS_CYCLE = ["completed", "completed", "in_consultation", "waiting", "waiting", "waiting", "waiting"]

grouped = {}
for a in walkin_appointments:
    grouped.setdefault(a["doctorId"], []).append(a)

for doctor_id, appts in grouped.items():
    for position, a in enumerate(appts, start=1):
        status = STATUS_CYCLE[position - 1] if position <= len(STATUS_CYCLE) else "waiting"
        queue_entries.append(dict(
            id=f"queue_{queue_id:03d}",
            appointmentId=a["id"],
            doctorId=doctor_id,
            queueDate=today.isoformat(),
            queueNumber=position,      # immutable ticket number, per SCHEMA_CHANGES.md §4
            position=position,          # mutable live rank — starts equal to queueNumber
            status=status,
            joinedAt=f"{today.isoformat()}T{9 + position:02d}:{random.choice(['00','15','30','45'])}:00",
        ))
        queue_id += 1

# ---------------------------------------------------------------------------
# ASSEMBLE + WRITE
# ---------------------------------------------------------------------------

seed_data = dict(
    meta=dict(
        generatedAt=datetime(2026, 8, 7).isoformat(),
        city="Mumbai",
        note=(
            "Clinic names, addresses, areas, and pincodes are real, publicly listed "
            "Mumbai hospitals. Doctor names, fees, ratings, bios, schedules, FAQs, "
            "patients, appointments, and queue data are SYNTHETIC DEMO DATA generated "
            "for development/demo purposes only -- not real doctors, fees, or patients."
        ),
    ),
    specializations=SPECIALIZATIONS,
    clinics=CLINICS,
    doctors=doctors,
    availability=availability,
    faqs=faqs,
    patients=patients,
    appointments=appointments,
    queueEntries=queue_entries,
)

with open("seed-data.json", "w") as f:
    json.dump(seed_data, f, indent=2)

print(f"Clinics: {len(CLINICS)}")
print(f"Specializations: {len(SPECIALIZATIONS)}")
print(f"Doctors: {len(doctors)}")
print(f"Availability rows: {len(availability)}")
print(f"FAQs: {len(faqs)}")
print(f"Patients: {len(patients)}")
print(f"Appointments: {len(appointments)} (scheduled: 15, walk-in: {len(walkin_appointments)})")
print(f"Queue entries: {len(queue_entries)} across {len(grouped)} doctors")
print("Written to seed-data.json")
