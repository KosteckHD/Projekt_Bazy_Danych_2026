CREATE TYPE Countries AS ENUM (
    'Germany',       -- Niemcy (Volkswagen, BMW, Mercedes, Audi, Porsche)
    'Japan',         -- Japonia (Toyota, Honda, Nissan, Mazda, Subaru)
    'USA',           -- USA (Ford, Tesla, Chevrolet, Cadillac, Dodge)
    'Italy',         -- Włochy (Fiat, Ferrari, Lamborghini, Alfa Romeo)
    'France',        -- Francja (Renault, Peugeot, Citroën)
    'South Korea',   -- Korea Południowa (Hyundai, Kia)
    'United Kingdom',-- Wielka Brytania (Aston Martin, Land Rover, Bentley)
    'Sweden',        -- Szwecja (Volvo, Koenigsegg)
    'China',         -- Chiny (BYD, Geely, NIO)
    'Czech Republic',-- Czechy (Skoda)
    'Spain',          -- Hiszpania (SEAT, Cupra)
    'Poland'          --Polska (Maluch)
);

CREATE TYPE Roles AS ENUM (
    'Admin',
    'Manager',
    'Worker',
    'Customer',
    'Banned'
);

CREATE TYPE CarStatus AS ENUM(
    'Available',
    'Rented',
    'Maintenance',
    'Damaged'
);

CREATE TYPE RentStatus AS ENUM(
    'Started',
    'Pending',
    'Ended'
);

CREATE TYPE TransactionStatus AS ENUM(
    'Rejected',
    'Pending',
    'Accepted'
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

CREATE TYPE BodyTypes AS ENUM(
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

CREATE TYPE PaymentMethods AS ENUM(
    'Cash',
    'Card',
    'Check',
    'Gift card'
);

CREATE TABLE IF NOT EXISTS Brands (
    brandId SERIAL PRIMARY KEY,
    brandName VARCHAR(255) NOT NULL,
    country Countries NOT NULL
);

CREATE TABLE IF NOT EXISTS Models (
    modelId SERIAL PRIMARY KEY,
    brandId INTEGER REFERENCES Brands (brandId) NOT NULL,
    hourlyCost DECIMAL(10, 2) NOT NULL,
    modelDescription VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS Cars (
    carId SERIAL PRIMARY KEY,
    modelId INTEGER REFERENCES Models (modelId) NOT NULL,
    status CarStatus NOT NULL,
    color CarColor NOT NULL,
    doorAmount INTEGER NOT NULL,
    productionDate DATE NOT NULL,
    VIN VARCHAR(17) NOT NULL,
    carEngine DECIMAL(3, 1) NOT NULL,
    horsePower INTEGER NOT NULL,
    bodyType BodyTypes NOT NULL
);

CREATE TABLE IF NOT EXISTS Users (
    userId SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    passwordHash VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role Roles NOT NULL
);

CREATE TABLE IF NOT EXISTS Rents (
    rentId SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES Users (userId) NOT NULL,
    carId INTEGER REFERENCES Cars (carId) NOT NULL,
    startDate timestamp NOT NULL,
    expectedEndDate timestamp NOT NULL,
    endDate timestamp,
    additionalCost DECIMAL(10, 2),
    status RentStatus NOT NULL
);

CREATE TABLE IF NOT EXISTS TransactionHistory (
    transactionId SERIAL PRIMARY KEY,
    rentId INTEGER REFERENCES Rents (rentId) NOT NULL,
    status TransactionStatus NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    direction VARCHAR(10),
    paymentMethod paymentMethods
);