import requests
import json
import time
import uuid

BASE_URL = "http://127.0.0.1:8000/api/v1"
ADMIN_EMAIL = "admin@example.com"
PATIENT_EMAIL = f"patient_{uuid.uuid4().hex[:6]}@example.com"
DOCTOR_EMAIL = f"doctor_{uuid.uuid4().hex[:6]}@example.com"

def print_result(step, response):
    try:
        data = response.json()
    except:
        data = response.text
    print(f"--- {step} ---")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(data, indent=2)}")
    print()
    if response.status_code >= 400:
        raise Exception(f"Step '{step}' failed with status {response.status_code}")
    return data

def main():
    # Wait for server to be up
    time.sleep(2)

    # 1. Register ADMIN
    admin_data = {
        "email": "admin@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "first_name": "Admin",
        "last_name": "User",
        "role": "ADMIN"
    }
    # ignore error if already exists
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=admin_data)
        if r.status_code == 400 and "already exists" in r.text:
            pass
        else:
            print_result("Register ADMIN", r)
    except:
        pass

    # Login Admin
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@example.com", "password": "Password123!"})
    admin_login = print_result("Login ADMIN", r)
    admin_token = admin_login["access"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register PATIENT
    patient_data = {
        "email": PATIENT_EMAIL,
        "password": "Password123!",
        "password_confirm": "Password123!",
        "first_name": "John",
        "last_name": "Doe",
        "role": "PATIENT"
    }
    try:
        r = requests.post(f"{BASE_URL}/auth/register", json=patient_data)
        if r.status_code == 400 and "already exists" in r.text:
            pass
        else:
            print_result("Register PATIENT", r)
    except:
        pass
    
    r = requests.post(f"{BASE_URL}/auth/login", json={"email": PATIENT_EMAIL, "password": "Password123!"})
    patient_login = print_result("Login PATIENT", r)
    patient_token = patient_login["access"]
    patient_headers = {"Authorization": f"Bearer {patient_token}"}
    patient_user_id = patient_login["user"]["id"]

    # 3. Fetch Patient Profile (creates Patient implicitly)
    r = requests.get(f"{BASE_URL}/patients/profile", headers=patient_headers)
    patient_profile = print_result("Fetch Patient Profile", r)
    patient_id = patient_profile["id"] # patient ID, not user ID

    # Update Patient Profile
    r = requests.put(f"{BASE_URL}/patients/profile", headers=patient_headers, json={"blood_type": "O+"})
    print_result("Update Patient Profile", r)

    # 4. Create Staff (Doctor) as Admin
    staff_data = {
        "email": DOCTOR_EMAIL,
        "password": "Password123!",
        "first_name": "Doc",
        "last_name": "Tor",
        "role": "DOCTOR",
        "hospital": 1,
        "department": "CARDIOLOGY",
        "license_no": "LIC12345"
    }
    r = requests.post(f"{BASE_URL}/staff/", headers=admin_headers, json=staff_data)
    
    # Let's inspect the Staff response or failure
    staff_result = print_result("Create Staff", r)
    staff_id = staff_result["id"]
    
    # 5. Login DOCTOR (just to get token if needed, or we can use admin to create appointment)
    # Actually staff is created with password? Wait, StaffCreateSerializer doesn't take password in my payload.
    # It might create a dummy password or require one. Let's see if it works.

    # 6. Create Appointment
    appt_data = {
        "patient": patient_id,
        "staff": staff_id,
        "scheduled_at": "2026-06-05T10:00:00Z",
        "duration_min": 30,
        "appointment_type": "IN_PERSON"
    }
    # Patient creates appointment
    r = requests.post(f"{BASE_URL}/appointments/", headers=patient_headers, json=appt_data)
    appt_result = print_result("Create Appointment", r)
    
    # 7. Check Notifications (Patient)
    r = requests.get(f"{BASE_URL}/notifications/", headers=patient_headers)
    print_result("Check Patient Notifications", r)

    # 8. Check Audit Logs (Admin)
    r = requests.get(f"{BASE_URL}/audit-logs/", headers=admin_headers)
    print_result("Check Audit Logs", r)

    print("All integration tests passed successfully!")

if __name__ == "__main__":
    main()
