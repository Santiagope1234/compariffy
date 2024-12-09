"use client";

import React, { useEffect } from "react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./ui/tooltip"; // Ajusta la ruta si es necesario
import { Controller, useFieldArray, useWatch } from "react-hook-form";

const units = [
  "cm",
  "m",
  "kg",
  "g",
  "lb",
  "oz",
  "L",
  "ml",
  "cm²",
  "cm³",
  "m²",
  "m³",
  "ft",
  "in",
  "-", // Operador
  "×", // Operador
  "", // Unidad vacía
  // Agrega más unidades según sea necesario
];

const FeatureInput = ({ control, name, watch, setValue, fieldsData }) => {
  // Obtenemos las características actuales usando useWatch
  const features =
    useWatch({
      control,
      name: name,
    }) || [];

  useEffect(() => {
    if (
      fieldsData &&
      Object.keys(fieldsData).length > 0 &&
      (!features || features.length === 0)
    ) {
      const mappedFeatures = Object.entries(fieldsData).map(
        ([typeDetail, entries]) => ({
          typeDetail,
          entries: entries.map((field) => ({
            id: field.inputValue,
            name: field.inputValue,
            inputType: field.inputType,
            values: [
              {
                type: field.inputType,
                value: "",
                unit: field.inputType === "number" ? units[0] : "",
              },
            ],
            skip: false,
          })),
        })
      );
      setValue(name, mappedFeatures);
    }
  }, [fieldsData]);

  // Maneja el cambio del valor de la característica
  const handleValueChange = (
    groupIndex,
    featureIndex,
    valueIndex,
    field,
    newValue
  ) => {
    const updatedFeatures = [...features];
    const feature = updatedFeatures[groupIndex].entries[featureIndex];
    const valueItem = feature.values[valueIndex];

    if (feature.inputType === "number") {
      // Solo aceptar números
      if (field === "value") {
        if (newValue === "" || isNaN(newValue)) {
          // Ignorar entrada no numérica
          return;
        } else {
          valueItem.value = newValue;
        }
      }
      valueItem.type = "number";
    } else if (feature.inputType === "text") {
      // Solo aceptar texto
      if (field === "value") {
        valueItem.value = newValue;
      }
      valueItem.type = "text";
      // Asegurar que la unidad esté vacía
      valueItem.unit = "";
    }

    setValue(name, updatedFeatures);
  };

  // Maneja el cambio de unidad dentro de una característica
  const handleUnitChange = (groupIndex, featureIndex, valueIndex, newUnit) => {
    const updatedFeatures = [...features];
    updatedFeatures[groupIndex].entries[featureIndex].values[valueIndex].unit =
      newUnit;
    setValue(name, updatedFeatures);
  };

  // Agrega un nuevo campo de valor dentro de una característica
  const addValueField = (groupIndex, featureIndex) => {
    const updatedFeatures = [...features];
    updatedFeatures[groupIndex].entries[featureIndex].values.push({
      type: "number",
      value: "",
      unit: units[0],
    });
    setValue(name, updatedFeatures);
  };

  // Elimina un campo de valor dentro de una característica
  const deleteValue = (groupIndex, featureIndex, valueIndex) => {
    const updatedFeatures = [...features];
    updatedFeatures[groupIndex].entries[featureIndex].values.splice(
      valueIndex,
      1
    );
    setValue(name, updatedFeatures);
  };

  // Función para concatenar los valores numéricos con operadores
  const getConcatenatedValue = (values) => {
    return values
      .map((val, idx) => {
        if (val.type === "text") {
          return val.value;
        } else {
          if (idx === 0) {
            // Primer valor, retorna "valor unidad"
            return `${val.value} ${val.unit}`;
          } else {
            // Valores posteriores, retorna "operador valor unidad"
            if (val.unit === "") {
              return `${val.value}`;
            }
            return `${val.value} ${val.unit}`;
          }
        }
      })
      .join(" ");
  };

  return (
    <div className='mb-4 mx-auto bg-white p-4 rounded shadow'>
      <h2 className='text-2xl font-semibold mb-4'>Especificaciones</h2>

      {features.map((group, groupIndex) => (
        <div key={group.typeDetail}>
          <h3 className='text-xl font-semibold mb-4'>{group.typeDetail}</h3>
          {group.entries.map((feature, featureIndex) => {
            const skipFeature = feature.skip;
            return (
              <div key={feature.id} className='mb-8 border-b pb-6 relative'>
                {/* Nombre de la Característica */}
                <div className='mb-6'>
                  <label className='block text-gray-700 font-medium mb-2'>
                    Especificación:
                  </label>
                  <input
                    value={feature.name}
                    disabled
                    className='w-full px-4 py-2 border rounded-md bg-gray-100'
                  />
                </div>

                {/* Checkbox para omitir la característica */}
                <div className='mb-4'>
                  <label className='flex items-center'>
                    <Controller
                      name={`${name}[${groupIndex}].entries[${featureIndex}].skip`}
                      control={control}
                      render={({ field }) => (
                        <input
                          type='checkbox'
                          checked={field.value || false}
                          onChange={(e) => {
                            field.onChange(e.target.checked);
                          }}
                          className='mr-2'
                        />
                      )}
                    />
                    <span>No especificar esta característica</span>
                  </label>
                </div>

                {/* Valores de la Característica */}
                {!skipFeature ? (
                  <div>
                    <label className='block text-gray-700 font-medium mb-2'>
                      Valor:
                    </label>
                    {feature.values.map((val, valueIndex) => (
                      <div key={valueIndex} className='flex items-center mb-4'>
                        {feature.inputType === "text" ? (
                          <Controller
                            name={`${name}[${groupIndex}].entries[${featureIndex}].values[${valueIndex}].value`}
                            control={control}
                            defaultValue={val.value || ""}
                            render={({ field }) => (
                              <input
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  handleValueChange(
                                    groupIndex,
                                    featureIndex,
                                    valueIndex,
                                    "value",
                                    e.target.value
                                  );
                                }}
                                type='text'
                                className='flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                placeholder='Texto'
                              />
                            )}
                          />
                        ) : (
                          <>
                            <Controller
                              name={`${name}[${groupIndex}].entries[${featureIndex}].values[${valueIndex}].value`}
                              control={control}
                              defaultValue={val.value || ""}
                              render={({ field }) => (
                                <input
                                  {...field}
                                  type='number'
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleValueChange(
                                      groupIndex,
                                      featureIndex,
                                      valueIndex,
                                      "value",
                                      e.target.value
                                    );
                                  }}
                                  className='w-80 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                                  placeholder='Número'
                                />
                              )}
                            />
                            <Controller
                              name={`${name}[${groupIndex}].entries[${featureIndex}].values[${valueIndex}].unit`}
                              control={control}
                              defaultValue={val.unit || ""}
                              render={({ field }) => (
                                <select
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e);
                                    handleUnitChange(
                                      groupIndex,
                                      featureIndex,
                                      valueIndex,
                                      e.target.value
                                    );
                                  }}
                                  className='ml-4 px-4 py-2 w-40 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
                                  {units.map((unit, idx) => (
                                    <option key={idx} value={unit}>
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              )}
                            />

                            {val.unit === "cm" && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className='ml-2 cursor-pointer text-blue-500'>
                                      ℹ️
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Se está tomando como un centímetro (cm). Un
                                    centímetro es una unidad de medida de
                                    longitud en el sistema métrico, comúnmente
                                    utilizada para medir dimensiones pequeñas.
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            {/* Botones para agregar o eliminar valores */}
                            {feature.values.length > 1 && (
                              <button
                                type='button'
                                onClick={() =>
                                  deleteValue(
                                    groupIndex,
                                    featureIndex,
                                    valueIndex
                                  )
                                }
                                className='ml-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors'
                                title='Eliminar Valor'>
                                &times;
                              </button>
                            )}
                            <button
                              type='button'
                              onClick={() =>
                                addValueField(groupIndex, featureIndex)
                              }
                              className='ml-4 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-green-600 transition-colors'
                              title='Agregar otro valor'>
                              +
                            </button>
                          </>
                        )}
                      </div>
                    ))}

                    {feature.values.some((val) => val.type === "number") && (
                      <div className='mt-2 text-gray-600'>
                        <strong>Resultado:</strong>{" "}
                        {getConcatenatedValue(feature.values)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type='text'
                      value='We have no information about this feature.'
                      disabled
                      className='w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-500'
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default FeatureInput;
