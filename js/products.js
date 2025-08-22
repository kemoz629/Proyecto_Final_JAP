const ORDER_ASC_BY_COST = "MenorPrecio";
const ORDER_DESC_BY_COST = "MayorPrecio";
const ORDER_BY_SOLD_COUNT = "MasVendidos";

let currentProductsArray = [];
let currentSortCriteria = undefined;
let minPrice = undefined;
let maxPrice = undefined;

function sortProducts(criteria, array) {
    let result = [];
    if (criteria === ORDER_ASC_BY_COST) {
        result = array.sort((a, b) => a.cost - b.cost);
    } else if (criteria === ORDER_DESC_BY_COST) {
        result = array.sort((a, b) => b.cost - a.cost);
    } else if (criteria === ORDER_BY_SOLD_COUNT) {
        result = array.sort((a, b) => b.soldCount - a.soldCount);
    }
    return result;
}

function showProductsList() {
  let htmlContentToAppend = "";
  for (let product of currentProductsArray) {
    if (
      (minPrice === undefined || product.cost >= minPrice) &&
      (maxPrice === undefined || product.cost <= maxPrice)
    ) {
      htmlContentToAppend += `
        <div class="col">
          <div onclick="setProductID(${product.id})" class="card h-100 cursor-active shadow-sm">
            <img src="${product.image}" class="card-img-top" alt="${product.description}">
            <div class="card-body d-flex flex-column justify-content-between">
              <div>
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text">${product.description}</p>
              </div>
              <div class="mt-3">
                <p class="mb-1"><strong>${product.currency} ${product.cost}</strong></p>
                <small class="text-muted">${product.soldCount} vendidos</small>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
  document.getElementById("prod-list-container").innerHTML = htmlContentToAppend;
}

function sortAndShowProducts(sortCriteria, productsArray) {
    currentSortCriteria = sortCriteria;

    if (productsArray !== undefined) {
        currentProductsArray = productsArray;
    }

    currentProductsArray = sortProducts(currentSortCriteria, currentProductsArray);
    showProductsList();
}

function setProductID(id) {
    localStorage.setItem("productID", id);
    window.location = "product-info.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const catID = localStorage.getItem("catID");
    getJSONData(PRODUCTS_URL + catID + EXT_TYPE).then(function (resultObj) {
        if (resultObj.status === "ok") {
            currentProductsArray = resultObj.data.products;
            document.getElementById("cat-title").innerText = resultObj.data.catName;
            showProductsList();
        }
    });

    document.getElementById("sortAsc").addEventListener("click", () => {
        sortAndShowProducts(ORDER_ASC_BY_COST);
    });

    document.getElementById("sortDesc").addEventListener("click", () => {
        sortAndShowProducts(ORDER_DESC_BY_COST);
    });

    document.getElementById("sortByCount").addEventListener("click", () => {
        sortAndShowProducts(ORDER_BY_SOLD_COUNT);
    });

    document.getElementById("clearRangeFilter").addEventListener("click", () => {
        document.getElementById("rangeFilterPriceMin").value = "";
        document.getElementById("rangeFilterPriceMax").value = "";
        minPrice = undefined;
        maxPrice = undefined;
        showProductsList();
    });

    document.getElementById("rangeFilterPrice").addEventListener("click", () => {
        minPrice = parseInt(document.getElementById("rangeFilterPriceMin").value);
        maxPrice = parseInt(document.getElementById("rangeFilterPriceMax").value);

        if (isNaN(minPrice)) minPrice = undefined;
        if (isNaN(maxPrice)) maxPrice = undefined;

        showProductsList();
    });
});