import express, { type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import pg from "pg";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get("/", (req: Request, res: Response) => {
  res.send("BACKEND WORKS :P");
});

app.get("/api/health", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ status: "OK", time: result.rows[0]?.now });
  } catch (err: any) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

app.get("/api/brands", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM Brands ORDER BY brandId");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

app.get("/api/cars", async (req: Request, res: Response) => {
  try {
    const query = `
            SELECT c.carId, c.status, c.color, c.doorAmount, c.productionDate, c.VIN, c.carEngine, c.horsePower, c.bodyType,
                   m.modelName, m.hourlyCost, m.modelDescription,
                   b.brandName, b.country
            FROM Cars c
            JOIN Models m ON c.modelId = m.modelId
            JOIN Brands b ON m.brandId = b.brandId
            ORDER BY c.carId
        `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

app.get("/api/stats/popular", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM vw_most_popular_cars");
    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ status: "Error", message: err.message });
  }
});

app.post("/api/cars", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const {
      brandName,
      country,
      modelName,
      hourlyCost,
      modelDescription,
      status,
      color,
      doorAmount,
      productionDate,
      VIN,
      carEngine,
      horsePower,
      bodyType,
    } = req.body;

    // Validate inputs
    if (
      !brandName ||
      !country ||
      !modelName ||
      !hourlyCost ||
      !status ||
      !color ||
      !doorAmount ||
      !productionDate ||
      !VIN ||
      carEngine === undefined ||
      !horsePower ||
      !bodyType
    ) {
      throw new Error("Wszystkie pola są wymagane.");
    }

    if (VIN.trim().length !== 17) {
      throw new Error("Numer VIN musi mieć dokładnie 17 znaków.");
    }

    // 1. Check or insert brand
    let brandId: number;
    const brandCheck = await client.query(
      "SELECT brandId FROM Brands WHERE LOWER(brandName) = LOWER($1)",
      [brandName.trim()]
    );

    if (brandCheck.rows.length > 0) {
      brandId = brandCheck.rows[0].brandid;
    } else {
      const brandInsert = await client.query(
        "INSERT INTO Brands (brandName, country) VALUES ($1, $2) RETURNING brandId",
        [brandName.trim(), country]
      );
      brandId = brandInsert.rows[0].brandid;
    }

    // 2. Check or insert model
    let modelId: number;
    const modelCheck = await client.query(
      "SELECT modelId FROM Models WHERE LOWER(modelName) = LOWER($1) AND brandId = $2",
      [modelName.trim(), brandId]
    );

    if (modelCheck.rows.length > 0) {
      modelId = modelCheck.rows[0].modelid;
    } else {
      const modelInsert = await client.query(
        "INSERT INTO Models (modelName, brandId, hourlyCost, modelDescription) VALUES ($1, $2, $3, $4) RETURNING modelId",
        [modelName.trim(), brandId, parseFloat(hourlyCost), modelDescription || ""]
      );
      modelId = modelInsert.rows[0].modelid;
    }

    // 3. Insert car
    const carInsert = await client.query(
      `INSERT INTO Cars (modelId, status, color, doorAmount, productionDate, VIN, carEngine, horsePower, bodyType) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING carId`,
      [
        modelId,
        status,
        color,
        parseInt(doorAmount),
        productionDate,
        VIN.trim().toUpperCase(),
        parseFloat(carEngine),
        parseInt(horsePower),
        bodyType,
      ]
    );
    const carId = carInsert.rows[0].carid;

    await client.query("COMMIT");
    res.status(201).json({
      success: true,
      message: "Samochód został pomyślnie dodany do bazy.",
      carId,
      brandId,
      modelId,
    });
  } catch (err: any) {
    await client.query("ROLLBACK");
    res.status(400).json({ status: "Error", message: err.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Sever is working on port ${PORT}`));
