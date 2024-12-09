"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { doc, setDoc, getDoc, collection, addDoc } from "firebase/firestore";
import { db, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import FeatureInput from "./featureInput";
import { amazonCategories } from "@/data/categories";
import { products } from "@/data/model-products";

export default function CrearComparativa() {
  const [urlGenerada, setUrlGenerada] = useState("");
  const [fieldsData, setFieldsData] = useState([]); // Estado para almacenar los campos

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm(products);

  // Manejo de campos dinámicos para comparativas (productos)
  const {
    fields: comparativasFields,
    append: appendProducto,
    remove: removeProducto,
  } = useFieldArray({
    control,
    name: "comparativas",
  });

  // Estado para las subcategorías basadas en la categoría seleccionada
  const [subcategoriesList, setSubcategoriesList] = useState([]);

  // Observamos el valor de la categoría seleccionada
  const selectedCategory = watch("categoria");
  const selectedSubcategory = watch("subcategoria");

  useEffect(() => {
    const category = amazonCategories.find(
      (cat) => cat.category === selectedCategory
    );
    if (category) {
      setSubcategoriesList(category.subcategories.map((sub) => sub.name));
    } else {
      setSubcategoriesList([]);
    }
  }, [selectedCategory]);

  useEffect(() => {
    const receiveFields = async () => {
      try {
        // Verifica que ambos, categoría y subcategoría, estén seleccionados
        if (!selectedCategory || !selectedSubcategory) return;

        // Referencia al documento específico
        const docRef = doc(
          db,
          "fields",
          "fields",
          selectedCategory,
          selectedSubcategory
        );

        // Obtener el documento
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Agrupamos las entradas por typeDetail
          const groupedFields = data.entries.reduce((acc, field) => {
            const { typeDetail } = field;
            if (!acc[typeDetail]) {
              acc[typeDetail] = [];
            }
            acc[typeDetail].push(field);
            return acc;
          }, {});

          setFieldsData(groupedFields);
        } else {
          console.log("No se encontró el documento.");
          setFieldsData({});
        }
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      }
    };

    receiveFields();
  }, [selectedCategory, selectedSubcategory]);

  const onSubmit = async (data) => {
    const { tituloGeneral, categoria, subcategoria, comparativas } = data;

    if (!tituloGeneral || !categoria || !subcategoria) {
      alert("Por favor completa todos los campos requeridos.");
      return;
    }

    try {
      // Procesar las imágenes de cada producto
      const comparativasConImagenes = await Promise.all(
        comparativas.map(async (producto, indexProducto) => {
          let imagenesUrls = [];

          if (Array.isArray(producto.imagen) && producto.imagen.length > 0) {
            imagenesUrls = await Promise.all(
              producto.imagen.map(async (img, indexImagen) => {
                const storageRef = ref(
                  storage,
                  `images-products/${Date.now()}_${indexProducto}_${indexImagen}`
                );
                const snapshot = await uploadBytes(storageRef, img.file);
                return getDownloadURL(snapshot.ref);
              })
            );
          }

          return {
            ...producto,
            imagen: imagenesUrls,
          };
        })
      );

      const productosConClaves = {};
      comparativasConImagenes.forEach((producto, index) => {
        productosConClaves[`Producto ${index + 1}`] = producto;
      });

      const datos = {
        tituloGeneral,
        urlGenerada,
        categoria,
        subcategoria,
        ...productosConClaves,
      };

      const categoriaId = generateSlug(categoria.trim());
      const subcategoriaId = generateSlug(subcategoria.trim());
      const tituloId = generateSlug(tituloGeneral.trim());

      const docRef = doc(db, "products", categoriaId, subcategoriaId, tituloId);

      await setDoc(docRef, datos);

      const categoriaSlug = generateSlug(selectedCategory);
      const subcategoriaSlug = generateSlug(subcategoriaValue);
      const tituloSlug = generateSlug(tituloGeneralValue);

      // Crear un nuevo documento en la colección "parametros" con el ID como el slug de la URL sin el primer "/"
      const parametersRef = doc(db, "parameters", urlGenerada.slice(1));
      await setDoc(parametersRef, {
        categoriaSlug,
        subcategoriaSlug,
        tituloSlug,
      });

      alert("Comparativa guardada exitosamente.");
      console.log("Datos enviados a Firestore:", datos);
    } catch (error) {
      console.error(
        "Error al guardar la comparativa en Firestore:",
        error.message
      );
      alert("Hubo un error al guardar la comparativa.");
    }
  };

  const generateSlug = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .normalize("NFD") // Normaliza el texto descomponiendo los caracteres con acentos
      .replace(/[\u0300-\u036f]/g, "") // Elimina los acentos
      .replace(/\s+/g, "-") // Reemplaza los espacios por guiones
      .replace(/[^\w\-]+/g, "") // Elimina caracteres especiales
      .replace(/\-\-+/g, "-") // Reemplaza múltiples guiones por uno solo
      .replace(/^-+/, "") // Elimina los guiones al inicio
      .replace(/-+$/, ""); // Elimina los guiones al final
  };

  const tituloGeneralValue = watch("tituloGeneral");
  const subcategoriaValue = watch("subcategoria");

  useEffect(() => {
    if (tituloGeneralValue && selectedCategory && subcategoriaValue) {
      const categoriaSlug = generateSlug(selectedCategory);
      const subcategoriaSlug = generateSlug(subcategoriaValue);
      const tituloSlug = generateSlug(tituloGeneralValue);
      setUrlGenerada(`/${tituloSlug}`);
    } else {
      setUrlGenerada("");
    }
  }, [tituloGeneralValue, selectedCategory, subcategoriaValue]);

  return (
    <div className='p-6 bg-gray-100 min-h-screen'>
      <h1 className='text-2xl font-bold mb-4'>Crear Comparativa</h1>

      {/* Formulario usando handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Campo para el título general */}
        <div className='mb-4'>
          <Controller
            name='tituloGeneral'
            control={control}
            rules={{ required: "Este campo es requerido" }}
            render={({ field, fieldState: { error } }) => (
              <>
                <input
                  {...field}
                  className='border p-2 w-full'
                  type='text'
                  placeholder='Título General (Ej: Samsung 1 vs Samsung 2)'
                />
                {error && <p className='text-red-500'>{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Selector para la categoría */}
        <div className='mb-4'>
          <Controller
            name='categoria'
            control={control}
            rules={{ required: "Este campo es requerido" }}
            render={({ field, fieldState: { error } }) => (
              <>
                <select {...field} className='border p-2 w-full'>
                  <option value=''>Selecciona una categoría</option>
                  {amazonCategories.map((cat, index) => (
                    <option key={index} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
                {error && <p className='text-red-500'>{error.message}</p>}
              </>
            )}
          />
        </div>

        {/* Selector para la subcategoría */}
        {subcategoriesList.length > 0 && (
          <div className='mb-4'>
            <Controller
              name='subcategoria'
              control={control}
              rules={{ required: "Este campo es requerido" }}
              render={({ field, fieldState: { error } }) => (
                <>
                  <select {...field} className='border p-2 w-full'>
                    <option value=''>Selecciona una subcategoría</option>
                    {subcategoriesList.map((subcat, index) => (
                      <option key={index} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                  {error && <p className='text-red-500'>{error.message}</p>}
                </>
              )}
            />
          </div>
        )}

        {/* Renderizar cada producto */}
        {comparativasFields.map((producto, indexProducto) => (
          <Producto
            key={producto.id}
            control={control}
            name={`comparativas.${indexProducto}`}
            producto={producto}
            indexProducto={indexProducto}
            removeProducto={removeProducto}
            watch={watch}
            setValue={setValue}
            getValues={getValues}
            fieldsData={fieldsData} // Pasamos fieldsData aquí
            selectedCategory={selectedCategory} // Pasamos selectedCategory
            selectedSubcategory={selectedSubcategory} // Pasamos selectedSubcategory
          />
        ))}

        {/* Botón para agregar un nuevo producto */}
        <button
          type='button'
          onClick={() =>
            appendProducto({
              titulo: "",
              imagen: [],
              features: [],
              marketplaces: {
                amazon: "",
                ebay: "",
                newegg: "",
                walmart: "",
                temu: "",
                aliexpress: "",
                shein: "",
              },
            })
          }
          className='bg-green-500 text-white px-4 py-2 rounded'>
          + Agregar Producto
        </button>

        {/* Botón para enviar el formulario */}
        <button
          type='submit'
          className='bg-blue-500 text-white px-6 py-2 mt-4 rounded'>
          Crear Comparativa
        </button>
      </form>
    </div>
  );
}

// Componente Producto
function Producto({
  control,
  name,
  indexProducto,
  removeProducto,
  watch,
  setValue,
  getValues,
  fieldsData,
  selectedCategory,
  selectedSubcategory,
}) {
  // Definimos units aquí
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

  // Observamos cambios en fieldsData
  useEffect(() => {
    if (fieldsData && Object.keys(fieldsData).length > 0) {
      const mappedFeatures = Object.entries(fieldsData).map(
        ([typeDetail, entries]) => ({
          typeDetail,
          entries: entries.map((field) => ({
            id: field.inputValue, // Aseguramos un id único
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
      setValue(`${name}.features`, mappedFeatures);
    } else {
      // Si no hay fieldsData, reseteamos features a un arreglo vacío
      setValue(`${name}.features`, []);
    }
  }, [fieldsData]);

  return (
    <div className='mb-6 border p-4 bg-white rounded relative'>
      {/* Botón para eliminar producto */}
      {indexProducto > 0 && (
        <button
          type='button'
          onClick={() => removeProducto(indexProducto)}
          className='absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full'>
          X
        </button>
      )}

      {/* Campo para el título del producto */}
      <h2 className='text-xl font-semibold mb-4'>
        Producto {indexProducto + 1}
      </h2>
      <Controller
        name={`${name}.titulo`}
        control={control}
        rules={{ required: "Este campo es requerido" }}
        render={({ field, fieldState: { error } }) => (
          <>
            <input
              {...field}
              className='border p-2 w-full mb-4'
              type='text'
              placeholder={`Título del Producto ${indexProducto + 1}`}
            />
            {error && <p className='text-red-500'>{error.message}</p>}
          </>
        )}
      />

      {/* Botón para cargar la imagen */}
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2'>
          Imagen del producto
        </label>
        <Controller
          name={`${name}.imagen`}
          control={control}
          render={({ field }) => (
            <div>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const images = files.map((file) => ({
                    file,
                    preview: URL.createObjectURL(file),
                  }));
                  field.onChange([...(field.value || []), ...images]);
                }}
                className='block'
              />

              {Array.isArray(field.value) && field.value.length > 0 && (
                <div className='grid grid-cols-3 gap-2 mt-2'>
                  {field.value.map((image, index) => (
                    <div key={index} className='relative group'>
                      <img
                        width={100}
                        height={100}
                        src={image.preview}
                        alt={`Producto ${indexProducto + 1}`}
                        className='w-full h-32 object-cover rounded'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          const updatedImages = [...field.value];
                          updatedImages.splice(index, 1);
                          field.onChange(updatedImages);
                        }}
                        className='absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full'>
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        />
      </div>

      {/* Atributos del Producto: Aquí es donde integramos FeatureInput */}
      <FeatureInput
        key={`${selectedCategory}-${selectedSubcategory}-${indexProducto}`}
        control={control}
        name={`${name}.features`}
        watch={watch}
        setValue={setValue}
        fieldsData={fieldsData} // Pasamos fieldsData aquí
      />

      {/* Inputs para los Marketplaces */}
      <div className='mt-6'>
        <h3 className='text-lg font-bold'>Marketplaces</h3>
        {[
          "amazon",
          "ebay",
          "newegg",
          "walmart",
          "temu",
          "aliexpress",
          "shein",
        ].map((marketplace) => (
          <Controller
            key={marketplace}
            name={`${name}.marketplaces.${marketplace}`}
            control={control}
            render={({ field }) => (
              <input
                {...field}
                className='border p-2 w-full mb-2'
                type='text'
                placeholder={`ID para ${
                  marketplace.charAt(0).toUpperCase() + marketplace.slice(1)
                }`}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}
