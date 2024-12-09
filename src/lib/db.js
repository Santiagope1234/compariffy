import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  throw new Error("No se ha obtenido el URI de MONGODB");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

export default async function connectDb() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  console.log("DB CONECTADA");
  return cached.conn;
}
