import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';


dotenv.config();

const app=express();

app.use(express.json());

app.get('/',(req:Request, res:Response)=>{
    res.send("BACKEND WORKS :P")
});

const PORT=process.env.PORT
app.listen(PORT,()=>console.log(`Sever is working on port ${PORT}`))