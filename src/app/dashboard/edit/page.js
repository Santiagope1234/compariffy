"use client";
import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db, storage } from "../../../../firebase";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { amazonCategories } from "@/data/categories";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import FeatureInput from "@/components/featureInput";

function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [filteredCollections, setFilteredCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null); // Documento seleccionado para editar
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
  const [searchQuery, setSearchQuery] = useState(""); // Estado para el buscador
  const [sortOrder, setSortOrder] = useState("asc"); // Orden de clasificación
  const [categoryFilter, setCategoryFilter] = useState(""); // Filtro de categoría
  const [subCategoryFilter, setSubCategoryFilter] = useState(""); // Filtro de subcategoría

  // Función para generar slugs
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

  useEffect(() => {
    async function getData() {
      try {
        const allData = [];

        // Recorremos las categorías y subcategorías utilizando amazonCategories
        const categoryPromises = amazonCategories.map(async (category) => {
          const categoryName = category.category;
          const categorySlug = generateSlug(categoryName);

          const subcategoryPromises = category.subcategories.map(
            async (subcategory) => {
              const subcategoryName = subcategory.name;
              const subcategorySlug = generateSlug(subcategoryName);

              // Referencia a la colección de productos dentro de la categoría y subcategoría
              const productsRef = collection(
                db,
                "products",
                categorySlug,
                subcategorySlug
              );

              const productsSnapshot = await getDocs(productsRef);

              productsSnapshot.docs.forEach((productDoc) => {
                const productData = productDoc.data();
                allData.push({
                  id: productDoc.id,
                  ...productData,
                  categorySlug,
                  subcategorySlug,
                  collection: "products",
                });
              });
            }
          );

          // Esperamos a que se resuelvan todas las promesas de subcategorías
          await Promise.all(subcategoryPromises);
        });

        // Esperamos a que se resuelvan todas las promesas de categorías
        await Promise.all(categoryPromises);

        setCollections(allData);
        setFilteredCollections(allData);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
        setLoading(false);
      }
    }
    getData();
  }, []);

  // Efecto para aplicar filtros y búsqueda
  useEffect(() => {
    let data = [...collections];

    // Filtrado por búsqueda
    if (searchQuery) {
      data = data.filter((item) =>
        item.tituloGeneral?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrado por categoría
    if (categoryFilter) {
      data = data.filter(
        (item) => item.categoria?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    // Filtrado por subcategoría
    if (subCategoryFilter) {
      data = data.filter(
        (item) =>
          item.subcategoria?.toLowerCase() === subCategoryFilter.toLowerCase()
      );
    }

    // Ordenar por orden alfabético
    data.sort((a, b) => {
      if (sortOrder === "asc") {
        return a.tituloGeneral.localeCompare(b.tituloGeneral);
      } else {
        return b.tituloGeneral.localeCompare(a.tituloGeneral);
      }
    });

    setFilteredCollections(data);
  }, [searchQuery, sortOrder, categoryFilter, subCategoryFilter, collections]);

  // Función para manejar la edición
  async function handleEdit(item) {
    try {
      const docRef = doc(
        db,
        "products",
        item.categorySlug,
        item.subcategorySlug,
        item.id
      );
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSelectedDocument({
          id: item.id,
          categorySlug: item.categorySlug,
          subcategorySlug: item.subcategorySlug,
          collection: "products",
          data: docSnap.data(),
        });
        setIsModalOpen(true);
      } else {
        console.error("No se encontró el documento");
      }
    } catch (error) {
      console.error("Error al obtener el documento:", error);
    }
  }

  // Función para manejar la eliminación
  async function handleDelete(item) {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar este documento?")
    ) {
      try {
        const docRef = doc(
          db,
          "products",
          item.categorySlug,
          item.subcategorySlug,
          item.id
        );
        await deleteDoc(docRef);

        // Eliminar el documento equivalente en la colección "parameters"
        const parametersRef = doc(db, "parameters", item.urlGenerada.slice(1));
        await deleteDoc(parametersRef);

        // Actualizar el estado para eliminar el ítem borrado
        setCollections(
          collections.filter(
            (doc) =>
              doc.id !== item.id ||
              doc.categorySlug !== item.categorySlug ||
              doc.subcategorySlug !== item.subcategorySlug
          )
        );
      } catch (error) {
        console.error("Error al eliminar documento:", error);
      }
    }
  }

  if (loading) {
    return <p>Cargando colecciones...</p>;
  }

  // Obtener categorías y subcategorías para los filtros
  const categories = [
    ...new Set(collections.map((item) => item.categoria?.toLowerCase().trim())),
  ].filter(Boolean);
  const subCategories = [
    ...new Set(
      collections.map((item) => item.subcategoria?.toLowerCase().trim())
    ),
  ].filter(Boolean);

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Buscador y filtros */}
      <div className='mb-6 flex flex-col md:flex-row md:items-center md:justify-between'>
        <input
          type='text'
          placeholder='Buscar por título...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='border p-2 rounded w-full md:w-1/3 mb-4 md:mb-0'
        />
        <div className='flex space-x-4'>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className='border p-2 rounded'>
            <option value=''>Todas las categorías</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={subCategoryFilter}
            onChange={(e) => setSubCategoryFilter(e.target.value)}
            className='border p-2 rounded'>
            <option value=''>Todas las subcategorías</option>
            {subCategories.map((subCategory, index) => (
              <option key={index} value={subCategory}>
                {subCategory.charAt(0).toUpperCase() + subCategory.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className='border p-2 rounded'>
            <option value='asc'>A-Z</option>
            <option value='desc'>Z-A</option>
          </select>
        </div>
      </div>

      {/* Listado de colecciones */}
      <div className='grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'>
        {filteredCollections.map((item) => (
          <div key={item.id} className='bg-white shadow-md rounded-lg p-6'>
            <h2 className='text-xl font-bold mb-2'>{item.tituloGeneral}</h2>
            <p className='text-gray-700'>Categoría: {item.categoria}</p>
            <p className='text-gray-700'>Subcategoría: {item.subcategoria}</p>
            <p className='text-gray-700'>URL Generada: {item.urlGenerada}</p>
            <div className='mt-4 flex space-x-2'>
              <button
                onClick={() => handleEdit(item)}
                className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>
                Editar
              </button>
              <button
                onClick={() => handleDelete(item)}
                className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edición */}
      {isModalOpen && selectedDocument && (
        <EditModal
          selectedDocument={selectedDocument}
          setIsModalOpen={setIsModalOpen}
          setCollections={setCollections}
          collections={collections}
        />
      )}
    </div>
  );
}

function EditModal({
  selectedDocument,
  setIsModalOpen,
  setCollections,
  collections,
}) {
  const [loading, setLoading] = useState(false);
  const [fieldsData, setFieldsData] = useState({}); // Estado para almacenar las especificaciones

  // Función para generar slugs
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

  // Estado para las subcategorías basadas en la categoría seleccionada
  const [subcategoriesList, setSubcategoriesList] = useState([]);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tituloGeneral: "",
      categoria: "",
      subcategoria: "",
      urlGenerada: "",
      productos: [],
    },
  });

  // Manejo de campos dinámicos para productos
  const { fields: productosFields, replace: replaceProductos } = useFieldArray({
    control,
    name: "productos",
  });

  // Cargar los datos del documento seleccionado en el formulario
  useEffect(() => {
    if (selectedDocument) {
      const {
        tituloGeneral,
        categoria,
        subcategoria,
        urlGenerada,
        ...productosObj
      } = selectedDocument.data;

      // Convertimos los productos en un array
      const productosArray = Object.keys(productosObj)
        .filter((key) => key.startsWith("Producto"))
        .map((key) => ({
          originalKey: key, // Almacenamos la clave original
          ...productosObj[key],
          features: productosObj[key].features || [],
        }));

      setValue("tituloGeneral", tituloGeneral || "");
      setValue("categoria", categoria || "");
      setValue("subcategoria", subcategoria || "");
      setValue("urlGenerada", urlGenerada || "");
      replaceProductos(productosArray);
    }
  }, [selectedDocument, setValue, replaceProductos]);

  // Observamos el valor de la categoría y subcategoría seleccionada
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

  // Obtener fieldsData desde Firebase al cambiar la categoría o subcategoría
  useEffect(() => {
    const receiveFields = async () => {
      try {
        if (!selectedCategory || !selectedSubcategory) return;

        const docRef = doc(
          db,
          "fields",
          "fields",
          selectedCategory,
          selectedSubcategory
        );

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
          console.log("No se encontró el documento de fields.");
          setFieldsData({});
        }
      } catch (error) {
        console.error("Error al obtener datos:", error.message);
      }
    };

    receiveFields();
  }, [selectedCategory, selectedSubcategory]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const oldCategoria = selectedDocument.data.categoria;
      const oldSubcategoria = selectedDocument.data.subcategoria;
      const oldTituloGeneral = selectedDocument.data.tituloGeneral;

      const newCategoria = data.categoria;
      const newSubcategoria = data.subcategoria;
      const newTituloGeneral = data.tituloGeneral;

      const oldCategoriaSlug = generateSlug(oldCategoria);
      const oldSubcategoriaSlug = generateSlug(oldSubcategoria);
      const oldTituloGeneralSlug = generateSlug(oldTituloGeneral);

      const newCategoriaSlug = generateSlug(newCategoria);
      const newSubcategoriaSlug = generateSlug(newSubcategoria);
      const newTituloGeneralSlug = generateSlug(newTituloGeneral);

      const oldDocRef = doc(
        db,
        "products",
        selectedDocument.categorySlug,
        selectedDocument.subcategorySlug,
        selectedDocument.id
      );
      const newDocRef = doc(
        db,
        "products",
        newCategoriaSlug,
        newSubcategoriaSlug,
        newTituloGeneralSlug
      );

      // Procesar imágenes de cada producto
      const productosConImagenes = await Promise.all(
        data.productos.map(async (producto, indexProducto) => {
          let imagenesUrls = [];

          // Aseguramos que producto.imagen siempre es un array
          const imagenArray = Array.isArray(producto.imagen)
            ? producto.imagen
            : producto.imagen
            ? [producto.imagen]
            : [];

          if (imagenArray.length > 0) {
            // Filtrar imágenes nuevas (que tienen 'file' y 'preview')
            const nuevasImagenes = imagenArray.filter(
              (img) => img.file && img.preview
            );

            // Subir nuevas imágenes a Firebase Storage
            const urlsNuevasImagenes = await Promise.all(
              nuevasImagenes.map(async (img, indexImagen) => {
                const storageRef = ref(
                  storage,
                  `images-products/${Date.now()}_${indexProducto}_${indexImagen}`
                );
                const snapshot = await uploadBytes(storageRef, img.file);
                return getDownloadURL(snapshot.ref);
              })
            );

            // Combinar URLs de imágenes existentes y nuevas
            imagenesUrls = imagenArray.map((img) =>
              img.file && img.preview ? urlsNuevasImagenes.shift() : img
            );
          }

          return {
            ...producto,
            imagen: imagenesUrls,
          };
        })
      );

      // Transformamos los productos en un objeto con claves "Producto 1", "Producto 2", etc.
      const productosObj = {};
      productosConImagenes.forEach((producto, index) => {
        const originalKey =
          data.productos[index]?.originalKey || `Producto ${index + 1}`;
        const { key: _, ...productoSinKeys } = producto; // Excluimos solo 'key'

        // Remover objetos File del campo imagen
        if (productoSinKeys.imagen) {
          productoSinKeys.imagen = productoSinKeys.imagen.filter(
            (img) => typeof img === "string"
          );
        }

        // Procesar las features correctamente
        if (productoSinKeys.features) {
          productoSinKeys.features = productoSinKeys.features.map((group) => ({
            typeDetail: group.typeDetail,
            entries: group.entries.map((entry) => ({
              name: entry.name,
              inputType: entry.inputType,
              values: entry.values.map((val) => ({
                type: val.type,
                value: val.value,
                unit: val.unit,
              })),
              skip: entry.skip || false,
            })),
          }));
        }

        productosObj[originalKey] = productoSinKeys;
      });

      // Creamos el objeto de datos a actualizar
      const updatedData = {
        tituloGeneral: data.tituloGeneral,
        categoria: data.categoria,
        subcategoria: data.subcategoria,
        urlGenerada: `/${newTituloGeneralSlug}`,
        ...productosObj,
      };

      if (
        oldCategoriaSlug !== newCategoriaSlug ||
        oldSubcategoriaSlug !== newSubcategoriaSlug ||
        oldTituloGeneralSlug !== newTituloGeneralSlug
      ) {
        // Si la categoría, subcategoría o el título general han cambiado, creamos un nuevo documento y eliminamos el antiguo

        // Crear nuevo documento
        await setDoc(newDocRef, updatedData);

        // Eliminar documento antiguo
        await deleteDoc(oldDocRef);

        // Actualizar el estado de collections
        setCollections(
          collections
            .filter(
              (doc) =>
                doc.id !== selectedDocument.id ||
                doc.categorySlug !== selectedDocument.categorySlug ||
                doc.subcategorySlug !== selectedDocument.subcategorySlug
            )
            .concat([
              {
                id: newTituloGeneralSlug,
                categorySlug: newCategoriaSlug,
                subcategorySlug: newSubcategoriaSlug,
                collection: "products",
                ...updatedData,
              },
            ])
        );
      } else {
        // Solo actualizamos el documento existente
        await updateDoc(oldDocRef, updatedData);

        // Actualizar el estado
        setCollections(
          collections.map((doc) =>
            doc.id === selectedDocument.id &&
            doc.categorySlug === selectedDocument.categorySlug &&
            doc.subcategorySlug === selectedDocument.subcategorySlug
              ? { ...doc, ...updatedData }
              : doc
          )
        );
      }

      setIsModalOpen(false);
      setLoading(false);
      alert("Documento actualizado exitosamente.");
    } catch (error) {
      console.error("Error al actualizar documento:", error);
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      {/* Overlay del modal */}
      <div
        className='absolute inset-0 bg-black opacity-50'
        onClick={() => setIsModalOpen(false)}></div>
      {/* Contenido del modal */}
      <div className='bg-white rounded-lg shadow-lg z-50 w-full max-w-4xl p-6 overflow-y-auto max-h-screen'>
        <h2 className='text-2xl font-bold mb-4'>Editar Documento</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Campo para el título general */}
          <div className='mb-4'>
            <Controller
              name='tituloGeneral'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <input
                  {...field}
                  className='border p-2 w-full'
                  type='text'
                  placeholder='Título General'
                />
              )}
            />
            {errors.tituloGeneral && (
              <p className='text-red-500'>Este campo es requerido</p>
            )}
          </div>

          {/* Selector para la categoría */}
          <div className='mb-4'>
            <Controller
              name='categoria'
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <select {...field} className='border p-2 w-full'>
                  <option value=''>Selecciona una categoría</option>
                  {amazonCategories.map((cat, index) => (
                    <option key={index} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.categoria && (
              <p className='text-red-500'>Este campo es requerido</p>
            )}
          </div>

          {/* Selector para la subcategoría */}
          {subcategoriesList.length > 0 && (
            <div className='mb-4'>
              <Controller
                name='subcategoria'
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <select {...field} className='border p-2 w-full'>
                    <option value=''>Selecciona una subcategoría</option>
                    {subcategoriesList.map((subcat, index) => (
                      <option key={index} value={subcat}>
                        {subcat}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.subcategoria && (
                <p className='text-red-500'>Este campo es requerido</p>
              )}
            </div>
          )}

          {/* Productos */}
          {productosFields.map((producto, indexProducto) => (
            <Producto
              key={producto.id}
              control={control}
              producto={producto}
              indexProducto={indexProducto}
              setValue={setValue}
              watch={watch}
              fieldsData={fieldsData} // Pasamos fieldsData aquí
              selectedCategory={selectedCategory} // Pasamos selectedCategory
              selectedSubcategory={selectedSubcategory} // Pasamos selectedSubcategory
            />
          ))}

          {/* Botones */}
          <div className='flex justify-end space-x-2 mt-6'>
            <button
              type='button'
              onClick={() => setIsModalOpen(false)}
              className='bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400'>
              Cancelar
            </button>
            <button
              type='submit'
              disabled={loading}
              className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600'>
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Producto({
  control,
  producto,
  indexProducto,
  setValue,
  watch,
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

      // Obtenemos las características actuales del producto
      const currentFeatures =
        watch(`productos.${indexProducto}.features`) || [];

      // Fusionamos las features actuales con las nuevas
      const mergedFeatures = mergeFeatures(currentFeatures, mappedFeatures);

      // Actualizamos las features del producto
      setValue(`productos.${indexProducto}.features`, mergedFeatures, {
        shouldDirty: true,
      });
    }
  }, [fieldsData]);

  // Función para fusionar las features actuales con las nuevas
  const mergeFeatures = (currentFeatures, newFeatures) => {
    const mergedFeatures = [...newFeatures];

    for (let i = 0; i < mergedFeatures.length; i++) {
      const group = mergedFeatures[i];
      const currentGroup = currentFeatures.find(
        (g) => g.typeDetail === group.typeDetail
      );

      if (currentGroup) {
        for (let j = 0; j < group.entries.length; j++) {
          const entry = group.entries[j];
          const currentEntry = currentGroup.entries.find(
            (e) => e.name === entry.name
          );

          if (currentEntry) {
            // Si existe en las features actuales, mantenemos los valores
            group.entries[j] = currentEntry;
          }
        }
      }
    }

    // Añadir grupos que están en currentFeatures pero no en newFeatures
    currentFeatures.forEach((currentGroup) => {
      const existsInNew = mergedFeatures.find(
        (g) => g.typeDetail === currentGroup.typeDetail
      );
      if (!existsInNew) {
        mergedFeatures.push(currentGroup);
      }
    });

    return mergedFeatures;
  };

  return (
    <div className='mb-6 border p-4 bg-gray-50 rounded relative'>
      {/* Campo para el título del producto */}
      <h2 className='text-xl font-semibold mb-4'>
        Producto {indexProducto + 1}
      </h2>
      <Controller
        name={`productos.${indexProducto}.titulo`}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            className='border p-2 w-full mb-4'
            type='text'
            placeholder={`Título del Producto ${indexProducto + 1}`}
          />
        )}
      />

      {/* Botón para cargar la imagen */}
      <div className='mb-4'>
        <label className='block text-sm font-medium mb-2'>
          Imagen del producto
        </label>
        <Controller
          name={`productos.${indexProducto}.imagen`}
          control={control}
          render={({ field }) => (
            <div>
              <input
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const images = files.map((file) => {
                    return {
                      file,
                      preview: URL.createObjectURL(file),
                    };
                  });
                  field.onChange([...(field.value || []), ...images]);
                }}
                className='block'
              />

              {Array.isArray(field.value) && field.value.length > 0 && (
                <div className='grid grid-cols-3 gap-2'>
                  {field.value.map((image, index) => (
                    <div key={index} className='relative group'>
                      <img
                        width={100}
                        height={100}
                        src={image.preview || image} // Mostrar preview o URL existente
                        alt={`Producto ${indexProducto + 1}`}
                        className='mt-2 w-full h-32 object-cover'
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
        name={`productos.${indexProducto}.features`}
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
            name={`productos.${indexProducto}.marketplaces.${marketplace}`}
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

export default CollectionsPage;
