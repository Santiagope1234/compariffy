import { db } from "../../../../firebase";
import { doc, getDoc } from "firebase/firestore";

async function fetchProduct(id) {
  console.log(id);
  try {
    const parametersRef = doc(db, "parameters", id);
    const parametersSnapshot = await getDoc(parametersRef);

    if (parametersSnapshot.exists()) {
      const { categoriaSlug, subcategoriaSlug, tituloSlug } =
        parametersSnapshot.data();

      const productRef = doc(
        db,
        "products",
        categoriaSlug,
        subcategoriaSlug,
        tituloSlug
      );
      const productSnapshot = await getDoc(productRef);

      if (productSnapshot.exists()) {
        return productSnapshot.data();
      } else {
        throw new Error("Producto no encontrado");
      }
    } else {
      throw new Error("Parámetros no encontrados");
    }
  } catch (error) {
    throw new Error("Error al obtener los datos: " + error.message);
  }
}

async function Page({ params }) {
  const { id } = params;

  try {
    const product = await fetchProduct(id);

    return (
      <div className='container mx-auto px-4 py-8'>
        <h1 className='text-4xl font-bold mb-4'>{product.tituloGeneral}</h1>
        <p className='text-lg mb-2'>
          <span className='font-semibold'>Categoría:</span> {product.categoria}
        </p>
        <p className='text-lg mb-8'>
          <span className='font-semibold'>Subcategoría:</span>{" "}
          {product.subcategoria}
        </p>

        {/* Mostrar información del producto */}
        <div className='mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>
            {product["Producto 1"].titulo}
          </h2>
          {product["Producto 1"].imagen && (
            <img
              src={product["Producto 1"].imagen[0]}
              alt={product["Producto 1"].titulo}
              className='w-full max-w-md mb-4'
            />
          )}
          {/* Mostrar características */}
          <div className='mb-8'>
            <h3 className='text-xl font-semibold mb-2'>Características:</h3>
            <ul className='list-disc list-inside'>
              {product["Producto 1"].features.map((feature, index) => (
                <li key={index} className='mb-2'>
                  <span className='font-semibold'>{feature.typeDetail}:</span>{" "}
                  {feature.entries[0].name}:{" "}
                  {feature.entries[0].values[0].value}{" "}
                  {feature.entries[0].values[0].unit}
                </li>
              ))}
            </ul>
          </div>
          {/* Mostrar marketplaces */}
          <div>
            <h3 className='text-xl font-semibold mb-2'>Marketplaces:</h3>
            <ul className='list-disc list-inside'>
              {Object.entries(product["Producto 1"].marketplaces).map(
                ([marketplace, link]) =>
                  link && (
                    <li key={marketplace}>
                      <a
                        href={link}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-500 hover:underline'>
                        {marketplace}
                      </a>
                    </li>
                  )
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className='flex justify-center items-center h-screen'>
        <p className='text-2xl text-red-500'>{error.message}</p>
      </div>
    );
  }
}

export default Page;
