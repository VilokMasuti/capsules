import { useState, useEffect } from "react";
import { fetchData } from "./api";
import { FiSearch } from "react-icons/fi"; // Import search icon from react-icons library

const SearchScreen = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [forms, setForms] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [packings, setPackings] = useState([]);
  const [selectedForm, setSelectedForm] = useState("");
  const [selectedStrength, setSelectedStrength] = useState("");
  const [selectedPacking, setSelectedPacking] = useState("");

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchTerm) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchData(searchTerm);
        setSearchResults(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the API call to prevent rapid firing while typing
    const timeoutId = setTimeout(fetchSearchResults, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    if (
      !searchResults ||
      !searchResults.data ||
      !searchResults.data.saltSuggestions
    ) {
      return;
    }

    const salt = searchResults.data.saltSuggestions[0]; //  the first salt suggestion
    if (!salt || !salt.available_forms) {
      return;
    }

    setForms(salt.available_forms);
    setStrengths(Object.keys(salt.salt_forms_json[salt.available_forms[0]]));
    setPackings(
      Object.keys(
        salt.salt_forms_json[salt.available_forms[0]][
          Object.keys(salt.salt_forms_json[salt.available_forms[0]])[0]
        ]
      )
    );
  }, [searchResults]);

  const handleFormSelection = (form) => {
    setSelectedForm(form);
    setSelectedStrength("");
    setSelectedPacking("");
  };

  const handleStrengthSelection = (strength) => {
    setSelectedStrength(strength);
    setSelectedPacking("");
  };

  const handlePackingSelection = (packing) => {
    setSelectedPacking(packing);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-100 shadow-lg rounded-lg">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
          placeholder="Search for a product"
        />
        <FiSearch className="absolute left-3 top-3 text-gray-500" />
      </div>
      <div className="mt-4">
        {forms.map((form) => (
          <button
            key={form}
            onClick={() => handleFormSelection(form)}
            className={`mr-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 transition duration-300 ${
              selectedForm === form ? "bg-blue-600" : ""
            }`}
          >
            {form}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {strengths.map((strength) => (
          <button
            key={strength}
            onClick={() => handleStrengthSelection(strength)}
            className={`mr-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 transition duration-300 ${
              selectedStrength === strength ? "bg-blue-600" : ""
            }`}
          >
            {strength}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {packings.map((packing) => (
          <button
            key={packing}
            onClick={() => handlePackingSelection(packing)}
            className={`mr-2 mb-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600 transition duration-300 ${
              selectedPacking === packing ? "bg-blue-600" : ""
            }`}
          >
            {packing}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="mt-4 animate-pulse">Loading...</div>
      ) : error ? (
        <div className="mt-4 text-red-500 animate-bounce duration-1000">
          Error: {error}
        </div>
      ) : (
        <div className="mt-4">
          {searchResults && (
            <div className="">
              <h2 className="text-lg font-semibold mb-2">Search Results:</h2>
              {searchResults.data.saltSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border w-full border-gray-300 p-4 rounded-md mb-4"
                >
                  <h3 className="text-lg w-full font-semibold">
                    {suggestion.salt}
                  </h3>
                  <div className="mt-2">
                    <p>
                      <span className="font-semibold">Form:</span>{" "}
                      {suggestion.most_common.Form}
                    </p>
                    <p>
                      <span className="font-semibold">Strength:</span>{" "}
                      {suggestion.most_common.Strength}
                    </p>
                    <p>
                      <span className="font-semibold">Packing:</span>{" "}
                      {suggestion.most_common.Packing}
                    </p>
                    {suggestion.most_common.Form === selectedForm &&
                      suggestion.most_common.Strength === selectedStrength &&
                      suggestion.most_common.Packing === selectedPacking &&
                      suggestion.salt_forms_json[selectedForm][
                        selectedStrength
                      ][selectedPacking] &&
                      suggestion.salt_forms_json[selectedForm][
                        selectedStrength
                      ][selectedPacking].map((product) => (
                        <div
                          key={product.pharmacy_id}
                          className="flex justify-between items-center"
                        >
                          <p>{product.pharmacy_id}</p>
                          {product.selling_price ? (
                            <p>Price: {product.selling_price}</p>
                          ) : (
                            <p>No stores selling this product near you</p>
                          )}
                        </div>
                      ))}
                    <div className="mt-2">
                      <p className="font-semibold">Available Products:</p>
                      {Object.entries(
                        suggestion.salt_forms_json[suggestion.most_common.Form][
                          suggestion.most_common.Strength
                        ][suggestion.most_common.Packing]
                      ).map(([productId, products]) => (
                        <div key={productId}>
                          {products ? (
                            <div className="flex justify-between items-center">
                              <p>{productId}</p>
                              <p>Price: {products[0].selling_price}</p>
                            </div>
                          ) : (
                            <p className="text-red-500 font-semibold">
                              No stores selling this product near you
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchScreen;
