import Pagination from "tui-pagination";
import { deleteFromLS, loadFromLS } from "./localStorage";

import "tui-pagination/dist/tui-pagination.css";
import basketIcon from "../img/icons.svg#icon-trash";

import amazonIcon from "../img/amazon-default.png";
import appleIcon from "../img/book-default.png";
import booksIcon from "../img/book-pile.png";

const PAGE_SIZE = 3;
let pagination;

function getBooksForPage(books, page) {
  const startIndex = (page - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  return books.slice(startIndex, endIndex);
}

function renderShopList(data) {
  const shoppingList = document.querySelector(".shopping-list");

  if (!shoppingList) {
    console.error("Element with class 'shopping-list' not found.");
    return;
  }

  if (data.length === 0) {
    shoppingList.classList.add("empty-page-content");
  } else {
    shoppingList.classList.remove("empty-page-content"); //
    // Render shopping list data here
  }

  shoppingList.innerHTML = "";
  const defaultMarkup = `<p class="shopping-list-empty-text">This page is empty, add some books and proceed to order.</p>
          <img
          class="no-book"
          src="${booksIcon}"
          alt="Book"
          />`;
  const markup = data
    .map(
      ({
        book_image,
        title,
        author,
        _id,
        description,
        list_name,
        buy_links,
      }) => {
        let amazonLink;
        let appleBookLink;

        buy_links.forEach((link) => {
          if (link.name === "Amazon") {
            amazonLink = link.url;
          } else if (link.name === "Apple Books") {
            appleBookLink = link.url;
          }
        });
        return `<li class="one-book">
                  <img
                      class="img-book"
                      src="${book_image}"
                      alt="Book"
                  />
                  <div class="description">
                      <div class="up-part">
                        <h2 class="book-name">${title}</h2>
                        <h3 class="type-name">${list_name}</h3>

                        <button data-id="${_id}" class="basket" type="button">
                            <svg class="trash" width="16" height="16">
                            <use href="./img/icons.svg#icon-trash"></use>
                            </svg>
                        </button>
                      </div>
                      <p class="text-description">
                      ${description}
                      </p>

                      <div class="book-app">
                        <h3 class="name-author">${author}</h3>
                        <div class="book-links">
                          <a href="${amazonLink}" class="book-links-amazon" target="_blank"></a>
                          <a href="${appleBookLink}" class="book-links-applebook" target="_blank"></a>
                        </div>
                      </div>
                  </div>
                  </li>`;
      }
    )
    .join("");

  shoppingList.innerHTML = data.length > 0 ? markup : defaultMarkup;

  const booksItems = document.querySelectorAll(".shopping-list .basket");

  booksItems.forEach((item) => {
    const bookId = item.getAttribute("data-id");
    item.addEventListener("click", () => {
      deleteFromLS(bookId);
      const updatedBooks = loadFromLS();
      let currentPage = pagination.getCurrentPage();

      updatePages(updatedBooks.length);

      if ((currentPage - 1) * PAGE_SIZE >= updatedBooks.length) {
        currentPage -= 1;
        pagination.movePageTo(currentPage);
      } else {
        renderShopList(getBooksForPage(updatedBooks, currentPage));
      }
    });
  });
}

function initPagination(booksCount) {
  pagination = new Pagination("tui-pagination-container", {
    totalItems: booksCount,
    itemsPerPage: PAGE_SIZE,
    visiblePages: 3,
    usageStatistics: false,
  });

  updatePages(booksCount);

  pagination.on("afterMove", function (eventData) {
    const books = loadFromLS();

    updatePages(books.length);
    renderShopList(getBooksForPage(books, eventData.page));
  });
}

function updatePages(booksCount) {
  const paginationContainer = document.getElementById(
    "tui-pagination-container"
  );

  if (booksCount <= PAGE_SIZE) {
    paginationContainer.classList.add("hidden");
  } else {
    paginationContainer.classList.remove("hidden");
  }

  pagination.setTotalItems(booksCount);
}

document.addEventListener("DOMContentLoaded", function () {
  const books = loadFromLS();

  initPagination(books.length);

  renderShopList(getBooksForPage(books, 1));
});

/*****************/

const apiUrl = "https://books-backend.p.goit.global/api/books";

// Функція для отримання списку книг з API
async function fetchBooks() {
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch books");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
}

// Функція для відображення списку книг на сторінці
function renderBooks(books) {
  const bookList = document.querySelector(".book-list");
  if (!bookList) {
    console.error("Element with class 'book-list' not found.");
    return;
  }
  bookList.innerHTML = ""; // Очищення списку книг перед відображенням нових
  if (books.length === 0) {
    bookList.innerHTML = "<p>No books found</p>";
    return;
  }
  books.forEach((book) => {
    const bookItem = document.createElement("div");
    bookItem.classList.add("book-item");

    // Додавання інформації про книгу до елементу
    bookItem.innerHTML = `
      <img src="${book.book_image}" alt="${book.title}" />
      <h2>${book.title}</h2>
      <p>${book.author}</p>
      <p>${book.description}</p>
      <a href="${book.buy_links.amazon_link}" target="_blank">Buy on Amazon</a>
      <a href="${book.buy_links.apple_books_link}" target="_blank">Buy on Apple Books</a>
    `;
    bookList.appendChild(bookItem);
  });
}

// При натисканні кнопки "Show Books" виконується запит і відображення книг
const showBooksButton = document.getElementById("showBooksButton");
showBooksButton.addEventListener("click", async () => {
  const books = await fetchBooks();
  renderBooks(books);
});
