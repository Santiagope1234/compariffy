import { Schema, model, models } from "mongoose";

const adminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export default models.admin || model("admin", adminSchema);
