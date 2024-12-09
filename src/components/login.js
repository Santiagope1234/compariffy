"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";

function Login() {
  const [errorLogin, setErrorLogin] = useState("");
  const { control, handleSubmit } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const onSubmit = (data) => {
    try {
      loginFirebase(data.email, data.password);
    } catch (error) {
      console.log(error.message);
    }
  };

  async function loginFirebase(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const token = await userCredential.user.getIdToken();

      // Establecer el token en las cookies
      document.cookie = `firebase-auth-token=${token}; path=/; secure; SameSite=Strict`;
      router.push("/dashboard");
    } catch (error) {
      setErrorLogin("Fallo de credenciales");
      console.error("Error en el inicio de sesión:", error.message);
    }
  }

  return (
    <form
      className='items-center justify-center h-64 w-96 flex flex-col gap-2 p-5 bg-white'
      onSubmit={handleSubmit(onSubmit)}>
      <p className='text-lg'>
        <strong>Iniciar sesión</strong>
      </p>
      <Controller
        name='email'
        control={control}
        render={({ field }) => (
          <Input
            className='border-black border-2 p-2 w-80 outline-none'
            type='email'
            required
            placeholder='Correo'
            {...field}
          />
        )}
      />
      <Controller
        name='password'
        control={control}
        render={({ field }) => (
          <Input
            className='border-black border-2 p-2 w-80 outline-none'
            type='password'
            required
            placeholder='Contraseña'
            {...field}
          />
        )}
      />
      <p>{errorLogin}</p>
      <button className='bg-black text-white w-80 h-12'>Enviar</button>
    </form>
  );
}

export default Login;
