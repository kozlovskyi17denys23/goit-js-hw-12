import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import './css/styles.css';
import { getImagesByQuery } from './js/pixabay-api.js';
import { 
  createGallery, 
  clearGallery, 
  showLoader, 
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton 
} from './js/render-functions.js';

let currentSearchQuery = ''; 
let page = 1;                
const PER_PAGE = 15;

const searchForm = document.getElementById('search-form');
const loadMoreBtn = document.getElementById('load-more-btn');

searchForm.addEventListener('submit', handleSearchSubmit);
loadMoreBtn.addEventListener('click', handleLoadMoreClick);

function handleSearchSubmit(event) {
  event.preventDefault();

  const form = event.currentTarget;
  
  const query = form.elements['search-text'].value.trim();

  if (query === '') {
    iziToast.warning({
      title: 'Caution',
      message: 'Please fill out the search field!',
      position: 'topRight',
    });
    return;
  }

  currentSearchQuery = query;

  clearGallery();
  hideLoadMoreButton();

  page = 1;

  fetchAndRenderImages();

  form.reset();
}

function handleLoadMoreClick() {
  page += 1;
  fetchAndRenderImages(true); 
}

async function fetchAndRenderImages(isLoadMoreAction = false) {
  showLoader();
  hideLoadMoreButton();

  try {
    const data = await getImagesByQuery(currentSearchQuery, page);

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
      });
      return;
    }

    createGallery(data.hits);

    if (isLoadMoreAction) {
      smoothScroll();
    }

    const totalPages = Math.ceil(data.totalHits / PER_PAGE);

    if (page < totalPages) {
      showLoadMoreButton();
    } else {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    }

  } catch (error) {
    console.error(error);
    
    if (isLoadMoreAction) {
      page -= 1;
      showLoadMoreButton();
    }

    iziToast.error({
      title: 'Error',
      message: 'Failed to fetch images. Please check your internet connection or try again later.',
      position: 'topRight',
    });
  } finally {
    hideLoader();
  }
}


function smoothScroll() {
  const galleryItem = document.querySelector('.gallery-item');
  if (!galleryItem) return;

  const { height: cardHeight } = galleryItem.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
