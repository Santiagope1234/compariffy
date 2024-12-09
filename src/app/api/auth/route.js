// Importaciones necesarias
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectDb from "@/lib/db";
import Admin from "@/models/admin"; // Asegúrate de que el modelo se llame "Admin" con mayúscula
import { NextResponse } from "next/server";

const JWT_SECRET = "12345";

// Exporta una función para manejar solicitudes POST
export async function handler(req) {
  try {
    // Establece la conexión a la base de datos
    await connectDb();

    // Parsear el cuerpo de la solicitud
    const body = await req.json();
    const { action } = body;

    // Maneja diferentes acciones
    if (action === "register") {
      return await registerAdmin(body);
    } else if (action === "login") {
      return await loginAdmin(body);
    } else if (action === "logout") {
      return await logoutAdmin(body);
    } else {
      return new NextResponse("Acción inválida", { status: 400 });
    }
  } catch (error) {
    console.error("Error en el handler POST:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
}

// Función para registrar un nuevo admin
async function registerAdmin(body) {
  try {
    const { email, password } = body;

    // Verifica que se proporcionen email y contraseña
    if (!email || !password) {
      return new NextResponse("Email y contraseña son requeridos", {
        status: 400,
      });
    }

    // Verifica si el admin ya existe
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return new NextResponse("El email ya está registrado", { status: 409 });
    }

    // Genera el hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crea y guarda el nuevo admin
    const newAdmin = new Admin({ email, password: hashedPassword });
    const adminSaved = await newAdmin.save();

    console.log("Admin registrado:", adminSaved);

    return new NextResponse("Admin registrado exitosamente", { status: 201 });
  } catch (error) {
    console.error("Error en registerAdmin:", error);
    return new NextResponse("Error al registrar el admin", { status: 500 });
  }
}

async function loginAdmin(body) {
  try {
    const { email, password } = body;

    // Validación de entrada
    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // Busca al admin en la base de datos
    const adminUser = await Admin.findOne({ email });
    if (!adminUser) {
      return NextResponse.json(
        { message: "Email o contraseña incorrectos" },
        { status: 400 }
      );
    }

    // Verifica la contraseña
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Email o contraseña incorrectos" },
        { status: 400 }
      );
    }

    // Genera el token JWT
    const token = jwt.sign(
      { id: adminUser._id, email: adminUser.email },
      JWT_SECRET,
      { expiresIn: "1h" } // Corrección del nombre de la propiedad
    );

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: "Inicio de sesión exitoso",
        token,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error en loginAdmin:", error);
    return NextResponse.json(
      { message: "Error al iniciar sesión", error: error.message },
      { status: 500 }
    );
  }
}

async function logoutAdmin(req, NextResponse) {
  return NextResponse.json(
    {
      message: "Logout exitoso",
      token,
    },
    { status: 200 }
  );
}

export { handler as POST };
