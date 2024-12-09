"use client";
// components/CategoryForm.jsx
import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { amazonCategories } from "@/data/categories";
import { db } from "../../firebase";
import { collection, setDoc, addDoc, doc, getDoc } from "firebase/firestore";

const CategoryForm = () => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: "",
      subcategory: "",
      entries: [
        {
          inputValue: "",
          inputType: "text",
          typeDetail: "",
        },
      ],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "entries",
  });

  const selectedCategory = watch("category");
  const selectedSubcategory = watch("subcategory");

  const categoryObj = amazonCategories.find(
    (cat) => cat.category === selectedCategory
  );
  const subcategoryObj = categoryObj?.subcategories.find(
    (sub) => sub.name === selectedSubcategory
  );

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

          // Actualizar los campos del formulario
          setValue("category", selectedCategory);
          setValue("subcategory", selectedSubcategory);
          replace(data.entries || []);
        } else {
          console.log("No se encontró el documento.");
          // Si no existe el documento, reseteamos el formulario
          setValue("category", selectedCategory);
          setValue("subcategory", selectedSubcategory);
          replace([
            {
              inputValue: "",
              inputType: "text",
              typeDetail: "",
            },
          ]);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      }
    };

    receiveFields();
  }, [selectedCategory, selectedSubcategory]);

  // Agrupar los campos por typeDetail
  const fieldsWithIndexes = fields.map((field, index) => ({ field, index }));
  const groupedFields = fieldsWithIndexes.reduce((groups, { field, index }) => {
    const typeDetail = field.typeDetail || "Sin tipo detalle";
    if (!groups[typeDetail]) {
      groups[typeDetail] = [];
    }
    groups[typeDetail].push({ field, index });
    return groups;
  }, {});

  const onSubmit = async (data) => {
    try {
      const collectionRef = doc(
        db,
        "fields",
        "fields",
        data.category,
        data.subcategory
      );
      await setDoc(collectionRef, data);
      alert("Información enviada exitosamente a Firebase!");
    } catch (error) {
      console.error("Error al enviar los datos a Firebase:", error.message);
      alert("Hubo un error al enviar la información. Inténtalo de nuevo.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='max-w-4xl mx-auto p-6 bg-white shadow-md rounded'>
      <h2 className='text-2xl font-bold mb-6'>Formulario de Categorías</h2>

      {/* Selector de Categoría */}
      <div className='mb-4'>
        <label className='block mb-1 font-medium'>Categoría</label>
        <Controller
          name='category'
          control={control}
          rules={{ required: "La categoría es requerida" }}
          render={({ field }) => (
            <select
              {...field}
              className={`border p-2 w-full rounded ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}>
              <option value=''>Selecciona una categoría</option>
              {amazonCategories.map((cat, idx) => (
                <option key={idx} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          )}
        />
        {errors.category && (
          <p className='text-red-500 text-sm mt-1'>{errors.category.message}</p>
        )}
      </div>

      {/* Selector de Subcategoría */}
      {selectedCategory && (
        <div className='mb-6'>
          <label className='block mb-1 font-medium'>Subcategoría</label>
          <Controller
            name='subcategory'
            control={control}
            rules={{ required: "La subcategoría es requerida" }}
            render={({ field }) => (
              <select
                {...field}
                className={`border p-2 w-full rounded ${
                  errors.subcategory ? "border-red-500" : "border-gray-300"
                }`}>
                <option value=''>Selecciona una subcategoría</option>
                {categoryObj.subcategories.map((sub, idx) => (
                  <option key={idx} value={sub.name}>
                    {sub.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.subcategory && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.subcategory.message}
            </p>
          )}
        </div>
      )}

      {/* Campos Dinámicos agrupados por typeDetail */}
      {selectedSubcategory && (
        <div>
          <h3 className='text-xl font-semibold mb-4'>Entradas</h3>
          {Object.entries(groupedFields).map(
            ([typeDetail, group], groupIndex) => (
              <div key={typeDetail}>
                <h4 className='text-lg font-bold mb-2'>{typeDetail}</h4>
                {group.map(({ field, index }) => (
                  <div
                    key={field.id}
                    className='border p-4 mb-4 rounded relative bg-gray-100'>
                    {/* Botón para eliminar el campo */}
                    {fields.length > 1 && (
                      <button
                        type='button'
                        onClick={() => remove(index)}
                        className='absolute top-2 right-2 text-red-500 font-bold'
                        title='Eliminar campo'>
                        &times;
                      </button>
                    )}

                    <div className='flex flex-wrap -mx-2'>
                      {/* Input de Texto */}
                      <div className='w-full md:w-1/3 px-2 mb-4 md:mb-0'>
                        <label className='block mb-1 font-medium'>Valor</label>
                        <Controller
                          name={`entries.${index}.inputValue`}
                          control={control}
                          rules={{ required: "Este campo es requerido" }}
                          render={({ field }) => (
                            <input
                              {...field}
                              type='text'
                              className={`border p-2 w-full rounded ${
                                errors.entries?.[index]?.inputValue
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                              placeholder='Ingresa un valor'
                            />
                          )}
                        />
                        {errors.entries?.[index]?.inputValue && (
                          <p className='text-red-500 text-sm mt-1'>
                            {errors.entries[index].inputValue.message}
                          </p>
                        )}
                      </div>

                      {/* Selector de Tipo ("text" o "number") */}
                      <div className='w-full md:w-1/3 px-2 mb-4 md:mb-0'>
                        <label className='block mb-1 font-medium'>Tipo</label>
                        <Controller
                          name={`entries.${index}.inputType`}
                          control={control}
                          render={({ field }) => (
                            <select
                              {...field}
                              className='border p-2 w-full rounded border-gray-300'>
                              <option value='text'>Text</option>
                              <option value='number'>Number</option>
                            </select>
                          )}
                        />
                      </div>

                      {/* Selector de Tipo Detalle */}
                      <div className='w-full md:w-1/3 px-2'>
                        <label className='block mb-1 font-medium'>
                          Tipo Detalle
                        </label>
                        <Controller
                          name={`entries.${index}.typeDetail`}
                          control={control}
                          rules={{ required: "El tipo detalle es requerido" }}
                          render={({ field }) => (
                            <>
                              <select
                                {...field}
                                className={`border p-2 w-full rounded ${
                                  errors.entries?.[index]?.typeDetail
                                    ? "border-red-500"
                                    : "border-gray-300"
                                }`}>
                                <option value=''>Selecciona un tipo</option>
                                {(subcategoryObj?.types || []).map(
                                  (type, idx) => (
                                    <option key={idx} value={type}>
                                      {type}
                                    </option>
                                  )
                                )}
                              </select>
                              {errors.entries?.[index]?.typeDetail && (
                                <p className='text-red-500 text-sm mt-1'>
                                  {errors.entries[index].typeDetail.message}
                                </p>
                              )}
                            </>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Botón para agregar otro campo */}
          <button
            type='button'
            onClick={() =>
              append({
                inputValue: "",
                inputType: "text",
                typeDetail: "",
              })
            }
            className='bg-green-500 text-white px-4 py-2 rounded mb-4 hover:bg-green-600'>
            Agregar Otro Campo
          </button>
        </div>
      )}

      {/* Botón para enviar la información */}
      <button
        type='submit'
        className='bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600'>
        Enviar Información
      </button>
    </form>
  );
};

export default CategoryForm;
