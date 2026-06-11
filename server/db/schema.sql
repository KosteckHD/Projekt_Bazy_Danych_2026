CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE Countries AS ENUM (
    'Germany',
    'Japan',
    'USA',
    'Italy',
    'France',
    'South Korea',
    'United Kingdom',
    'Sweden',
    'China',
    'Czech Republic',
    'Spain',
    'Poland'
);

CREATE TYPE Roles AS ENUM (
    'Admin',
    'Manager',
    'Worker',
    'Customer',
    'Banned'
);

CREATE TYPE CarStatus AS ENUM (
    'Available',
    'Rented',
    'Maintenance',
    'Damaged'
);

CREATE TYPE RentStatus AS ENUM (
    'Started',
    'Pending',
    'Ended',
    'Cancelled'
);

CREATE TYPE TransactionStatus AS ENUM (
    'Rejected',
    'Pending',
    'Accepted'
);

CREATE TYPE TransactionType AS ENUM (
    'RentalPayment',
    'Deposit',
    'Refund',
    'Penalty',
    'Correction'
);

CREATE TYPE CarColor AS ENUM (
    'White',
    'Black',
    'Silver',
    'Grey',
    'Blue',
    'Red',
    'Green',
    'Yellow',
    'Orange',
    'Brown',
    'Beige',
    'Gold',
    'Purple',
    'Burgundy',
    'Other'
);

CREATE TYPE BodyTypes AS ENUM (
    'SEDAN',
    'HATCHBACK',
    'COMBI',
    'LIFTBACK',
    'COUPE',
    'ROADSTER',
    'TARGA',
    'FASTBACK',
    'MPV',
    'SUV',
    'CROSSOVER',
    'PICKUP',
    'VAN',
    'MINIBUS',
    'LIMUZYNA',
    'CABRIOLET',
    'SHOOTING_BRAKE',
    'LANDULET',
    'UAZ'
);

CREATE TYPE PaymentMethods AS ENUM (
    'Cash',
    'Card',
    'Check',
    'Gift card',
    'Bank transfer'
);

CREATE TYPE PaymentDirection AS ENUM (
    'Incoming',
    'Outgoing'
);

CREATE TABLE IF NOT EXISTS Branches (
    branchId SERIAL PRIMARY KEY,
    branchName VARCHAR(255) NOT NULL UNIQUE,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(15) CHECK (phone IS NULL OR phone ~ '^\+?[0-9]{9,15}$'),
    email VARCHAR(255) CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Brands (
    brandId SERIAL PRIMARY KEY,
    brandName VARCHAR(255) NOT NULL UNIQUE,
    country Countries NOT NULL,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Models (
    modelId SERIAL PRIMARY KEY,
    modelName VARCHAR(255) NOT NULL,
    brandId INTEGER NOT NULL REFERENCES Brands (brandId) ON DELETE RESTRICT ON UPDATE CASCADE,
    hourlyCost DECIMAL(10, 2) NOT NULL CHECK (hourlyCost > 0),
    modelDescription VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_models_brand_name UNIQUE (brandId, modelName)
);

CREATE TABLE IF NOT EXISTS Cars (
    carId SERIAL PRIMARY KEY,
    modelId INTEGER NOT NULL REFERENCES Models (modelId) ON DELETE RESTRICT ON UPDATE CASCADE,
    branchId INTEGER REFERENCES Branches (branchId) ON DELETE SET NULL ON UPDATE CASCADE,
    status CarStatus NOT NULL DEFAULT 'Available',
    color CarColor NOT NULL,
    doorAmount INTEGER NOT NULL CHECK (doorAmount > 0),
    productionDate DATE NOT NULL CHECK (productionDate <= CURRENT_DATE),
    VIN VARCHAR(17) NOT NULL UNIQUE CHECK (VIN ~ '^[A-HJ-NPR-Z0-9]{17}$'),
    registrationNumber VARCHAR(32) UNIQUE,
    mileage INTEGER NOT NULL DEFAULT 0 CHECK (mileage >= 0),
    carEngine DECIMAL(3, 1) NOT NULL CHECK (carEngine >= 0),
    horsePower INTEGER NOT NULL CHECK (horsePower > 0),
    bodyType BodyTypes NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Users (
    userId SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL UNIQUE CHECK (phone ~ '^\+?[0-9]{9,15}$'),
    role Roles NOT NULL DEFAULT 'Customer',
    branchId INTEGER REFERENCES Branches (branchId) ON DELETE SET NULL ON UPDATE CASCADE,
    driverLicenseNumber VARCHAR(64) UNIQUE,
    driverLicenseExpiresAt DATE,
    birthDate DATE CHECK (birthDate IS NULL OR birthDate <= CURRENT_DATE),
    address VARCHAR(255),
    isActive BOOLEAN NOT NULL DEFAULT TRUE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS Rents (
    rentId SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES Users (userId) ON DELETE RESTRICT ON UPDATE CASCADE,
    carId INTEGER NOT NULL REFERENCES Cars (carId) ON DELETE RESTRICT ON UPDATE CASCADE,
    workerId INTEGER REFERENCES Users (userId) ON DELETE SET NULL ON UPDATE CASCADE,
    pickupBranchId INTEGER REFERENCES Branches (branchId) ON DELETE SET NULL ON UPDATE CASCADE,
    returnBranchId INTEGER REFERENCES Branches (branchId) ON DELETE SET NULL ON UPDATE CASCADE,
    startDate TIMESTAMP NOT NULL,
    expectedEndDate TIMESTAMP NOT NULL CHECK (expectedEndDate > startDate),
    endDate TIMESTAMP CHECK (endDate >= startDate OR endDate IS NULL),
    additionalCost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (additionalCost >= 0),
    totalCost DECIMAL(10, 2) CHECK (totalCost IS NULL OR totalCost >= 0),
    status RentStatus NOT NULL DEFAULT 'Pending',
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_rents_status_dates CHECK (
        (status = 'Ended' AND endDate IS NOT NULL)
        OR (status IN ('Pending', 'Started') AND endDate IS NULL)
        OR status = 'Cancelled'
    ),
    CONSTRAINT ex_rents_no_car_overlap EXCLUDE USING gist (
        carId WITH =,
        tsrange(startDate, COALESCE(endDate, expectedEndDate), '[)') WITH &&
    ) WHERE (status IN ('Pending', 'Started'))
);

CREATE TABLE IF NOT EXISTS TransactionHistory (
    transactionId SERIAL PRIMARY KEY,
    rentId INTEGER NOT NULL REFERENCES Rents (rentId) ON DELETE RESTRICT ON UPDATE CASCADE,
    status TransactionStatus NOT NULL DEFAULT 'Pending',
    transactionType TransactionType NOT NULL DEFAULT 'RentalPayment',
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    direction PaymentDirection NOT NULL,
    paymentMethod PaymentMethods,
    externalPaymentId VARCHAR(255),
    invoiceNumber VARCHAR(255),
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_accepted_transaction_has_method CHECK (
        status <> 'Accepted' OR paymentMethod IS NOT NULL
    )
);

CREATE TABLE IF NOT EXISTS CarServiceRecords (
    serviceRecordId SERIAL PRIMARY KEY,
    carId INTEGER NOT NULL REFERENCES Cars (carId) ON DELETE RESTRICT ON UPDATE CASCADE,
    description TEXT NOT NULL,
    serviceDate DATE NOT NULL DEFAULT CURRENT_DATE,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    isCompleted BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS CarDamageReports (
    damageReportId SERIAL PRIMARY KEY,
    carId INTEGER NOT NULL REFERENCES Cars (carId) ON DELETE RESTRICT ON UPDATE CASCADE,
    rentId INTEGER REFERENCES Rents (rentId) ON DELETE SET NULL ON UPDATE CASCADE,
    description TEXT NOT NULL,
    repairCost DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (repairCost >= 0),
    isResolved BOOLEAN NOT NULL DEFAULT FALSE,
    reportedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    resolvedAt TIMESTAMP,
    createdAt TIMESTAMP NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_damage_resolution_date CHECK (
        (isResolved = FALSE AND resolvedAt IS NULL)
        OR (isResolved = TRUE AND resolvedAt IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_models_brand_id ON Models (brandId);
CREATE INDEX IF NOT EXISTS idx_cars_model_id ON Cars (modelId);
CREATE INDEX IF NOT EXISTS idx_cars_status ON Cars (status);
CREATE INDEX IF NOT EXISTS idx_cars_branch_id ON Cars (branchId);
CREATE INDEX IF NOT EXISTS idx_users_branch_id ON Users (branchId);
CREATE INDEX IF NOT EXISTS idx_rents_user_id ON Rents (userId);
CREATE INDEX IF NOT EXISTS idx_rents_car_id ON Rents (carId);
CREATE INDEX IF NOT EXISTS idx_rents_status ON Rents (status);
CREATE INDEX IF NOT EXISTS idx_rents_dates ON Rents (startDate, expectedEndDate, endDate);
CREATE INDEX IF NOT EXISTS idx_transactions_rent_id ON TransactionHistory (rentId);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON TransactionHistory (status);
