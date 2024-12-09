export const products = {
  defaultValues: {
    tituloGeneral: "",
    categoria: "",
    subcategoria: "",
    comparativas: [
      {
        titulo: "",
        imagen: [],
        features: [
          {
            typeDetail: "",
            entries: [
              {
                name: "",
                values: [{ type: "text", value: "", unit: "" }],
                inputType: "text",
                skip: false,
              },
            ],
          },
        ],
        marketplaces: {
          amazon: "",
          ebay: "",
          newegg: "",
          walmart: "",
          temu: "",
          aliexpress: "",
          shein: "",
        },
      },
    ],
  },
};
