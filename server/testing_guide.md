# Instrukcja testowania bazy danych w Dockerze

Poniżej znajdziesz kroki, które pozwolą Ci zresetować bazę, dodać testowe dane i sprawdzić, czy widoki działają poprawnie.

## 1. Resetowanie bazy danych

Jeśli zmieniałeś schemat (np. `schema.sql`), musisz usunąć stary wolumen danych, aby Docker zainicjalizował bazę od nowa.

```bash
# Zatrzymaj kontenery i usuń wolumeny
docker-compose down -v

# Uruchom wszystko ponownie
docker-compose up -d --build
```

## 2. Wejście do konsoli bazy danych

Możesz połączyć się z bazą bezpośrednio wewnątrz kontenera za pomocą `psql`:

```bash
docker exec -it wypozyczalnia-db psql -U root -d rental_db
```

## 3. Przykładowe dane do testów (SQL, w psql)

```sql
-- 1. Dodanie marki
INSERT INTO Brands (brandName, country) VALUES ('Tesla', 'USA');

-- 2. Dodanie modelu
INSERT INTO Models (brandId, hourlyCost, modelName, modelDescription) VALUES (1, 50.00, 'Model S', 'Luksusowy elektryczny sedan');

-- 3. Dodanie samochodu
INSERT INTO Cars (modelId, status, color, doorAmount, productionDate, VIN, carEngine, horsePower, bodyType)VALUES (1, 'Available', 'White', 4, '2023-01-01', '12345678901234567', 0.0, 670, 'SEDAN');

-- 4. Dodanie użytkownika
INSERT INTO Users (email, passwordHash, firstName, lastName, phone, role) VALUES ('test@example.com', 'hashed_password', 'Jan', 'Kowalski', '+48123456789', 'Customer');

-- 5. Dodanie wypożyczenia (aby przetestować widok vw_current_rentals_by_user)
INSERT INTO Rents (userId, carId, startDate, expectedEndDate, status) VALUES (1, 1, NOW(), NOW() + interval '24 hours', 'Started');
```

## 4. Testowanie widoków

```sql
-- Sprawdzenie aktualnych wypożyczeń
SELECT * FROM vw_current_rentals_by_user;

-- Sprawdzenie wszystkich wypożyczeń
SELECT * FROM vw_all_rentals_by_user;

-- Sprawdzenie najpopularniejszych samochodów
SELECT * FROM vw_most_popular_cars;
```

## 5. Wyjście z konsoli psql

```sql
\q
```
