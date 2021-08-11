import React from "react";
import products from "./frontend/products.json";
import "./styles.css";
import * as _ from "lodash";

const data = products.products;

// Ordering products by their postion from the json file by default if no sorting selected.
resetOrder()

// Resets the order of data to match the positions
function resetOrder() {
  data.sort(function (a, b) {
    return a.position - b.position;
  });
}

/**
 * Custom hook that sorts the data depending on which coloum the sorting is applied to.
 * useSOrtableData accepts data, and initial sort state and it returs an object with sorted
 * items and a function to re-sort the items. 
 * @param {list of objects} items: unsorted data
 * @returns sorted data
 */
const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = React.useState(config);
  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (sortConfig.direction === "") {
          return resetOrder();
        }
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    } else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "descending"
    ) {
      direction = "";
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};


/**
 * Renders the table and calls the sorting function.
 * @param {object} props: data that needs to be displayed on the table 
 * @returns html for rendering
 */
const ProductTable = (props) => {
  const { items, requestSort, sortConfig } = useSortableData(props.products);
  const getClassNamesFor = (name) => {
    if (!sortConfig) {
      return;
    }
    return sortConfig.key === name ? sortConfig.direction : undefined;
  };
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th
              onClick={() => requestSort("image")}
              className={getClassNamesFor("image")}
            >
              Image
            </th>
            <th
              onClick={() => requestSort("code")}
              className={getClassNamesFor("code")}
            >
              Code
            </th>
            <th
              onClick={() => requestSort("description")}
              className={getClassNamesFor("description")}
            >
              Description
            </th>
            <th
              onClick={() => requestSort("quantity")}
              className={getClassNamesFor("quantity")}
            >
              In Stock
            </th>
            <th
              onClick={() => requestSort("price")}
              className={getClassNamesFor("price")}
            >
              Price&nbsp;($)
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.code}>
              <td>
                <img
                  // src={01.png}
                  src={`${process.env.PUBLIC_URL}/images/${item.image}`}
                  alt={item.image}
                  width="100"
                  height="50"
                />
              </td>
              <td>{item.code}</td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


/**
 * Similar to sorting data hook, this is search data hook. It accepts data, and optional initial state
 * and returns an object with filterd data from the search.
 * @param {list of object} newItems: data that needs to be filtered
 * @returns filtered data
 */
const useSearchableData = (newItems, config = null) => {
  const [searchConfig, setSearchConfig] = React.useState(config);

  const searchedItems = React.useMemo(()=>{
    let newData = []
      if (searchConfig === "" || searchConfig == null) {
        return data
      } else {
        let dataClone = Object.assign([], data);
        var index;
        do {
          index = _.findIndex(dataClone, function (o) {
            return (
              o.code.toLowerCase().includes(searchConfig.toLowerCase()) ||
              o.description.toLowerCase().includes(searchConfig.toLowerCase()) ||
              String(o.price).includes(searchConfig)
            );
          });
          if (dataClone[index]) {
            newData.push(dataClone[index]);
          }
          dataClone.splice(index, 1);
        } while (index >= 0);
        return newData;
      }
  }, [searchConfig])

  const requestSearch = (event) =>{
    setSearchConfig(event.target.value);
  }
  return {newItems: searchedItems, requestSearch, searchConfig };
}


/**
 * Main search table function that gets the filtered data and sorted items to render table
 * @returns renders table
 */
const SearchTable = () => {
  var { newItems, requestSearch } = useSearchableData(data);
  return (
    <div>
      <input type="text" placeholder="Search" onChange={requestSearch} />
      <ProductTable products={newItems} />
    </div>
  );
};

function App() {
  return (
    <div className="table">
      <SearchTable />
    </div>
  );
}

export default App;
