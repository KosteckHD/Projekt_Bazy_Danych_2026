CREATE OR REPLACE VIEW vw_current_rentals_by_user AS
SELECT
    r.rentId,
    r.userId,
    u.firstName,
    u.lastName,
    r.carId,
    c.VIN,
    c.registrationNumber,
    m.modelName,
    b.brandName,
    r.startDate,
    r.expectedEndDate,
    r.additionalCost,
    r.totalCost
FROM Rents r
JOIN Users u ON r.userId = u.userId
JOIN Cars c ON r.carId = c.carId
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId
WHERE r.status = 'Started'
  AND r.endDate IS NULL;

CREATE OR REPLACE VIEW vw_all_rentals_by_user AS
SELECT
    r.rentId,
    r.userId,
    u.firstName,
    u.lastName,
    r.carId,
    c.VIN,
    c.registrationNumber,
    m.modelName,
    b.brandName,
    r.startDate,
    r.expectedEndDate,
    r.endDate,
    r.additionalCost,
    r.totalCost,
    r.status
FROM Rents r
JOIN Users u ON r.userId = u.userId
JOIN Cars c ON r.carId = c.carId
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId;

CREATE OR REPLACE VIEW vw_available_cars AS
SELECT
    c.carId,
    c.VIN,
    c.registrationNumber,
    c.status,
    c.color,
    c.doorAmount,
    c.productionDate,
    c.carEngine,
    c.horsePower,
    c.bodyType,
    c.mileage,
    c.branchId,
    br.branchName,
    m.modelId,
    m.modelName,
    m.hourlyCost,
    b.brandId,
    b.brandName
FROM Cars c
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId
LEFT JOIN Branches br ON c.branchId = br.branchId
WHERE c.status = 'Available'
  AND c.isActive = TRUE;

CREATE OR REPLACE VIEW vw_most_popular_cars AS
SELECT
    b.brandId,
    b.brandName,
    m.modelId,
    m.modelName,
    COUNT(r.rentId) AS rental_count
FROM Models m
JOIN Brands b ON m.brandId = b.brandId
LEFT JOIN Cars c ON c.modelId = m.modelId
LEFT JOIN Rents r ON r.carId = c.carId
GROUP BY b.brandId, b.brandName, m.modelId, m.modelName
ORDER BY rental_count DESC, b.brandName ASC, m.modelName ASC;

CREATE OR REPLACE VIEW vw_overdue_rentals AS
SELECT
    r.rentId,
    r.userId,
    u.firstName,
    u.lastName,
    r.carId,
    c.VIN,
    c.registrationNumber,
    m.modelName,
    b.brandName,
    r.startDate,
    r.expectedEndDate,
    NOW() - r.expectedEndDate AS overdueBy
FROM Rents r
JOIN Users u ON r.userId = u.userId
JOIN Cars c ON r.carId = c.carId
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId
WHERE r.status = 'Started'
  AND r.endDate IS NULL
  AND r.expectedEndDate < NOW();

CREATE OR REPLACE VIEW vw_revenue_by_day AS
SELECT
    DATE(t.createdAt) AS revenueDate,
    SUM(CASE WHEN t.direction = 'Incoming' THEN t.amount ELSE 0 END) AS incoming,
    SUM(CASE WHEN t.direction = 'Outgoing' THEN t.amount ELSE 0 END) AS outgoing,
    SUM(CASE WHEN t.direction = 'Incoming' THEN t.amount ELSE -t.amount END) AS netRevenue
FROM TransactionHistory t
WHERE t.status = 'Accepted'
GROUP BY DATE(t.createdAt)
ORDER BY revenueDate DESC;
