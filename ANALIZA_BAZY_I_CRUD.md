# Analiza bazy danych i plan funkcjonalnosci CRUD

## Kontekst

Projekt opisuje baze danych dla wypozyczalni samochodowej. Obecny schemat znajduje sie w `server/db/schema.sql`, a widoki raportowe w `server/db/views.sql`.

Ocena: baza zawiera poprawny rdzen domeny, ale nie jest jeszcze kompletna jako produkcyjny model wypozyczalni samochodowej. Nadaje sie jako start projektu akademickiego, natomiast przed implementacja aplikacji warto doprecyzowac reguly biznesowe, dopisac ograniczenia integralnosci oraz przygotowac operacje CRUD wokol realnych procesow: rezerwacji, wydania auta, zwrotu, platnosci i obslugi floty.

## Co jest zrobione poprawnie

- Istnieje podstawowy podzial na marki, modele, samochody, uzytkownikow, wypozyczenia i historie transakcji.
- Klucze glowne sa zdefiniowane dla wszystkich tabel.
- Relacje podstawowe sa zachowane:
  - model nalezy do marki,
  - samochod nalezy do modelu,
  - wypozyczenie laczy uzytkownika i samochod,
  - transakcja jest przypisana do wypozyczenia.
- Wykorzystano typy ENUM dla rol, statusow, kolorow, nadwozi, metod platnosci i krajow.
- Dodano podstawowe walidacje:
  - unikalny VIN,
  - unikalny email i telefon,
  - dodatni koszt godzinowy modelu,
  - poprawna kolejnosc dat wypozyczenia,
  - dodatnia kwota transakcji.
- Widoki `vw_current_rentals_by_user`, `vw_all_rentals_by_user` i `vw_most_popular_cars` sa sensownym poczatkiem raportowania.

## Najwazniejsze problemy i braki

### Integralnosc wypozyczen

- Brakuje ograniczenia, ktore blokuje wypozyczenie tego samego samochodu w nakladajacych sie terminach.
- Brakuje ograniczenia, ktore pozwala miec tylko jedno aktywne wypozyczenie danego auta.
- Status auta `Rented` nie jest automatycznie powiazany ze statusem wypozyczenia `Started`.
- Status wypozyczenia nie wymusza zgodnosci z datami:
  - `Ended` powinno miec `endDate`,
  - `Started` i `Pending` zwykle nie powinny miec `endDate`.
- `additionalCost` moze byc `NULL`; praktyczniej ustawic `NOT NULL DEFAULT 0`.
- Nie ma pola z calkowitym kosztem wypozyczenia albo sposobu jego wyliczania.

### Braki domenowe

- Brakuje danych klienta potrzebnych przy wynajmie:
  - numer prawa jazdy,
  - data waznosci prawa jazdy,
  - data urodzenia,
  - adres,
  - ewentualna weryfikacja klienta.
- Brakuje oddzialow wypozyczalni i lokalizacji odbioru oraz zwrotu.
- Brakuje procesu rezerwacji przed rozpoczeciem wypozyczenia.
- Brakuje tabeli uszkodzen, przegladow, serwisow i historii statusow samochodu.
- Brakuje przebiegu pojazdu, numeru rejestracyjnego, zdjec/zalacznikow i informacji ubezpieczeniowych.
- Brakuje pracownika obslugujacego wydanie i zwrot auta.

### Ograniczenia danych

- `Brands.brandName` nie jest unikalne.
- `Models` nie blokuje duplikatow tej samej nazwy modelu w ramach marki.
- `Cars.carEngine` i `Cars.horsePower` nie maja kontroli dodatnich wartosci.
- `Cars.productionDate` moze byc data z przyszlosci.
- VIN ma tylko kontrole dlugosci, bez kontroli dozwolonych znakow.
- Klucze obce nie maja jawnie zdefiniowanych zasad `ON DELETE` i `ON UPDATE`.
- Brakuje indeksow na najczesciej filtrowanych kolumnach, np. `Rents.userId`, `Rents.carId`, `Rents.status`, `Cars.status`, `Models.brandId`.

### Transakcje i platnosci

- `TransactionHistory` nie ma daty utworzenia transakcji.
- `direction` i `paymentMethod` sa opcjonalne, ale nie opisano, kiedy moga byc puste.
- Brakuje identyfikatora zewnetrznej platnosci, numeru faktury/paragonu albo typu operacji: oplata, zwrot, kara, korekta.
- Nazwa `TransactionHistory` sugeruje historie, ale tabela pelni role podstawowej tabeli platnosci.

### Raporty i widoki

- Widok aktualnych wypozyczen pokazuje tylko status `Started`, co jest poprawne dla aktywnych wynajmow, ale nie obejmuje rezerwacji `Pending`.
- Widok popularnosci liczy tylko modele, ktore byly juz wypozyczone. Jesli raport ma pokazywac tez auta bez wypozyczen, trzeba uzyc `LEFT JOIN`.
- Brakuje widokow dla dostepnych samochodow, zaleglych zwrotow, przychodow i historii klienta.

### Backend i uruchamianie

- Backend obecnie ma tylko endpoint testowy `/` i nie laczy sie jeszcze z baza danych.
- W `docker-compose.yml` backend mapuje port `3000:3000`, ale `Dockerfile` wystawia `1337`. To nie blokuje samej bazy, ale jest niespojnoscia konfiguracji.
- Montowanie wolumenu backendu wskazuje `/app`, podczas gdy `Dockerfile` ustawia `WORKDIR /server`. To moze powodowac problemy przy developmentcie w kontenerze.

## Rekomendowane zmiany w schemacie

### Priorytet 1

- Dodac ograniczenie blokujace nakladajace sie aktywne wypozyczenia jednego auta.
- Dodac indeks czesciowy albo constraint pilnujacy jednego aktywnego wypozyczenia dla `carId`.
- Dopisac reguly statusow wypozyczenia i auta.
- Ustawic `additionalCost NOT NULL DEFAULT 0`.
- Dodac indeksy pod najczestsze zapytania.
- Dodac daty utworzenia i aktualizacji dla kluczowych tabel.

### Priorytet 2

- Dodac tabela `Branches` albo `Locations`.
- Dodac `pickupBranchId` i `returnBranchId` do wypozyczenia/rezerwacji.
- Dodac dane prawa jazdy klienta.
- Dodac przebieg auta i numer rejestracyjny.
- Dodac tabele `CarServiceRecords` i `CarDamageReports`.
- Rozdzielic rezerwacje od faktycznych wypozyczen albo jasno opisac, ze `Rents.status = Pending` oznacza rezerwacje.

### Priorytet 3

- Dodac faktury, rabaty, kaucje i cenniki sezonowe.
- Dodac audyt zmian statusow.
- Dodac soft delete dla encji, ktorych nie powinno sie fizycznie usuwac po powiazaniu z wypozyczeniami.

## Funkcjonalnosci do realizacji przez agenta AI

Ponizsza lista opisuje funkcjonalnosci, ktore powinny byc zaimplementowane w aplikacji. Agent AI powinien traktowac je jako backlog backendu/API oraz logiki bazy danych.

## CRUD: Marki samochodow

Encja: `Brands`

- Create: dodanie marki z nazwa i krajem.
- Read:
  - lista wszystkich marek,
  - szczegoly jednej marki,
  - lista marek z liczba modeli i aut.
- Update: edycja nazwy i kraju marki.
- Delete: usuniecie marki tylko wtedy, gdy nie ma przypisanych modeli; w przeciwnym razie zwrocic blad biznesowy.
- Walidacje:
  - nazwa marki wymagana,
  - nazwa marki powinna byc unikalna,
  - kraj musi nalezec do ENUM `Countries`.

## CRUD: Modele samochodow

Encja: `Models`

- Create: dodanie modelu do istniejacej marki z kosztem godzinowym i opisem.
- Read:
  - lista modeli,
  - modele danej marki,
  - szczegoly modelu z marka,
  - modele z liczba dostepnych aut.
- Update: edycja nazwy, marki, kosztu godzinowego i opisu.
- Delete: usuniecie modelu tylko wtedy, gdy nie ma przypisanych samochodow.
- Walidacje:
  - koszt godzinowy wiekszy od 0,
  - model musi miec istniejaca marke,
  - nazwa modelu powinna byc unikalna w ramach marki.

## CRUD: Samochody

Encja: `Cars`

- Create: dodanie auta do floty.
- Read:
  - lista wszystkich aut,
  - szczegoly auta z marka i modelem,
  - lista aut dostepnych do wynajmu,
  - filtrowanie po marce, modelu, statusie, kolorze, typie nadwozia i cenie,
  - historia wypozyczen auta.
- Update: edycja danych technicznych i statusu auta.
- Delete: usuniecie auta tylko wtedy, gdy nie ma historii wypozyczen; w przeciwnym razie zastosowac dezaktywacje/archiwizacje.
- Walidacje:
  - VIN unikalny, dlugosc 17 i dozwolone znaki,
  - moc silnika i pojemnosc dodatnie,
  - data produkcji nie moze byc z przyszlosci,
  - status `Rented` powinien wynikac z aktywnego wypozyczenia.

## CRUD: Uzytkownicy i role

Encja: `Users`

- Create: rejestracja klienta albo utworzenie pracownika przez administratora.
- Read:
  - lista uzytkownikow,
  - szczegoly uzytkownika,
  - historia wypozyczen klienta,
  - aktywne wypozyczenie klienta.
- Update:
  - edycja danych profilu,
  - zmiana roli przez administratora,
  - zmiana hasla,
  - blokada konta przez ustawienie roli `Banned`.
- Delete:
  - dla kont bez historii mozna usunac,
  - dla kont z historia preferowana dezaktywacja/blokada zamiast fizycznego usuniecia.
- Walidacje:
  - email unikalny i poprawny,
  - telefon unikalny i poprawny,
  - haslo przechowywane tylko jako hash,
  - klient z rola `Banned` nie moze tworzyc rezerwacji ani wypozyczen.

## CRUD: Rezerwacje i wypozyczenia

Encja obecna: `Rents`

- Create:
  - utworzenie rezerwacji `Pending`,
  - rozpoczecie wypozyczenia `Started`,
  - system musi sprawdzic dostepnosc samochodu w podanym terminie.
- Read:
  - szczegoly wypozyczenia,
  - lista wypozyczen klienta,
  - lista aktualnych wypozyczen,
  - lista oczekujacych rezerwacji,
  - lista opoznionych zwrotow,
  - kalendarz wypozyczen dla samochodu.
- Update:
  - zmiana terminu rezerwacji,
  - anulowanie rezerwacji, jesli zostanie dodany status `Cancelled`,
  - rozpoczecie wypozyczenia i zmiana statusu auta na `Rented`,
  - zakonczenie wypozyczenia, ustawienie `endDate`, naliczenie kosztu i zmiana statusu auta na `Available` albo `Maintenance`.
- Delete:
  - fizyczne usuniecie tylko blednej rezerwacji bez platnosci,
  - dla zakonczonych wypozyczen nie usuwac; zachowac historie.
- Walidacje:
  - `expectedEndDate` musi byc po `startDate`,
  - nie wolno utworzyc wypozyczenia dla auta w statusie `Maintenance` albo `Damaged`,
  - nie wolno utworzyc wypozyczenia dla zbanowanego uzytkownika,
  - nie wolno dopuscic nakladania terminow dla tego samego samochodu,
  - `Ended` wymaga `endDate`.

## CRUD: Transakcje i platnosci

Encja: `TransactionHistory`

- Create:
  - utworzenie platnosci dla wypozyczenia,
  - zapis zwrotu srodkow,
  - zapis kary lub kosztu dodatkowego.
- Read:
  - lista transakcji,
  - transakcje danego wypozyczenia,
  - transakcje danego klienta przez powiazanie z `Rents`,
  - suma przychodow w okresie.
- Update:
  - zmiana statusu platnosci z `Pending` na `Accepted` albo `Rejected`,
  - dopisanie metody platnosci, jesli byla nieznana.
- Delete:
  - nie usuwac zaakceptowanych transakcji,
  - anulowanie realizowac przez status albo transakcje korekcyjna.
- Walidacje:
  - kwota musi byc wieksza od 0,
  - transakcja musi dotyczyc istniejacego wypozyczenia,
  - zaakceptowana platnosc powinna miec metode platnosci,
  - kazda transakcja powinna miec date utworzenia.

## CRUD: Serwis i uszkodzenia auta

Encje do dodania: `CarServiceRecords`, `CarDamageReports`

- Create:
  - dodanie wpisu serwisowego,
  - dodanie raportu uszkodzenia po zwrocie auta.
- Read:
  - historia serwisowa auta,
  - lista aut wymagajacych serwisu,
  - lista otwartych uszkodzen.
- Update:
  - oznaczenie naprawy jako zakonczonej,
  - aktualizacja kosztu naprawy i opisu.
- Delete:
  - tylko wpisy utworzone omylkowo i bez konsekwencji finansowych;
  - pozostale powinny zostac jako historia.

## CRUD: Oddzialy wypozyczalni

Encja do dodania: `Branches`

- Create: dodanie oddzialu z adresem i danymi kontaktowymi.
- Read:
  - lista oddzialow,
  - szczegoly oddzialu,
  - auta dostepne w oddziale.
- Update: edycja adresu, telefonu i statusu aktywnosci.
- Delete: usuniecie tylko oddzialu bez aktywnych wypozyczen i aut; w praktyce lepsza dezaktywacja.

## Operacje biznesowe poza prostym CRUD

### Sprawdzenie dostepnosci samochodu

Input:

- `carId`
- `startDate`
- `expectedEndDate`

Operacja:

- sprawdzic, czy samochod istnieje,
- sprawdzic, czy status auta pozwala na wynajem,
- sprawdzic, czy nie istnieje wypozyczenie/rezerwacja tego auta, ktora naklada sie terminem i ma status `Pending` albo `Started`.

Output:

- `available: true/false`
- powod odmowy, jesli auto nie jest dostepne.

### Wyliczenie kosztu wypozyczenia

Input:

- `rentId`
- rzeczywista data zwrotu albo `endDate`

Operacja:

- pobrac koszt godzinowy modelu,
- policzyc czas wypozyczenia,
- doliczyc `additionalCost`,
- opcjonalnie doliczyc kare za opoznienie.

Output:

- koszt podstawowy,
- koszt dodatkowy,
- kara,
- koszt calkowity.

### Rozpoczecie wypozyczenia

Input:

- `rentId`
- pracownik obslugujacy,
- data wydania auta.

Operacja:

- potwierdzic, ze rezerwacja istnieje i ma status `Pending`,
- sprawdzic dostepnosc auta,
- zmienic status wypozyczenia na `Started`,
- zmienic status auta na `Rented`.

### Zakonczenie wypozyczenia

Input:

- `rentId`
- data zwrotu,
- przebieg po zwrocie,
- dodatkowe koszty,
- informacja o uszkodzeniach.

Operacja:

- ustawic `endDate`,
- zmienic status wypozyczenia na `Ended`,
- policzyc koszt,
- utworzyc transakcje,
- zmienic status auta na `Available`, `Maintenance` albo `Damaged`.

### Raport przychodow

Input:

- zakres dat,
- opcjonalnie oddzial,
- opcjonalnie metoda platnosci.

Operacja:

- zsumowac zaakceptowane transakcje przychodzace,
- odjac zaakceptowane zwroty wychodzace,
- pogrupowac po dniu, miesiacu, aucie, modelu lub oddziale.

## Proponowane endpointy API

### Brands

- `GET /brands`
- `GET /brands/:id`
- `POST /brands`
- `PATCH /brands/:id`
- `DELETE /brands/:id`

### Models

- `GET /models`
- `GET /models/:id`
- `GET /brands/:brandId/models`
- `POST /models`
- `PATCH /models/:id`
- `DELETE /models/:id`

### Cars

- `GET /cars`
- `GET /cars/available`
- `GET /cars/:id`
- `GET /cars/:id/rents`
- `POST /cars`
- `PATCH /cars/:id`
- `PATCH /cars/:id/status`
- `DELETE /cars/:id`

### Users

- `GET /users`
- `GET /users/:id`
- `GET /users/:id/rents`
- `POST /auth/register`
- `POST /users`
- `PATCH /users/:id`
- `PATCH /users/:id/role`
- `PATCH /users/:id/password`
- `DELETE /users/:id`

### Rents

- `GET /rents`
- `GET /rents/current`
- `GET /rents/pending`
- `GET /rents/overdue`
- `GET /rents/:id`
- `POST /rents`
- `POST /rents/:id/start`
- `POST /rents/:id/finish`
- `PATCH /rents/:id`
- `DELETE /rents/:id`

### Payments

- `GET /transactions`
- `GET /transactions/:id`
- `GET /rents/:rentId/transactions`
- `POST /transactions`
- `PATCH /transactions/:id/status`

### Reports

- `GET /reports/current-rentals`
- `GET /reports/popular-cars`
- `GET /reports/revenue`
- `GET /reports/overdue-rents`
- `GET /reports/customer-history/:userId`

## Uprawnienia rol

- `Admin`:
  - pelny CRUD na wszystkich encjach,
  - zarzadzanie rolami,
  - dostep do raportow finansowych.
- `Manager`:
  - zarzadzanie flota, modelami, markami, oddzialami,
  - raporty,
  - podglad uzytkownikow i wypozyczen.
- `Worker`:
  - obsluga rezerwacji, wydan i zwrotow,
  - tworzenie raportow uszkodzen,
  - aktualizacja statusu auta w ramach procesu zwrotu/serwisu.
- `Customer`:
  - podglad dostepnych aut,
  - tworzenie rezerwacji,
  - podglad wlasnych wypozyczen i platnosci,
  - edycja wlasnych danych kontaktowych.
- `Banned`:
  - brak mozliwosci tworzenia rezerwacji i wypozyczen,
  - ewentualnie tylko podglad wlasnej historii.

## Sugestie dla agenta AI implementujacego

- Najpierw dodac polaczenie backendu z PostgreSQL i warstwe dostepu do danych.
- Implementowac endpointy modulami: `brands`, `models`, `cars`, `users`, `rents`, `transactions`.
- Dla kazdego modulu przygotowac walidacje wejscia, testy pozytywne i testy bledow biznesowych.
- Nie usuwac historycznych danych wypozyczen ani platnosci; stosowac statusy, korekty albo dezaktywacje.
- Operacje `start rent` i `finish rent` powinny byc wykonywane w transakcji bazodanowej.
- Najbardziej krytyczna regula to blokada nakladajacych sie wypozyczen jednego auta.
- Po zmianach w `schema.sql` resetowac wolumen Dockera zgodnie z `server/testing_guide.md`, bo skrypty inicjalizacyjne PostgreSQL uruchamiaja sie tylko przy pustym wolumenie.

## Minimalny zakres kolejnego etapu

1. Poprawic schemat o kluczowe ograniczenia i indeksy.
2. Dodac polaczenie Express z PostgreSQL.
3. Zaimplementowac CRUD dla `Brands`, `Models`, `Cars`.
4. Zaimplementowac `Users` z podstawowa autoryzacja i rolami.
5. Zaimplementowac proces rezerwacji/wypozyczenia:
   - sprawdzenie dostepnosci,
   - utworzenie rezerwacji,
   - rozpoczecie wypozyczenia,
   - zakonczenie wypozyczenia,
   - naliczenie kosztu.
6. Zaimplementowac transakcje/platnosci.
7. Dodac raporty o aktywnych wypozyczeniach, opoznieniach, popularnosci aut i przychodach.
