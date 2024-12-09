"use client";

import { useState, useEffect } from "react";

export default function ComparisonComponent({ comparisonData }) {
  const [data, setData] = useState(comparisonData);

  // Si necesitas usar useEffect u otros hooks, puedes hacerlo aquí
  useEffect(() => {
    // Ejemplo de uso de useEffect
    console.log("Componente montado con los datos:", data);
  }, [data]);

  if (!data) {
    return <div>Cargando...</div>; // Puedes mostrar un estado de carga si es necesario
  }

  return (
    <div>
      <h1 className='text-3xl font-bold text-center mb-8'>
        {data.tituloGeneral || "Comparativa"}
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Producto 1 */}
        <div className='bg-white shadow-md rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4'>
            {data["Producto 1"]?.titulo || "Producto 1"}
          </h2>
          <img
            src={data["Producto 1"]?.imagen || "/placeholder.jpg"}
            alt='Producto 1'
            className='w-full h-64 object-cover rounded-md mb-4'
          />
          <ul>
            {data["Producto 1"]?.atributos.map((atributo, index) => (
              <li key={index} className='mb-2'>
                <strong>{atributo.atributo}: </strong>
                {atributo.valor} ({atributo.tipo})
              </li>
            ))}
          </ul>
          <div className='mt-4'>
            <h3 className='font-semibold mb-2'>Marketplaces:</h3>
            <ul>
              {Object.entries(data["Producto 1"]?.marketplaces || {}).map(
                ([key, value]) => (
                  <li key={key}>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>{" "}
                    {value ? (
                      <a href={value} className='text-blue-500 underline'>
                        {value}
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Producto 2 */}
        <div className='bg-white shadow-md rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4'>
            {data["Producto 2"]?.titulo || "Producto 2"}
          </h2>
          <img
            src={data["Producto 2"]?.imagen || "/placeholder.jpg"}
            alt='Producto 2'
            className='w-full h-64 object-cover rounded-md mb-4'
          />
          <ul>
            {data["Producto 2"]?.atributos.map((atributo, index) => (
              <li key={index} className='mb-2'>
                <strong>{atributo.atributo}: </strong>
                {atributo.valor} ({atributo.tipo})
              </li>
            ))}
          </ul>
          <div className='mt-4'>
            <h3 className='font-semibold mb-2'>Marketplaces:</h3>
            <ul>
              {Object.entries(data["Producto 2"]?.marketplaces || {}).map(
                ([key, value]) => (
                  <li key={key}>
                    <strong>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:
                    </strong>{" "}
                    {value ? (
                      <a href={value} className='text-blue-500 underline'>
                        {value}
                      </a>
                    ) : (
                      "No disponible"
                    )}
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
