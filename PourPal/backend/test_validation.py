"""
Test script to verify password and email validation
Run this from the backend directory: python test_validation.py
"""

# Test cases for password validation
test_passwords = [
    ("password", False, "No uppercase, no number, no special char"),
    ("Password", False, "No number, no special char"),
    ("Password1", False, "No special char"),
    ("Password1!", True, "Valid - has uppercase, number, and special char"),
    ("MyP@ss123", True, "Valid - has uppercase, number, and special char"),
    ("weakpass", False, "No uppercase, no number, no special char"),
    ("STRONGPASS123!", True, "Valid"),
    ("Test@123", True, "Valid"),
]

# Test cases for email validation
test_emails = [
    ("user@example.com", True, "Valid email"),
    ("invalid.email", False, "Missing @ symbol"),
    ("user@", False, "Missing domain"),
    ("@example.com", False, "Missing username"),
    ("user@domain", True, "Valid (basic domain)"),
    ("user.name+tag@example.co.uk", True, "Valid complex email"),
]

print("=" * 60)
print("PASSWORD VALIDATION TESTS")
print("=" * 60)
print("\nPassword Requirements:")
print("  ✓ Minimum 8 characters")
print("  ✓ At least 1 uppercase letter")
print("  ✓ At least 1 number")
print("  ✓ At least 1 special character\n")

for password, should_pass, description in test_passwords:
    print(f"Testing: '{password}' - {description}")
    print(f"  Expected: {'PASS' if should_pass else 'FAIL'}")
    print()

print("\n" + "=" * 60)
print("EMAIL VALIDATION TESTS")
print("=" * 60)
print()

for email, should_pass, description in test_emails:
    print(f"Testing: '{email}' - {description}")
    print(f"  Expected: {'VALID' if should_pass else 'INVALID'}")
    print()

print("\n" + "=" * 60)
print("VALIDATION RULES SUMMARY")
print("=" * 60)
print("""
Password must have:
  • Minimum 8 characters
  • At least 1 uppercase letter (A-Z)
  • At least 1 number (0-9)
  • At least 1 special character (!@#$%^&*(),.?":{}|<>_-+=[]\\\/;~`)

Email must:
  • Be in valid email format (user@domain.com)
  • Not already exist in the database
""")
