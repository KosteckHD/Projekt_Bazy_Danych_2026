CREATE OR REPLACE VIEW vw_current_rentals_by_user AS
SELECT
    r.rentId,
    r.userId,
    u.firstName,
    u.lastName,
    r.carId,
    c.VIN,
    m.modelName,
    b.brandName,
    r.startDate,
    r.expectedEndDate,
    r.additionalCost
FROM Rents r
JOIN Users u ON r.userId = u.userId
JOIN Cars c ON r.carId = c.carId
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId
WHERE r.status = 'Started' AND r.endDate IS NULL;


CREATE OR REPLACE VIEW vw_all_rentals_by_user AS
SELECT
    r.rentId,
    r.userId,
    u.firstName,
    u.lastName,
    r.carId,
    c.VIN,
    m.modelName,
    b.brandName,
    r.startDate,
    r.expectedEndDate,
    r.endDate,
    r.additionalCost,
    r.status
FROM Rents r
JOIN Users u ON r.userId = u.userId
JOIN Cars c ON r.carId = c.carId
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId;

CREATE OR REPLACE VIEW vw_most_popular_cars AS
SELECT
    b.brandName,
    m.modelName,
    COUNT(r.rentId) AS rental_count
FROM Rents r
JOIN Cars c ON r.carId = c.carId
JOIN Models m ON c.modelId = m.modelId
JOIN Brands b ON m.brandId = b.brandId
GROUP BY b.brandName, m.modelName
ORDER BY rental_count DESC;
