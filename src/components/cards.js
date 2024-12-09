import React from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

async function Cards() {
  const collectionNames = ["home-and-kitchen"];

  const allData = [];

  try {
    for (const name of collectionNames) {
      const collectionRef = collection(db, name);
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        collection: name, // Añadimos el nombre de la colección
      }));
      allData.push(...data);
    }
  } catch (error) {
    console.error("Error al obtener datos:", error.message);
  }

  return (
    <div>
      {allData.map((category) => (
        <div
          key={category.id}
          className='bg-white rounded-lg shadow-md p-4 text-black m-12'>
          <h2 className='text-lg font-semibold mb-2'>
            {category.tituloGeneral || "Sin título"}
          </h2>
          <p>{category.subcategoria || "Sin subcategoría"}</p>
          <a
            href={`/${category.urlGenerada}`}
            className='text-blue-500 hover:underline'>
            See comparison
          </a>
        </div>
      ))}
    </div>
  );
}

export default Cards;
