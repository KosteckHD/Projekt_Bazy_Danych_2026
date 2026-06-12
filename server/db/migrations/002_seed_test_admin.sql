INSERT INTO Users (email, passwordHash, firstName, lastName, phone, role, isActive)
VALUES (
    'admin@admin.com',
    '$2b$12$NxzSGFQyOVTdXoVu123a7uZL5Vh1JJU2DQTTGMzP0KU7wNAjP1blG',
    'Admin',
    'Test',
    '+48000000001',
    'Admin',
    TRUE
)
ON CONFLICT (email) DO UPDATE
SET
    passwordHash = EXCLUDED.passwordHash,
    firstName = EXCLUDED.firstName,
    lastName = EXCLUDED.lastName,
    role = EXCLUDED.role,
    isActive = TRUE,
    updatedAt = NOW();
