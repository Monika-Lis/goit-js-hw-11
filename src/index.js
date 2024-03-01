import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '42646310-ef56125427efcfe7b949942a4';
const BASE_URL = 'https://pixabay.com/api/';
const searchForm = document.getElementById('search-form');
const gallery = document.getElementById('gallery');
const loadMoreBtn = document.getElementById('load-more');

let currentPage = 1;
let searchQuery = '';

async function fetchImages(query, page) {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page,
    per_page: 40,
  });

  try {
    const response = await axios.get(`${BASE_URL}?${searchParams}`);
    return response.data;
  } catch (error) {
    Notiflix.Notify.failure('Something went wrong, please try again later.');
  }
}

function updateGallery(hits) {
  const markup = hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <div class="photo-card">
            <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
            <div class="info">
                <p class="info-item"><b>Likes</b> ${likes}</p>
                <p class="info-item"><b>Views</b> ${views}</p>
                <p class="info-item"><b>Comments</b> ${comments}</p>
                <p class="info-item"><b>Downloads</b> ${downloads}</p>
            </div>
        </div>
    `
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  loadMoreBtn.style.display = 'block';
}

async function onSearch(e) {
  e.preventDefault();
  currentPage = 1;
  searchQuery = e.currentTarget.elements.searchQuery.value;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  const data = await fetchImages(searchQuery, currentPage);
  if (data.hits.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    updateGallery(data.hits);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }
}

async function onLoadMore() {
  currentPage += 1;
  const data = await fetchImages(searchQuery, currentPage);
  updateGallery(data.hits);
  if (gallery.children.length >= data.totalHits) {
    loadMoreBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);
