import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import axios from 'axios';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('.search-inp'),
  searchBtn: document.querySelector('.search-btn'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-btn'),
  loader: document.querySelector('.loader'),
};

const simplyGallery = new SimpleLightbox('.gallery-item a', {
  captionsData: 'alt',
  captionDelay: 250,
});

axios.defaults.baseURL = 'https://pixabay.com/api';
const API_KEY = '41899926-74a7536d4d492e936dbb67b5b';

const queryParams = {
  page: 1,
  query: '',
  maxPage: 0,
  per_page: 40,
};

refs.form.addEventListener('submit', onSearch);
async function onSearch(event) {
  event.preventDefault();
  hideLoadMoreBtn();
  refs.gallery.innerHTML = '';
  queryParams.page = 1;
  queryParams.query = refs.form.query.value.trim();
  if (!queryParams.query) {
    createMessage(
      `The search field can't be empty😉! Please, enter your request!`
    );
    return;
  }
  try {
    showLoader();
    const { hits, totalHits } = await getImages(queryParams);
    queryParams.maxPage = Math.ceil(totalHits / queryParams.per_page);
    createMarkup(hits, refs.gallery);
    simplyGallery.refresh();
    if (hits.length > 0) {
      showLoadMoreBtn();
      refs.loadMoreBtn.addEventListener('click', onLoadMore);
    } else {
      hideLoadMoreBtn();
      createMessage(
        `Sorry, there are no images matching your search query🙃. Please, try again!`
      );
    }
    hideLoader();
  } catch (error) {
    console.log(error);
  } finally {
    refs.form.reset();
    if (queryParams.page === queryParams.maxPage) {
      hideLoadMoreBtn();
      createMessage(
        "We're sorry, but you've reached the end of search results🙃!"
      );
    }
  }
}

async function onLoadMore() {
  queryParams.page += 1;
  try {
    showLoader();
    hideLoadMoreBtn();
    const { hits } = await getImages(queryParams);
    createMarkup(hits, refs.gallery);
    simplyGallery.refresh();
    hideLoader();
    scrollImg();
    showLoadMoreBtn();
  } catch (error) {
    console.log(error);
  } finally {
    if (queryParams.page === queryParams.maxPage) {
      hideLoadMoreBtn();
      createMessage(
        "We're sorry, but you've reached the end of search results🙃!"
      );
    }
  }
}

async function getImages(query, page = 1) {
  showLoader(true);
  return axios
    .get('/', {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        per_page: 40,
        page,
      },
    })
    .then(({ data }) => data);
}

function createMarkup(hits) {
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
      }) =>
        `
        <li class="gallery-item">
  <a class="gallery-link" href="${largeImageURL}">
    <img
      class="gallery-image"
      src="${webformatURL}"
      alt="${tags}"
    />
    <p class="gallery-descr">Likes: <span class="descr-span">${likes}</span> Views: <span class="descr-span">${views}</span> Comments: <span class="descr-span">${comments}</span> Downloads: <span class="descr-span">${downloads}</span></p>
  </a>
</li>`
    )
    .join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  simplyGallery.refresh();
}

function createMessage(message) {
  iziToast.show({
    class: 'error-svg',
    position: 'topRight',
    icon: 'error-svg',
    message: message,
    maxWidth: '432',
    messageColor: '#fff',
    messageSize: '16px',
    backgroundColor: '#EF4040',
    close: false,
    closeOnClick: true,
  });
}

function showLoader(state = true) {
  refs.loader.style.display = !state ? 'none' : 'inline-block';
}

function scrollImg() {
  const rect = document.querySelector('.gallery-link').getBoundingClientRect();
  window.scrollBy({ top: rect.height * 2, left: 0, behavior: 'smooth' });
}
